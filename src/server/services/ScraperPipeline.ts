import { db } from '../database.js';
import { RawHtmlStorage } from './RawHtmlStorage.js';
import { ParserEngine } from './ParserEngine.js';
import { Student, PipelineStats, ScrapeConfig } from '../../types.js';

interface FetchJob {
  hallTicket: string;
  portalUrl: string;
  retryCount: number;
}

interface ParseJob {
  hallTicket: string;
  html: string;
}

export class ScraperPipeline {
  private static instance: ScraperPipeline | null = null;

  private status: PipelineStats['status'] = 'idle';
  private fetchQueue: FetchJob[] = [];
  private parseQueue: ParseJob[] = [];
  private dbQueue: Student[] = [];

  private activeFetchWorkers = 0;
  private activeParseWorkers = 0;
  private maxFetchWorkers = 3;
  private maxParseWorkers = 2;
  private dbBatchSize = 5;

  private processedCount = 0;
  private totalCount = 0;
  private foundCount = 0;
  private missingCount = 0;
  private currentHallTicket = '-';

  private startTime: number = 0;
  private lastRateCheckTime: number = 0;
  private lastRateCheckCount: number = 0;
  private itemsPerMinute: number = 0;

  private currentSessionId: string = '';
  private currentCollegeId?: string = '';
  private config: ScrapeConfig = {
    portal_url: '',
    prefix: '',
    start_num: '',
    end_num: '',
    delay_seconds: 0.5,
    headless: true,
    export_excel: true,
    export_csv: true,
    retry_limit: 3
  };

  private constructor() {}

  public static getInstance(): ScraperPipeline {
    if (!ScraperPipeline.instance) {
      ScraperPipeline.instance = new ScraperPipeline();
    }
    return ScraperPipeline.instance;
  }

  public startSession(config: ScrapeConfig, collegeId?: string): void {
    if (this.status === 'running') {
      throw new Error('Scrape pipeline is already running.');
    }

    this.currentCollegeId = collegeId;

    this.config = { ...config };
    this.maxFetchWorkers = config.fetch_workers || 3;
    this.maxParseWorkers = config.parse_workers || 2;
    this.dbBatchSize = config.db_batch_size || 5;

    this.fetchQueue = [];
    this.parseQueue = [];
    this.dbQueue = [];

    this.processedCount = 0;
    this.foundCount = 0;
    this.missingCount = 0;
    this.startTime = Date.now();
    this.lastRateCheckTime = Date.now();
    this.lastRateCheckCount = 0;
    this.itemsPerMinute = 0;
    this.currentSessionId = `SESS_${Date.now()}`;

    // Stage 1: Generate Hall Tickets
    const start = parseInt(config.start_num, 10);
    const end = parseInt(config.end_num, 10);
    const padLen = Math.max(3, config.start_num.length);

    for (let i = start; i <= end; i++) {
      const numStr = String(i).padStart(padLen, '0');
      const ht = `${config.prefix}${numStr}`;
      this.fetchQueue.push({
        hallTicket: ht,
        portalUrl: config.portal_url,
        retryCount: 0
      });
    }

    this.totalCount = this.fetchQueue.length;
    this.status = 'running';

    db.addLog('info', `Pipeline Started: Processing ${this.totalCount} hall tickets with ${this.maxFetchWorkers} Fetch Workers.`);

    // Launch Consumer Workers
    this.runPipelineLoop();
  }

  public pauseSession(): void {
    if (this.status === 'running') {
      this.status = 'paused';
      db.addLog('warning', 'Pipeline Paused by user.');
    }
  }

  public resumeSession(): void {
    if (this.status === 'paused') {
      this.status = 'running';
      db.addLog('info', 'Pipeline Resumed.');
      this.runPipelineLoop();
    }
  }

  public stopSession(): void {
    this.status = 'idle';
    this.fetchQueue = [];
    this.parseQueue = [];
    this.dbQueue = [];
    db.addLog('warning', 'Pipeline Stopped.');
  }

  private async runPipelineLoop() {
    // Spin up Fetch Workers
    for (let i = 0; i < this.maxFetchWorkers; i++) {
      this.startFetchWorker();
    }
    // Spin up Parse Workers
    for (let i = 0; i < this.maxParseWorkers; i++) {
      this.startParseWorker();
    }
    // Spin up DB Batch Writer
    this.startDbBatchWorker();
  }

  private async startFetchWorker() {
    while (this.status === 'running' && (this.fetchQueue.length > 0 || this.activeFetchWorkers > 0)) {
      if (this.fetchQueue.length === 0) {
        await new Promise(res => setTimeout(res, 200));
        continue;
      }

      // Backpressure Check: if Parse Queue or DB Queue is too large, slow down fetching
      if (this.parseQueue.length > 30 || this.dbQueue.length > 40) {
        await new Promise(res => setTimeout(res, 500));
        continue;
      }

      const job = this.fetchQueue.shift();
      if (!job) continue;

      this.activeFetchWorkers++;
      this.currentHallTicket = job.hallTicket;

      try {
        let html: string | null = null;

        // Check Raw Storage cache first
        if (RawHtmlStorage.hasHtml(job.hallTicket)) {
          html = RawHtmlStorage.getHtml(job.hallTicket);
        } else {
          // Delay to respect site rate limits
          if (this.config.delay_seconds > 0) {
            await new Promise(res => setTimeout(res, this.config.delay_seconds * 1000));
          }

          html = await this.fetchHtmlFromPortal(job.hallTicket, job.portalUrl);

          // Save raw html to disk
          if (html) {
            RawHtmlStorage.saveHtml(job.hallTicket, html);
          }
        }

        if (html) {
          this.parseQueue.push({ hallTicket: job.hallTicket, html });
        } else if (job.retryCount < this.config.retry_limit) {
          job.retryCount++;
          this.fetchQueue.push(job); // re-queue for retry
        } else {
          // Mark missing on total fetch failure
          const missing = ParserEngine.parse('', job.hallTicket);
          this.dbQueue.push(missing);
        }
      } catch (err: any) {
        db.addLog('error', `Fetch error for ${job.hallTicket}: ${err.message}`, job.hallTicket);
      } finally {
        this.activeFetchWorkers--;
      }
    }
  }

  private async fetchHtmlFromPortal(hallTicket: string, portalUrl: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const bodyData = new URLSearchParams({
        htno: hallTicket,
        btnSubmit: 'Submit'
      });

      const response = await fetch(portalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: bodyData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.text();
      }
    } catch (_) {
      // Return null on failure to fall back to parser mock or retry
    }
    return null;
  }

  private async startParseWorker() {
    while (this.status === 'running' || this.parseQueue.length > 0) {
      if (this.parseQueue.length === 0) {
        await new Promise(res => setTimeout(res, 150));
        if (this.fetchQueue.length === 0 && this.activeFetchWorkers === 0) break;
        continue;
      }

      const job = this.parseQueue.shift();
      if (!job) continue;

      this.activeParseWorkers++;
      try {
        const student = ParserEngine.parse(job.html, job.hallTicket);
        this.dbQueue.push(student);
      } catch (err: any) {
        db.addLog('error', `Parse error for ${job.hallTicket}: ${err.message}`, job.hallTicket);
      } finally {
        this.activeParseWorkers--;
      }
    }
  }

  private async startDbBatchWorker() {
    while (
      this.status === 'running' ||
      this.dbQueue.length > 0 ||
      this.fetchQueue.length > 0 ||
      this.parseQueue.length > 0
    ) {
      if (this.dbQueue.length === 0) {
        await new Promise(res => setTimeout(res, 200));
        if (
          this.fetchQueue.length === 0 &&
          this.parseQueue.length === 0 &&
          this.activeFetchWorkers === 0 &&
          this.activeParseWorkers === 0
        ) {
          break;
        }
        continue;
      }

      // Extract batch
      const batch = this.dbQueue.splice(0, this.dbBatchSize);

      for (const student of batch) {
        if (!student) continue;
        db.saveStudent(student, this.currentCollegeId);
        this.processedCount++;
        if (student.is_missing) {
          this.missingCount++;
        } else {
          this.foundCount++;
        }
      }

      // Update Throughput Rate Metrics
      const now = Date.now();
      const elapsedMinutes = (now - this.lastRateCheckTime) / 60000;
      if (elapsedMinutes >= 0.05) {
        const deltaItems = this.processedCount - this.lastRateCheckCount;
        this.itemsPerMinute = Math.round(deltaItems / elapsedMinutes);
        this.lastRateCheckTime = now;
        this.lastRateCheckCount = this.processedCount;
      }

      // Check Completion
      if (this.processedCount >= this.totalCount) {
        this.status = 'completed';
        db.addLog('success', `Pipeline Completed! Processed ${this.processedCount} students (${this.foundCount} found, ${this.missingCount} missing).`);
        break;
      }
    }
  }

  public getStats(): PipelineStats {
    const elapsedSeconds = this.startTime > 0 ? Math.round((Date.now() - this.startTime) / 1000) : 0;
    const remainingCount = this.totalCount - this.processedCount;
    const itemsPerSecond = this.itemsPerMinute > 0 ? this.itemsPerMinute / 60 : 0.5;
    const estimatedSeconds = remainingCount > 0 && itemsPerSecond > 0 ? Math.round(remainingCount / itemsPerSecond) : 0;

    return {
      status: this.status,
      fetch_queue_size: this.fetchQueue.length,
      parse_queue_size: this.parseQueue.length,
      db_queue_size: this.dbQueue.length,
      active_fetch_workers: this.activeFetchWorkers,
      active_parse_workers: this.activeParseWorkers,
      processed_tickets: this.processedCount,
      total_tickets: this.totalCount,
      found_count: this.foundCount,
      missing_count: this.missingCount,
      cached_html_count: RawHtmlStorage.getCount(),
      current_hall_ticket: this.currentHallTicket,
      items_per_minute: this.itemsPerMinute || Math.round((this.processedCount / Math.max(1, elapsedSeconds)) * 60),
      elapsed_seconds: elapsedSeconds,
      estimated_seconds_remaining: estimatedSeconds,
      current_session_id: this.currentSessionId
    };
  }

  public async reparseAllCachedHtml(): Promise<{ reprocessed: number }> {
    const items = RawHtmlStorage.listAll();
    let reprocessed = 0;

    for (const item of items) {
      const html = RawHtmlStorage.getHtml(item.hall_ticket);
      if (html) {
        const student = ParserEngine.parse(html, item.hall_ticket);
        db.saveStudent(student);
        reprocessed++;
      }
    }

    db.addLog('info', `Re-parsed ${reprocessed} cached raw HTML documents into database.`);
    return { reprocessed };
  }
}

export const pipeline = ScraperPipeline.getInstance();
