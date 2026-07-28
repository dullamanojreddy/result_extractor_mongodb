import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { Student, Subject, MandatoryRequirement, LogEntry, DatabaseStats, MySQLConfig } from '../types.js';
import { env } from './config/env.js';

interface DBData {
  students: Record<string, Student>;
  logs: LogEntry[];
  checkpoint: {
    last_hall_ticket: string;
    end_hall_ticket: string;
    prefix: string;
  } | null;
}

class DatabaseService {
  public mysqlPool: mysql.Pool | null = null;
  public mysqlConnected: boolean = false;
  private mysqlConfig: MySQLConfig = {
    host: env.mysqlHost,
    port: env.mysqlPort,
    user: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDatabase,
    enabled: env.useMysql
  };

  constructor() {
    // No local data loading - MySQL is the single source of truth
  }

  // Initialize MySQL Connection & Schema
  public async initMySQL(customConfig?: MySQLConfig): Promise<{ success: boolean; message: string }> {
    if (customConfig) {
      this.mysqlConfig = { ...customConfig };
    }

    if (this.mysqlPool) {
      try {
        await this.mysqlPool.end();
      } catch (_) {}
      this.mysqlPool = null;
    }

    try {
      // Create connection pool
      this.mysqlPool = mysql.createPool({
        host: this.mysqlConfig.host,
        port: this.mysqlConfig.port,
        user: this.mysqlConfig.user,
        password: this.mysqlConfig.password || '',
        database: this.mysqlConfig.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000
      });

      // Test connection
      const connection = await this.mysqlPool.getConnection();
      connection.release();

      // Auto-Create Schema in MySQL if not present
      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hall_ticket VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(255) DEFAULT '-',
          father_name VARCHAR(255) DEFAULT '-',
          course VARCHAR(255) DEFAULT '-',
          exam VARCHAR(255) DEFAULT '-',
          sgpa VARCHAR(20) DEFAULT '-',
          cgpa VARCHAR(20) DEFAULT '-',
          is_missing TINYINT(1) DEFAULT 0,
          subjects JSON DEFAULT NULL,
          mandatory_requirements JSON DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_hall_ticket (hall_ticket)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Drop and recreate logs table to ensure correct schema
      await this.mysqlPool.query('DROP TABLE IF EXISTS logs');
      
      await this.mysqlPool.query(`
        CREATE TABLE logs (
          id VARCHAR(50) PRIMARY KEY,
          timestamp VARCHAR(50) NOT NULL,
          type VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          hall_ticket VARCHAR(50) DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS checkpoints (
          id INT AUTO_INCREMENT PRIMARY KEY,
          last_hall_ticket VARCHAR(50) NOT NULL,
          end_hall_ticket VARCHAR(50) NOT NULL,
          prefix VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_prefix (prefix)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create student_subjects table for subject-wise results
      await this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS student_subjects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hall_ticket VARCHAR(50) NOT NULL,
          subject_code VARCHAR(50) NOT NULL,
          subject_name VARCHAR(255) NOT NULL,
          credits DECIMAL(3,1) DEFAULT 0,
          grade VARCHAR(10) DEFAULT '',
          semester VARCHAR(20) DEFAULT '',
          year VARCHAR(20) DEFAULT '',
          INDEX idx_hall_ticket (hall_ticket),
          INDEX idx_subject_code (subject_code),
          INDEX idx_subject_name (subject_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      this.mysqlConnected = true;
      this.addLog('info', `MySQL connected successfully to ${this.mysqlConfig.host}:${this.mysqlConfig.port}/${this.mysqlConfig.database}`);

      return { success: true, message: `Connected to MySQL database "${this.mysqlConfig.database}" at ${this.mysqlConfig.host}:${this.mysqlConfig.port}` };
    } catch (err: any) {
      console.error("Full MySQL Error:", err);

      this.mysqlConnected = false;

      const msg = `MySQL connection unavailable (${err.code}: ${err.message})`;
      console.log(msg);

      return {
        success: false,
        message: msg,
      };
    }
  }

  // Get MySQL Configuration & Connection Status
  public getMySQLStatus() {
    return {
      connected: this.mysqlConnected,
      config: this.mysqlConfig
    };
  }

  // Helper to fetch subjects from student_subjects table
  private async fetchSubjectsForHallTicket(ht: string): Promise<Subject[]> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    try {
      const [rows] = await this.mysqlPool.query<any[]>('SELECT * FROM student_subjects WHERE hall_ticket = ?', [ht]);
      return rows.map((s: any) => ({
        subject_code: s.subject_code,
        subject_name: s.subject_name,
        credits: s.credits,
        grade: s.grade,
        semester: s.semester,
        year: s.year
      }));
    } catch (err) {
      console.error(`Error fetching subjects for ${ht}`, err);
      return [];
    }
  }

  // Student CRUD - All operations now use MySQL directly

  public async getStudentByHallTicket(ht: string): Promise<Student | null> {
    if (!this.mysqlPool || !this.mysqlConnected) return null;
    
    try {
      const [rows] = await this.mysqlPool.query<any[]>('SELECT * FROM students WHERE hall_ticket = ?', [ht]);
      if (!rows || rows.length === 0) return null;
      
      const row = rows[0];
      
      // Try to get subjects from student_subjects table first, fall back to JSON column
      let subjects: Subject[] = await this.fetchSubjectsForHallTicket(ht);
      
      // If no subjects in student_subjects table, try the JSON column
      if (subjects.length === 0 && row.subjects) {
        const parsed = typeof row.subjects === 'string' ? JSON.parse(row.subjects) : row.subjects;
        if (Array.isArray(parsed) && parsed.length > 0) {
          subjects = parsed;
        }
      }
      
      return {
        id: row.id,
        hall_ticket: row.hall_ticket,
        name: row.name,
        father_name: row.father_name,
        course: row.course,
        exam: row.exam,
        sgpa: row.sgpa,
        cgpa: row.cgpa,
        is_missing: Boolean(row.is_missing),
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        subjects: subjects,
        mandatory_requirements: typeof row.mandatory_requirements === 'string' ? JSON.parse(row.mandatory_requirements) : (row.mandatory_requirements || [])
      };
    } catch (err) {
      console.error(`Error fetching student ${ht} from MySQL`, err);
      return null;
    }
  }

  public async saveStudentAsync(student: Student): Promise<Student> {
    if (!this.mysqlPool || !this.mysqlConnected) {
      throw new Error('MySQL not connected');
    }

    try {
      // Save main student record
      await this.mysqlPool.query(
        `INSERT INTO students (hall_ticket, name, father_name, course, exam, sgpa, cgpa, is_missing, subjects, mandatory_requirements, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           father_name = VALUES(father_name),
           course = VALUES(course),
           exam = VALUES(exam),
           sgpa = VALUES(sgpa),
           cgpa = VALUES(cgpa),
           is_missing = VALUES(is_missing),
           subjects = VALUES(subjects),
           mandatory_requirements = VALUES(mandatory_requirements),
           created_at = NOW()`,
        [
          student.hall_ticket,
          student.name,
          student.father_name,
          student.course,
          student.exam,
          student.sgpa,
          student.cgpa,
          student.is_missing ? 1 : 0,
          JSON.stringify(student.subjects || []),
          JSON.stringify(student.mandatory_requirements || [])
        ]
      );

      // Save subjects to student_subjects table
      if (student.subjects && student.subjects.length > 0) {
        // Delete old subjects first to avoid duplicates
        await this.mysqlPool.query('DELETE FROM student_subjects WHERE hall_ticket = ?', [student.hall_ticket]);
        
        // Insert new subjects
        for (const sub of student.subjects) {
          await this.mysqlPool.query(
            `INSERT INTO student_subjects (hall_ticket, subject_code, subject_name, credits, grade, semester, year) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              student.hall_ticket,
              sub.subject_code,
              sub.subject_name,
              sub.credits,
              sub.grade,
              sub.semester,
              sub.year
            ]
          );
        }
      }

      // Fetch the saved/updated record (with subjects from student_subjects table)
      return await this.getStudentByHallTicket(student.hall_ticket) || student;
    } catch (err) {
      console.error(`Error persisting student ${student.hall_ticket} to MySQL`, err);
      throw err;
    }
  }

  public async saveStudent(student: Student): Promise<Student> {
    // Async wrapper for compatibility
    return this.saveStudentAsync(student);
  }

  public async getStudentsByRange(prefix: string, startNum: string, endNum: string): Promise<Student[]> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    
    try {
      const start = parseInt(startNum, 10);
      const end = parseInt(endNum, 10);
      const padLen = Math.max(3, startNum.length);
      
      const results: Student[] = [];
      
      for (let i = start; i <= end; i++) {
        const numStr = String(i).padStart(padLen, '0');
        const ht = `${prefix}${numStr}`;
        const student = await this.getStudentByHallTicket(ht);
        if (student) {
          results.push(student);
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error fetching students by range from MySQL', err);
      return [];
    }
  }

  public async getAllStudents(): Promise<Student[]> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    
    try {
      const [students] = await this.mysqlPool.query<any[]>('SELECT * FROM students ORDER BY hall_ticket ASC');
      
      // Fetch all subjects
      const [subjects] = await this.mysqlPool.query<any[]>('SELECT * FROM student_subjects');
      
      // Map subjects to their respective students
      return students.map((student: any) => ({
        id: student.id,
        hall_ticket: student.hall_ticket,
        name: student.name,
        father_name: student.father_name,
        course: student.course,
        exam: student.exam,
        sgpa: student.sgpa,
        cgpa: student.cgpa,
        is_missing: Boolean(student.is_missing),
        created_at: student.created_at ? new Date(student.created_at).toISOString() : new Date().toISOString(),
        subjects: subjects.filter((s: any) => s.hall_ticket === student.hall_ticket).map((s: any) => ({
          subject_code: s.subject_code,
          subject_name: s.subject_name,
          credits: s.credits,
          semester: s.semester,
          year: s.year,
          grade: s.grade
        })),
        mandatory_requirements: typeof student.mandatory_requirements === 'string' ? JSON.parse(student.mandatory_requirements) : (student.mandatory_requirements || [])
      }));
    } catch (err) {
      console.error('Error fetching all students from MySQL', err);
      return [];
    }
  }

  public async getStudentsBySubject(subjectNameQuery: string): Promise<Array<{
    hall_ticket: string;
    name: string;
    grade: string;
    subject_code: string;
    subject_name: string;
    credits: number | string;
  }>> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    
    try {
      // 1. Try to find an EXACT match first (prevents Theory from showing Labs)
      const exactQuery = `
        SELECT s.hall_ticket, s.name, ss.subject_code, ss.subject_name, ss.credits, ss.grade
        FROM students s
        JOIN student_subjects ss ON s.hall_ticket = ss.hall_ticket
        WHERE ss.subject_name = ?
        ORDER BY s.hall_ticket ASC
      `;
      const [exactRows] = await this.mysqlPool.query<any[]>(exactQuery, [subjectNameQuery]);
      
      // 2. If exact match found, return it
      if (exactRows.length > 0) {
        return exactRows.map((row: any) => ({
          hall_ticket: row.hall_ticket,
          name: row.name,
          grade: row.grade || 'PASSED',
          subject_code: row.subject_code,
          subject_name: row.subject_name,
          credits: row.credits
        }));
      }

      // 3. Fallback: If no exact match, use LIKE (e.g., searching for "lab")
      const [partialRows] = await this.mysqlPool.query<any[]>(
        `SELECT ss.hall_ticket, s.name, ss.subject_code, ss.subject_name, ss.credits, ss.grade
         FROM student_subjects ss
         JOIN students s ON s.hall_ticket = ss.hall_ticket
         WHERE ss.subject_name LIKE ? OR ss.subject_code LIKE ?
         ORDER BY ss.hall_ticket ASC`,
        [`%${subjectNameQuery}%`, `%${subjectNameQuery}%`]
      );
      
      return partialRows.map((row: any) => ({
        hall_ticket: row.hall_ticket,
        name: row.name,
        grade: row.grade || 'PASSED',
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        credits: row.credits
      }));
    } catch (err) {
      console.error('Error fetching students by subject from MySQL', err);
      return [];
    }
  }

  // Get filtered subject results with range support
  public async getFilteredSubjectResults(subjectName: string, prefix: string, start: string, end: string): Promise<Array<{
    hall_ticket: string;
    name: string;
    grade: string;
    subject_code: string;
    subject_name: string;
    credits: number | string;
  }>> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    
    try {
      const startNum = parseInt(start, 10) || 1;
      const endNum = parseInt(end, 10) || 999;

      const [rows] = await this.mysqlPool.query<any[]>(
        `SELECT s.hall_ticket, s.name, ss.subject_code, ss.subject_name, ss.credits, ss.grade
         FROM students s
         JOIN student_subjects ss ON s.hall_ticket = ss.hall_ticket
         WHERE ss.subject_name = ? 
         AND s.hall_ticket LIKE ?
         AND CAST(SUBSTRING(s.hall_ticket, ? + 1) AS UNSIGNED) BETWEEN ? AND ?
         ORDER BY CAST(SUBSTRING(s.hall_ticket, ? + 1) AS UNSIGNED) ASC`,
        [subjectName, `${prefix}%`, prefix.length, startNum, endNum, prefix.length]
      );
      
      return rows.map((row: any) => ({
        hall_ticket: row.hall_ticket,
        name: row.name,
        grade: row.grade || 'PASSED',
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        credits: row.credits
      }));
    } catch (err) {
      console.error('Error fetching filtered subject results from MySQL', err);
      return [];
    }
  }

  // Get unique subject names for suggestions
  public async getUniqueSubjectNames(): Promise<string[]> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    
    try {
      const [rows] = await this.mysqlPool.query<any[]>(
        'SELECT DISTINCT subject_name FROM student_subjects ORDER BY subject_name ASC'
      );
      return rows.map((r: any) => r.subject_name);
    } catch (err) {
      console.error('Error fetching unique subject names from MySQL', err);
      return [];
    }
  }

  // Logs
  public async addLog(type: LogEntry['type'], message: string, hall_ticket?: string): Promise<LogEntry> {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      hall_ticket
    };

    // Save to MySQL log table if connected
    if (this.mysqlPool && this.mysqlConnected) {
      try {
        await this.mysqlPool.query(
          'INSERT INTO logs (id, timestamp, type, message, hall_ticket) VALUES (?, ?, ?, ?, ?)',
          [entry.id, entry.timestamp, entry.type, entry.message, entry.hall_ticket || null]
        );
      } catch (err) {
        console.error('Error saving log to MySQL', err);
      }
    }

    return entry;
  }

  public async getLogs(): Promise<LogEntry[]> {
    if (!this.mysqlPool || !this.mysqlConnected) return [];
    
    try {
      const [rows] = await this.mysqlPool.query<any[]>('SELECT * FROM logs ORDER BY created_at DESC LIMIT 500');
      return rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        type: row.type,
        message: row.message,
        hall_ticket: row.hall_ticket
      }));
    } catch (err) {
      console.error('Error fetching logs from MySQL', err);
      return [];
    }
  }

  public async clearLogs(): Promise<void> {
    if (this.mysqlPool && this.mysqlConnected) {
      try {
        await this.mysqlPool.query('TRUNCATE TABLE logs');
      } catch (err) {
        console.error('Error clearing logs from MySQL', err);
      }
    }
  }

  // Checkpoints
  public async saveCheckpoint(last_hall_ticket: string, end_hall_ticket: string, prefix: string): Promise<void> {
    if (this.mysqlPool && this.mysqlConnected) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO checkpoints (last_hall_ticket, end_hall_ticket, prefix) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           last_hall_ticket = VALUES(last_hall_ticket), 
           end_hall_ticket = VALUES(end_hall_ticket), 
           updated_at = CURRENT_TIMESTAMP`,
          [last_hall_ticket, end_hall_ticket, prefix]
        );
      } catch (err) {
        console.error('Error saving checkpoint to MySQL', err);
      }
    }
  }

  public async getCheckpoint(): Promise<{ last_hall_ticket: string; end_hall_ticket: string; prefix: string } | null> {
    if (!this.mysqlPool || !this.mysqlConnected) return null;
    
    try {
      const [rows] = await this.mysqlPool.query<any[]>('SELECT * FROM checkpoints LIMIT 1');
      if (!rows || rows.length === 0) return null;
      
      const row = rows[0];
      return {
        last_hall_ticket: row.last_hall_ticket,
        end_hall_ticket: row.end_hall_ticket,
        prefix: row.prefix
      };
    } catch (err) {
      console.error('Error fetching checkpoint from MySQL', err);
      return null;
    }
  }

  public async clearCheckpoint(): Promise<void> {
    if (this.mysqlPool && this.mysqlConnected) {
      try {
        await this.mysqlPool.query('DELETE FROM checkpoints');
      } catch (err) {
        console.error('Error clearing checkpoint from MySQL', err);
      }
    }
  }

  // Stats
  public async getStats(): Promise<DatabaseStats> {
    if (!this.mysqlPool || !this.mysqlConnected) {
      return {
        driver: 'mysql',
        mysql_connected: false,
        total_students: 0,
        found_students: 0,
        missing_students: 0,
        total_subjects: 0,
        avg_sgpa: 0,
        avg_cgpa: 0,
        highest_sgpa: 0,
        highest_cgpa: 0,
        pass_count: 0,
        fail_count: 0,
        pass_percentage: 0,
        top_performers: []
      };
    }

    try {
      const [students] = await this.mysqlPool.query<any[]>('SELECT * FROM students');
      const found = students.filter(s => !s.is_missing);
      const missing = students.filter(s => s.is_missing);

      let totalSgpa = 0;
      let sgpaCount = 0;
      let totalCgpa = 0;
      let cgpaCount = 0;
      let highestSgpa = 0;
      let highestCgpa = 0;
      let totalSubjects = 0;

      for (const s of found) {
        if (s.sgpa && s.sgpa !== '-') {
          const val = parseFloat(s.sgpa);
          if (!isNaN(val)) {
            totalSgpa += val;
            sgpaCount++;
            if (val > highestSgpa) highestSgpa = val;
          }
        }
        if (s.cgpa && s.cgpa !== '-') {
          const val = parseFloat(s.cgpa);
          if (!isNaN(val)) {
            totalCgpa += val;
            cgpaCount++;
            if (val > highestCgpa) highestCgpa = val;
          }
        }
      }

      // Get actual subject count from student_subjects table
      try {
        const [subjRows] = await this.mysqlPool.query<any[]>('SELECT COUNT(*) as count FROM student_subjects');
        totalSubjects = subjRows[0]?.count || 0;
      } catch (_) {}

      const sortedBySgpa = [...found]
        .filter(s => s.sgpa !== '-')
        .sort((a, b) => (parseFloat(b.sgpa) || 0) - (parseFloat(a.sgpa) || 0));

      let passCount = 0;
      let failCount = 0;

      for (const s of found) {
        const sgpaVal = parseFloat(s.sgpa);
        // Check for failed subjects from student_subjects
        let hasFailedSubj = false;
        try {
          const [subjRows] = await this.mysqlPool.query<any[]>(
            "SELECT COUNT(*) as count FROM student_subjects WHERE hall_ticket = ? AND grade = 'F'",
            [s.hall_ticket]
          );
          hasFailedSubj = subjRows[0]?.count > 0;
        } catch (_) {}
        
        if (hasFailedSubj || isNaN(sgpaVal) || sgpaVal < 5.0) {
          failCount++;
        } else {
          passCount++;
        }
      }

      const passPercentage = found.length > 0 ? parseFloat(((passCount / found.length) * 100).toFixed(1)) : 0;

      return {
        driver: 'mysql',
        mysql_connected: true,
        total_students: students.length,
        found_students: found.length,
        missing_students: missing.length,
        total_subjects: totalSubjects,
        avg_sgpa: sgpaCount > 0 ? parseFloat((totalSgpa / sgpaCount).toFixed(2)) : 0,
        avg_cgpa: cgpaCount > 0 ? parseFloat((totalCgpa / cgpaCount).toFixed(2)) : 0,
        highest_sgpa: highestSgpa,
        highest_cgpa: highestCgpa,
        pass_count: passCount,
        fail_count: failCount,
        pass_percentage: passPercentage,
        top_performers: sortedBySgpa.slice(0, 5).map(s => ({
          hall_ticket: s.hall_ticket,
          name: s.name,
          sgpa: s.sgpa,
          cgpa: s.cgpa
        }))
      };
    } catch (err) {
      console.error('Error fetching stats from MySQL', err);
      throw err;
    }
  }

  // DB Clear
  public async clearDatabase(): Promise<void> {
    if (this.mysqlPool && this.mysqlConnected) {
      try {
        await this.mysqlPool.query('TRUNCATE TABLE students');
        await this.mysqlPool.query('TRUNCATE TABLE logs');
        await this.mysqlPool.query('TRUNCATE TABLE checkpoints');
        await this.mysqlPool.query('TRUNCATE TABLE student_subjects');
      } catch (err) {
        console.error('Error clearing database', err);
        throw err;
      }
    }
  }

  // Mock data seeding removed - MySQL should only contain real scraped data
}

export const db = new DatabaseService();