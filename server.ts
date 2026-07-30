import dotenv from "dotenv";
dotenv.config();
console.log({
  mongoDatabase: process.env.MONGO_DATABASE,
  useMongoDB: process.env.USE_MONGODB,
});

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/database.js';
import { env } from './src/server/config/env.js';
import { fetchStudentResult } from './src/server/scraper.js';
import { generateExcelBuffer, generateCsvString } from './src/server/exporter.js';
import { pipeline } from './src/server/services/ScraperPipeline.js';
import { AnalyticsService } from './src/server/services/AnalyticsService.js';
import { RawHtmlStorage } from './src/server/services/RawHtmlStorage.js';
import { Student } from './src/types.js';
import { authMiddleware, AuthRequest, adminOnly } from './src/server/middleware/auth.js';
import authRoutes from './src/server/routes/auth.js';
import collegeRoutes from './src/server/routes/colleges.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  // Initialize MongoDB connection and log result
  const mongoResult = await db.initMongoDB();
  console.log('MongoDB Init Result:', mongoResult);

  const status = db.getMongoDBStatus();
  console.log('MongoDB Status:', status);

  const app = express();

  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://result-extractor-mongodb.onrender.com',
      /\.vercel\.app$/
    ],
    credentials: true
  }));

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

  // Connect Mongoose for auth models
  try {
    await mongoose.connect(process.env.MONGO_URI || env.mongoUri);
    console.log('Mongoose connected for auth');
  } catch (err) {
    console.error('Mongoose connection error:', err);
  }

  // Auth routes (public - no auth required)
  app.use('/api/auth', authRoutes);
  app.use('/api/colleges', collegeRoutes);

  // Pipeline Routes (protected - college isolated)
  app.post('/api/pipeline/start', authMiddleware, (req: AuthRequest, res) => {
    try {
      const config = req.body;
      pipeline.startSession(config, req.user?.collegeId);
      res.json({ success: true, message: 'Pipeline session started' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/pipeline/pause', authMiddleware, (_req, res) => {
    pipeline.pauseSession();
    res.json({ success: true, message: 'Pipeline paused' });
  });

  app.post('/api/pipeline/resume', authMiddleware, (_req, res) => {
    pipeline.resumeSession();
    res.json({ success: true, message: 'Pipeline resumed' });
  });

  app.post('/api/pipeline/stop', authMiddleware, (_req, res) => {
    pipeline.stopSession();
    res.json({ success: true, message: 'Pipeline stopped' });
  });

  app.get('/api/pipeline/stats', authMiddleware, (_req, res) => {
    res.json(pipeline.getStats());
  });

  // Analytics Routes (protected - admin only, college isolated)
  app.get('/api/analytics/advanced', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    res.json(await AnalyticsService.getAdvancedAnalytics(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin'));
  });

  app.get('/api/analytics/subject', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    const query = (req.query.q as string) || '';
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }
    res.json(await AnalyticsService.getSubjectAnalytics(query, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin'));
  });

  // Individual Student Lookup (protected - college isolated)
  app.get('/api/student/:hallTicket', authMiddleware, async (req: AuthRequest, res) => {
    const ht = req.params.hallTicket;
    const collegeId = req.user?.collegeId;
    let student = await db.getStudentByHallTicket(ht, collegeId);
    if (!student) {
      try {
        student = await fetchStudentResult(ht, undefined, 0, collegeId, req.user?.userId);
      } catch (err: any) {
        res.status(404).json({ error: `Student ${ht} not found` });
        return;
      }
    }
    res.json(student);
  });

  // Get all students (protected - college isolated)
  app.get('/api/students', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const all = await db.getAllStudents(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
      res.json(all);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch students' });
    }
  });

  // Raw HTML Cache Management (protected - admin only)
  app.get('/api/raw-html/list', authMiddleware, adminOnly, (_req, res) => {
    res.json(RawHtmlStorage.listAll());
  });

  app.get('/api/raw-html/view/:hallTicket', authMiddleware, adminOnly, (req, res) => {
    const html = RawHtmlStorage.getHtml(req.params.hallTicket);
    if (html) {
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).json({ error: 'Cached raw HTML not found' });
    }
  });

  app.post('/api/raw-html/reparse', authMiddleware, adminOnly, async (_req, res) => {
    const result = await pipeline.reparseAllCachedHtml();
    res.json(result);
  });

  // Class Result Route (protected - college isolated)
  app.post('/api/class-result', authMiddleware, async (req: AuthRequest, res) => {
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
          const cached = await db.getStudentByHallTicket(ht, req.user?.collegeId);
          if (cached) {
            await db.associateStudentWithUser(ht, req.user?.userId);
            results.push(cached);
            continue;
          }
        }

        // Fetch missing ticket from portal
        const student = await fetchStudentResult(ht, portal_url, delay, req.user?.collegeId, req.user?.userId);
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

  // Subject Wise Result Route (protected - college isolated)
  app.post('/api/subject-result', authMiddleware, async (req: AuthRequest, res) => {
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

      let matches = await db.getStudentsBySubject(subject_name, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');

      // If no matches found and auto_fetch_missing is enabled, fetch specified range first
      if (matches.length === 0 && auto_fetch_missing) {
        await db.addLog('info', `No local matches found for "${subject_name}". Initiating automatic range fetch for ${prefix}${start} to ${prefix}${end}...`);

        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);
        const padLen = start.length;

        for (let i = startNum; i <= endNum; i++) {
          const numStr = String(i).padStart(padLen, '0');
          const ht = `${prefix}${numStr}`;
          if (!await db.getStudentByHallTicket(ht, req.user?.collegeId)) {
            await fetchStudentResult(ht, undefined, 100, req.user?.collegeId, req.user?.userId);
          }
        }

        // Re-query database
        matches = await db.getStudentsBySubject(subject_name, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
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

  // Export Excel (protected - college isolated)
  app.get('/api/export/excel', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const prefix = (req.query.prefix as string) || '1602-24-737-';
      const start = (req.query.start as string) || '001';
      const end = (req.query.end as string) || '120';

      let students = await db.getStudentsByRange(prefix, start, end, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
      if (students.length === 0) {
        students = await db.getAllStudents(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
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

  // Export CSV (protected - college isolated)
  app.get('/api/export/csv', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const prefix = (req.query.prefix as string) || '1602-24-737-';
      const start = (req.query.start as string) || '001';
      const end = (req.query.end as string) || '120';

      let students = await db.getStudentsByRange(prefix, start, end, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
      if (students.length === 0) {
        students = await db.getAllStudents(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
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

  // Export JSON (protected - college isolated)
  app.get('/api/export/json', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const prefix = (req.query.prefix as string) || '1602-24-737-';
      const start = (req.query.start as string) || '001';
      const end = (req.query.end as string) || '120';

      let students = await db.getStudentsByRange(prefix, start, end, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
      if (students.length === 0) {
        students = await db.getAllStudents(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin');
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="Results_${prefix}${start}_${end}.json"`);
      res.send(JSON.stringify(students, null, 2));
      await db.addLog('info', `JSON export generated for ${students.length} students.`);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate JSON file' });
    }
  });

  // Get Stats (protected - college isolated)
  app.get('/api/stats', authMiddleware, async (req: AuthRequest, res) => {
    res.json(await db.getStats(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin'));
  });

  // Get Unique Subject Names for Suggestions (protected - college isolated)
  app.get('/api/unique-subjects', authMiddleware, async (req: AuthRequest, res) => {
    res.json(await db.getUniqueSubjectNames(req.user?.collegeId, req.user?.userId, req.user?.role === 'admin'));
  });

  // Search Subject (direct query from student_subjects table - protected)
  app.get('/api/search-subject', authMiddleware, async (req: AuthRequest, res) => {
    const query = (req.query.q as string) || '';
    if (!query) {
      res.json([]);
      return;
    }
    res.json(await db.getStudentsBySubject(query, req.user?.collegeId, req.user?.userId, req.user?.role === 'admin'));
  });

  // Recent Students (last 5 fetched records - protected)
  app.get('/api/recent-students', authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (db.mongoDb && db.mongoConnected) {
        const query: any = { is_missing: 0 };
        if (req.user?.collegeId) {
          query.collegeId = req.user.collegeId;
        }
        if (req.user?.userId && req.user?.role !== 'admin') {
          query.userIds = req.user.userId;
        }
        const rows = await db.mongoDb.collection('students')
          .find(query)
          .sort({ created_at: -1 })
          .limit(5)
          .toArray();
        const recent = [];
        for (const r of rows) {
          const s = await db.getStudentByHallTicket(r.hall_ticket, req.user?.collegeId);
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

  // Filtered Subject Results with Range (protected)
  app.get('/api/subject-filtered', authMiddleware, async (req: AuthRequest, res) => {
    const subjectName = (req.query.subject as string) || '';
    const prefix = (req.query.prefix as string) || '1602-24-737-';
    const start = (req.query.start as string) || '001';
    const end = (req.query.end as string) || '030';
    
    if (!subjectName) {
      res.status(400).json({ error: 'Subject name is required' });
      return;
    }
    
    res.json(await db.getFilteredSubjectResults(subjectName, prefix, start, end, req.user?.collegeId));
  });

  // Get Logs (protected - admin only)
  app.get('/api/logs', authMiddleware, adminOnly, async (_req, res) => {
    res.json(await db.getLogs());
  });

  // Clear Logs (protected - admin only)
  app.post('/api/logs/clear', authMiddleware, adminOnly, async (_req, res) => {
    await db.clearLogs();
    res.json({ message: 'Logs cleared' });
  });

  // Database Clear (protected - admin only)
  app.post('/api/db/clear', authMiddleware, adminOnly, async (_req, res) => {
    await db.clearDatabase();
    res.json({ message: 'Database cleared' });
  });

  // Delete specific student by ID or Hall Ticket (protected - admin only)
  app.delete('/api/students/:id', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'ID or Hall Ticket is required' });
      }

      if (db.mongoDb && db.mongoConnected) {
        let query: any;
        if (mongoose.Types.ObjectId.isValid(id)) {
          query = { _id: new mongoose.Types.ObjectId(id) };
        } else {
          query = { hall_ticket: id };
        }

        const student = await db.mongoDb.collection('students').findOne(query);
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }

        const hallTicket = student.hall_ticket;
        await db.mongoDb.collection('student_subjects').deleteMany({ hall_ticket: hallTicket });
        await db.mongoDb.collection('students').deleteOne({ hall_ticket: hallTicket });

        await db.addLog('info', `Deleted student record ${hallTicket} via DELETE route.`);
        res.json({ success: true, message: `Successfully deleted student ${hallTicket}.` });
      } else {
        res.status(500).json({ error: 'Database not connected' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Deletion failed' });
    }
  });

  // Delete specific students (protected - admin only)
  app.post('/api/students/delete', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { hall_tickets } = req.body;
      if (!Array.isArray(hall_tickets) || hall_tickets.length === 0) {
        res.status(400).json({ error: 'hall_tickets array is required' });
        return;
      }

      if (db.mongoDb && db.mongoConnected) {
        await db.mongoDb.collection('student_subjects').deleteMany({ hall_ticket: { $in: hall_tickets } });
        await db.mongoDb.collection('students').deleteMany({ hall_ticket: { $in: hall_tickets } });
        
        await db.addLog('info', `Deleted ${hall_tickets.length} student records.`);
        res.json({ success: true, message: `Successfully deleted ${hall_tickets.length} records.` });
      } else {
        res.status(500).json({ error: 'Database not connected' });
      }
    } catch (err: any) {
      res.status(550).json({ error: err.message || 'Deletion failed' });
    }
  });

  // MongoDB Status
  app.get('/api/mongodb/status', (_req, res) => {
    res.json(db.getMongoDBStatus());
  });

  // Connect to MongoDB
  app.post('/api/mongodb/connect', async (req, res) => {
    try {
      const { uri, database, enabled } = req.body;
      const result = await db.initMongoDB({
        uri: uri || 'mongodb://localhost:27017',
        database: database || 'vce_results',
        enabled: enabled !== undefined ? enabled : true
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to connect to MongoDB' });
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
    console.log(`VCE Result Analyzer Server running on port ${PORT}`);
  });
}

startServer();
