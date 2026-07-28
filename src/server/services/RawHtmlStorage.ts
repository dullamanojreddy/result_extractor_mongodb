import fs from 'fs';
import path from 'path';
import { RawHtmlItem } from '../../types.js';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'raw');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class RawHtmlStorage {
  public static saveHtml(hallTicket: string, htmlContent: string): string {
    const filename = `${hallTicket}.html`;
    const filePath = path.join(STORAGE_DIR, filename);
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    return filePath;
  }

  public static getHtml(hallTicket: string): string | null {
    const filePath = path.join(STORAGE_DIR, `${hallTicket}.html`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  }

  public static hasHtml(hallTicket: string): boolean {
    const filePath = path.join(STORAGE_DIR, `${hallTicket}.html`);
    return fs.existsSync(filePath);
  }

  public static listAll(): RawHtmlItem[] {
    try {
      if (!fs.existsSync(STORAGE_DIR)) return [];
      const files = fs.readdirSync(STORAGE_DIR);
      return files
        .filter(f => f.endsWith('.html'))
        .map(file => {
          const filePath = path.join(STORAGE_DIR, file);
          const stats = fs.statSync(filePath);
          return {
            hall_ticket: file.replace('.html', ''),
            filename: file,
            size_bytes: stats.size,
            updated_at: stats.mtime.toISOString()
          };
        });
    } catch {
      return [];
    }
  }

  public static getCount(): number {
    try {
      if (!fs.existsSync(STORAGE_DIR)) return 0;
      return fs.readdirSync(STORAGE_DIR).filter(f => f.endsWith('.html')).length;
    } catch {
      return 0;
    }
  }

  public static clearAll(): void {
    if (fs.existsSync(STORAGE_DIR)) {
      const files = fs.readdirSync(STORAGE_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(STORAGE_DIR, file));
      }
    }
  }
}
