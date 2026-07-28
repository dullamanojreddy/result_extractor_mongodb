import dotenv from "dotenv";
dotenv.config();
console.log({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/database.js';
import { fetchStudentResult } from './src/server/scraper.js';
import { generateExcelBuffer, generateCsvString } from './src/server/exporter.js';
import { pipeline } from './src/server/services/ScraperPipeline.js';
import { AnalyticsService } from './src/server/services/AnalyticsService.js';
import { RawHtmlStorage } from './src/server/services/RawHtmlStorage.js';
import { Student } from './src/types.js';

const PORT = 3000;

async function startServer() {
  // Initialize MySQL connection and log result
  const mysqlResult = await db.initMySQL();
  console.log('MySQL Init Result:', mysqlResult);

  const status = db.getMySQLStatus();
  console.log('MySQL Status:', status);

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Disable caching for all API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // API Routes

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Pipeline Routes
  app.post('/api/pipeline/start', (req, res) => {
    try {
      const config = req.body;
      pipeline.startSession(config);
      res.json({ success: true, message: 'Pipeline session started' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/pipeline/pause', (_req, res) => {
    pipeline.pauseSession();
    res.json({ success: true, message: 'Pipeline paused' });
  });

  app.post('/api/pipeline/resume', (_req, res) => {
    pipeline.resumeSession();
    res.json({ success: true, message: 'Pipeline resumed' });
  });

  app.post('/api/pipeline/stop', (_req, res) => {
    pipeline.stopSession();
    res.json({ success: true, message: 'Pipeline stopped' });
  });

  app.get('/api/pipeline/stats', (_req, res) => {
    res.json(pipeline.getStats());
  });

  // Analytics Routes
  app.get('/api/analytics/advanced', async (_req, res) => {
    res.json(await AnalyticsService.getAdvancedAnalytics());
  });

  app.get('/api/analytics/subject', async (req, res) => {
    const query = (req.query.q as string) || '';
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }
    res.json(await AnalyticsService.getSubjectAnalytics(query));
  });

  // Individual Student Lookup
  app.get('/api/student/:hallTicket', async (req, res) => {
    const ht = req.params.hallTicket;
    let student = await db.getStudentByHallTicket(ht);
    if (!student) {
      try {
        student = await fetchStudentResult(ht, undefined, 0);
      } catch (err: any) {
        res.status(404).json({ error: `Student ${ht} not found` });
        return;
      }
    }
    res.json(student);
  });

  // Get all students
  app.get('/api/students', async (_req, res) => {
    try {
      const all = await db.getAllStudents();
      res.json(all);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch students' });
    }
  });

  // Raw HTML Cache Management
  app.get('/api/raw-html/list', (_req, res) => {
    res.json(RawHtmlStorage.listAll());
  });

  app.get('/api/raw-html/view/:hallTicket', (req, res) => {
    const html = RawHtmlStorage.getHtml(req.params.hallTicket);
    if (html) {
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).json({ error: 'Cached raw HTML not found' });
    }
  });

  app.post('/api/raw-html/reparse', async (_req, res) => {
    const result = await pipeline.reparseAllCachedHtml();
    res.json(result);
  });

  // Class Result Route
  app.post('/api/class-result', async (req, res) => {
    try {
      const {
        prefix = '',
        start = '',
        end = '',
        portal_url = '',
        delay = 200,
        force_refresh = false
      } = req.body;

      const startNum = parseInt(start, 10);
      const endNum = parseInt(end, 10);
      const padLen = Math.max(3, start.length);

      if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
        res.status(400).json({ error: 'Invalid start or end hall ticket number' });
        return;
      }

      const tickets: string[] = [];
      for (let i = startNum; i <= endNum; i++) {
        const numStr = String(i).padStart(padLen, '0');
        tickets.push(`${prefix}${numStr}`);
      }

      await db.addLog('info', `Class Result requested for range ${tickets[0]} to ${tickets[tickets.length - 1]} (${tickets.length} tickets).`);

      const results: Student[] = [];

      for (const ht of tickets) {
        if (!force_refresh) {
          const cached = await db.getStudentByHallTicket(ht);
          if (cached) {
            results.push(cached);
            continue;
          }
        }

        // Fetch missing ticket from portal
        const student = await fetchStudentResult(ht, portal_url, delay);
        results.push(student);
        await db.saveCheckpoint(ht, tickets[tickets.length - 1], prefix);
      }

      await db.clearCheckpoint();
      res.json({
        total: results.length,
        found: results.filter(s => s && !s.is_missing).length,
        missing: results.filter(s => s && s.is_missing).length,
        students: results
      });
    } catch (err: any) {
      db.addLog('error', `Class Result processing failed: ${err.message || err}`);
      res.status(500).json({ error: err.message || 'Scraping failed' });
    }
  });

  // Subject Wise Result Route
  app.post('/api/subject-result', async (req, res) => {
    try {
      const {
        subject_name,
        prefix = '',
        start = '',
        end = '',
        auto_fetch_missing = true
      } = req.body;

      if (!subject_name || !subject_name.trim()) {
        res.status(400).json({ error: 'Subject name is required' });
        return;
      }

      await db.addLog('info', `Subject Result search for "${subject_name.trim()}".`);

      let matches = await db.getStudentsBySubject(subject_name);

      // If no matches found and auto_fetch_missing is enabled, fetch specified range first
      if (matches.length === 0 && auto_fetch_missing) {
        await db.addLog('info', `No local matches found for "${subject_name}". Initiating automatic range fetch for ${prefix}${start} to ${prefix}${end}...`);

        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);
        const padLen = start.length;

        for (let i = startNum; i <= endNum; i++) {
          const numStr = String(i).padStart(padLen, '0');
          const ht = `${prefix}${numStr}`;
          if (!await db.getStudentByHallTicket(ht)) {
            await fetchStudentResult(ht, undefined, 100);
          }
        }

        // Re-query database
        matches = await db.getStudentsBySubject(subject_name);
      }

      res.json({
        subject_query: subject_name,
        match_count: matches.length,
        results: matches
      });
    } catch (err: any) {
      db.addLog('error', `Subject search failed: ${err.message || err}`);
      res.status(500).json({ error: err.message || 'Subject query failed' });
    }
  });

  // Export Excel
  app.get('/api/export/excel', async (req, res) => {
    try {
      const prefix = (req.query.prefix as string) || '1602-24-737-';
      const start = (req.query.start as string) || '001';
      const end = (req.query.end as string) || '120';

      let students = await db.getStudentsByRange(prefix, start, end);
      if (students.length === 0) {
        students = await db.getAllStudents();
      }

      const buffer = generateExcelBuffer(students);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Results_${prefix}${start}_${end}.xlsx"`);
      res.send(buffer);
      await db.addLog('info', `Excel export generated for ${students.length} students.`);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate Excel file' });
    }
  });

  // Export CSV
  app.get('/api/export/csv', async (req, res) => {
    try {
      const prefix = (req.query.prefix as string) || '1602-24-737-';
      const start = (req.query.start as string) || '001';
      const end = (req.query.end as string) || '120';

      let students = await db.getStudentsByRange(prefix, start, end);
      if (students.length === 0) {
        students = await db.getAllStudents();
      }

      const csvContent = generateCsvString(students);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="Results_${prefix}${start}_${end}.csv"`);
      res.send(csvContent);
      await db.addLog('info', `CSV export generated for ${students.length} students.`);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate CSV file' });
    }
  });

  // Export JSON
  app.get('/api/export/json', async (req, res) => {
    try {
      const prefix = (req.query.prefix as string) || '1602-24-737-';
      const start = (req.query.start as string) || '001';
      const end = (req.query.end as string) || '120';

      let students = await db.getStudentsByRange(prefix, start, end);
      if (students.length === 0) {
        students = await db.getAllStudents();
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="Results_${prefix}${start}_${end}.json"`);
      res.send(JSON.stringify(students, null, 2));
      await db.addLog('info', `JSON export generated for ${students.length} students.`);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate JSON file' });
    }
  });

  // Get Stats
  app.get('/api/stats', async (_req, res) => {
    res.json(await db.getStats());
  });

  // Get Unique Subject Names for Suggestions
  app.get('/api/unique-subjects', async (_req, res) => {
    res.json(await db.getUniqueSubjectNames());
  });

  // Search Subject (direct query from student_subjects table)
  app.get('/api/search-subject', async (req, res) => {
    const query = (req.query.q as string) || '';
    if (!query) {
      res.json([]);
      return;
    }
    res.json(await db.getStudentsBySubject(query));
  });

  // Recent Students (last 5 fetched records)
  app.get('/api/recent-students', async (_req, res) => {
    try {
      if (db.mysqlPool && db.mysqlConnected) {
        const [rows] = await db.mysqlPool.query<any[]>(
          'SELECT hall_ticket FROM students WHERE is_missing = 0 ORDER BY created_at DESC LIMIT 5'
        );
        const recent = [];
        for (const r of rows) {
          const s = await db.getStudentByHallTicket(r.hall_ticket);
          if (s) recent.push(s);
        }
        res.json(recent);
      } else {
        res.json([]);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Filtered Subject Results with Range
  app.get('/api/subject-filtered', async (req, res) => {
    const subjectName = (req.query.subject as string) || '';
    const prefix = (req.query.prefix as string) || '1602-24-737-';
    const start = (req.query.start as string) || '001';
    const end = (req.query.end as string) || '030';
    
    if (!subjectName) {
      res.status(400).json({ error: 'Subject name is required' });
      return;
    }
    
    res.json(await db.getFilteredSubjectResults(subjectName, prefix, start, end));
  });

  // Get Logs
  app.get('/api/logs', async (_req, res) => {
    res.json(await db.getLogs());
  });

  // Clear Logs
  app.post('/api/logs/clear', async (_req, res) => {
    await db.clearLogs();
    res.json({ message: 'Logs cleared' });
  });

  // Database Clear
  app.post('/api/db/clear', async (_req, res) => {
    await db.clearDatabase();
    res.json({ message: 'Database cleared' });
  });

  // Delete specific students
  app.post('/api/students/delete', async (req, res) => {
    try {
      const { hall_tickets } = req.body;
      if (!Array.isArray(hall_tickets) || hall_tickets.length === 0) {
        res.status(400).json({ error: 'hall_tickets array is required' });
        return;
      }

      if (db.mysqlPool && db.mysqlConnected) {
        await db.mysqlPool.query(
          'DELETE FROM student_subjects WHERE hall_ticket IN (?)',
          [hall_tickets]
        );
        await db.mysqlPool.query(
          'DELETE FROM students WHERE hall_ticket IN (?)',
          [hall_tickets]
        );
        
        await db.addLog('info', `Deleted ${hall_tickets.length} student records.`);
        res.json({ success: true, message: `Successfully deleted ${hall_tickets.length} records.` });
      } else {
        res.status(500).json({ error: 'Database not connected' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Deletion failed' });
    }
  });

  // MySQL Status
  app.get('/api/mysql/status', (_req, res) => {
    res.json(db.getMySQLStatus());
  });

  // Connect to MySQL
  app.post('/api/mysql/connect', async (req, res) => {
    try {
      const { host, port, user, password, database, enabled } = req.body;
      const result = await db.initMySQL({
        host: host || 'localhost',
        port: parseInt(port, 10) || 3306,
        user: user || 'root',
        password: password || '',
        database: database || 'vce_results',
        enabled: enabled !== undefined ? enabled : true
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to connect to MySQL' });
    }
  });

  // Get Docs
  app.get('/api/docs/:docName', (req, res) => {
    const docName = req.params.docName;
    const filePath = path.join(process.cwd(), 'docs', `${docName}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ docName, content });
    } else {
      res.status(404).json({ error: 'Doc file not found' });
    }
  });

  // List all available docs
  app.get('/api/docs-list', (_req, res) => {
    const docsDir = path.join(process.cwd(), 'docs');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
      res.json(files.map(f => f.replace('.md', '')));
    } else {
      res.json([]);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VCE Result Analyzer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
