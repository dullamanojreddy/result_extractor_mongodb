import fs from 'fs';
import path from 'path';
import { MongoClient, Db, Collection, Document } from 'mongodb';
import { Student, Subject, MandatoryRequirement, LogEntry, DatabaseStats, MongoDBConfig } from '../types.js';
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
  public mongoClient: MongoClient | null = null;
  public mongoDb: Db | null = null;
  public mongoConnected: boolean = false;
  private mongoConfig: MongoDBConfig = {
    uri: env.mongoUri,
    database: env.mongoDatabase,
    enabled: env.useMongoDB
  };

  constructor() {
    // No local data loading - MongoDB is the single source of truth
  }

  // Initialize MongoDB Connection & Collections
  public async initMongoDB(customConfig?: MongoDBConfig): Promise<{ success: boolean; message: string }> {
    if (customConfig) {
      this.mongoConfig = { ...customConfig };
    }

    if (this.mongoClient) {
      try {
        await this.mongoClient.close();
      } catch (_) {}
      this.mongoClient = null;
      this.mongoDb = null;
    }

    try {
      // Create MongoDB client
      this.mongoClient = new MongoClient(this.mongoConfig.uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });

      // Test connection
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db(this.mongoConfig.database);

      // Create collections with indexes if they don't exist
      const collections = await this.mongoDb.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      // Students collection
      if (!collectionNames.includes('students')) {
        await this.mongoDb.createCollection('students');
      }
      await this.mongoDb.collection('students').createIndex({ hall_ticket: 1 }, { unique: true });
      await this.mongoDb.collection('students').createIndex({ is_missing: 1 });
      await this.mongoDb.collection('students').createIndex({ sgpa: 1 });
      await this.mongoDb.collection('students').createIndex({ cgpa: 1 });

      // Student subjects collection
      if (!collectionNames.includes('student_subjects')) {
        await this.mongoDb.createCollection('student_subjects');
      }
      await this.mongoDb.collection('student_subjects').createIndex({ hall_ticket: 1 });
      await this.mongoDb.collection('student_subjects').createIndex({ subject_code: 1 });
      await this.mongoDb.collection('student_subjects').createIndex({ subject_name: 1 });
      await this.mongoDb.collection('student_subjects').createIndex({ grade: 1 });

      // Logs collection
      if (!collectionNames.includes('logs')) {
        await this.mongoDb.createCollection('logs');
      }
      await this.mongoDb.collection('logs').createIndex({ type: 1 });
      await this.mongoDb.collection('logs').createIndex({ hall_ticket: 1 });
      await this.mongoDb.collection('logs').createIndex({ created_at: -1 });

      // Checkpoints collection
      if (!collectionNames.includes('checkpoints')) {
        await this.mongoDb.createCollection('checkpoints');
      }
      await this.mongoDb.collection('checkpoints').createIndex({ prefix: 1 }, { unique: true });

      this.mongoConnected = true;
      this.addLog('info', `MongoDB connected successfully to database "${this.mongoConfig.database}"`);

      return { success: true, message: `Connected to MongoDB database "${this.mongoConfig.database}"` };
    } catch (err: any) {
      console.error("Full MongoDB Error:", err);

      this.mongoConnected = false;

      const msg = `MongoDB connection unavailable (${err.code || 'UNKNOWN'}: ${err.message})`;
      console.log(msg);

      return {
        success: false,
        message: msg,
      };
    }
  }

  // Get MongoDB Configuration & Connection Status
  public getMongoDBStatus() {
    return {
      connected: this.mongoConnected,
      database: this.mongoConfig.database
    };
  }

  // Helper to fetch subjects from student_subjects collection
  private async fetchSubjectsForHallTicket(ht: string): Promise<Subject[]> {
    if (!this.mongoDb || !this.mongoConnected) return [];
    try {
      const docs = await this.mongoDb.collection('student_subjects')
        .find({ hall_ticket: ht })
        .toArray();
      return docs.map((s: any) => ({
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

  // Student CRUD - All operations now use MongoDB directly

  public async getStudentByHallTicket(ht: string, collegeId?: string): Promise<Student | null> {
    if (!this.mongoDb || !this.mongoConnected) return null;
    
    try {
      const query: any = { hall_ticket: ht };
      if (collegeId) query.collegeId = collegeId;
      const doc = await this.mongoDb.collection('students').findOne(query);
      if (!doc) return null;
      
      // Try to get subjects from student_subjects collection first, fall back to embedded array
      let subjects: Subject[] = await this.fetchSubjectsForHallTicket(ht);
      
      // If no subjects in student_subjects collection, try the embedded array
      if (subjects.length === 0 && doc.subjects) {
        if (Array.isArray(doc.subjects) && doc.subjects.length > 0) {
          subjects = doc.subjects as unknown as Subject[];
        }
      }
      
      return {
        id: doc.id || undefined,
        hall_ticket: doc.hall_ticket,
        name: doc.name,
        father_name: doc.father_name,
        course: doc.course,
        exam: doc.exam,
        sgpa: doc.sgpa,
        cgpa: doc.cgpa,
        is_missing: Boolean(doc.is_missing),
        created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
        subjects: subjects,
        mandatory_requirements: doc.mandatory_requirements || []
      };
    } catch (err) {
      console.error(`Error fetching student ${ht} from MongoDB`, err);
      return null;
    }
  }

  public async saveStudentAsync(student: Student, collegeId?: string): Promise<Student> {
    if (!this.mongoDb || !this.mongoConnected) {
      throw new Error('MongoDB not connected');
    }

    try {
      // Save main student record
      const studentDoc: any = {
        hall_ticket: student.hall_ticket,
        name: student.name,
        father_name: student.father_name,
        course: student.course,
        exam: student.exam,
        sgpa: student.sgpa,
        cgpa: student.cgpa,
        is_missing: student.is_missing ? 1 : 0,
        subjects: student.subjects || [],
        mandatory_requirements: student.mandatory_requirements || [],
        created_at: new Date().toISOString()
      };

      // Add collegeId if provided (for multi-tenant isolation)
      if (collegeId) {
        studentDoc.collegeId = collegeId;
      }

      await this.mongoDb.collection('students').updateOne(
        { hall_ticket: student.hall_ticket },
        { $set: studentDoc },
        { upsert: true }
      );

      // Save subjects to student_subjects collection
      if (student.subjects && student.subjects.length > 0) {
        // Delete old subjects first to avoid duplicates
        await this.mongoDb.collection('student_subjects').deleteMany({ hall_ticket: student.hall_ticket });
        
        // Insert new subjects
        const subjectDocs = student.subjects.map(sub => ({
          hall_ticket: student.hall_ticket,
          subject_code: sub.subject_code,
          subject_name: sub.subject_name,
          credits: sub.credits,
          grade: sub.grade,
          semester: sub.semester,
          year: sub.year
        }));
        
        await this.mongoDb.collection('student_subjects').insertMany(subjectDocs);
      }

      // Fetch the saved/updated record (with subjects from student_subjects collection)
      return await this.getStudentByHallTicket(student.hall_ticket) || student;
    } catch (err) {
      console.error(`Error persisting student ${student.hall_ticket} to MongoDB`, err);
      throw err;
    }
  }

  public async saveStudent(student: Student): Promise<Student> {
    // Async wrapper for compatibility
    return this.saveStudentAsync(student);
  }

  public async getStudentsByRange(prefix: string, startNum: string, endNum: string): Promise<Student[]> {
    if (!this.mongoDb || !this.mongoConnected) return [];
    
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
      console.error('Error fetching students by range from MongoDB', err);
      return [];
    }
  }

  public async getAllStudents(collegeId?: string): Promise<Student[]> {
    if (!this.mongoDb || !this.mongoConnected) return [];
    
    try {
      const query: any = {};
      if (collegeId) query.collegeId = collegeId;
      const students = await this.mongoDb.collection('students')
        .find(query)
        .sort({ hall_ticket: 1 })
        .toArray();
      
      // Fetch all subjects
      const subjects = await this.mongoDb.collection('student_subjects')
        .find({})
        .toArray();
      
      // Map subjects to their respective students
      return students.map((student: any) => ({
        id: student._id?.toString(),
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
        mandatory_requirements: student.mandatory_requirements || []
      }));
    } catch (err) {
      console.error('Error fetching all students from MongoDB', err);
      return [];
    }
  }

  public async getStudentsBySubject(subjectNameQuery: string, collegeId?: string): Promise<Array<{
    hall_ticket: string;
    name: string;
    grade: string;
    subject_code: string;
    subject_name: string;
    credits: number | string;
  }>> {
    if (!this.mongoDb || !this.mongoConnected) return [];
    
    try {
      // 1. Try to find an EXACT match first (prevents Theory from showing Labs)
      const matchStage: any = { subject_name: subjectNameQuery };
      const exactDocs = await this.mongoDb.collection('student_subjects')
        .aggregate([
          { $match: matchStage },
          { $lookup: {
              from: 'students',
              localField: 'hall_ticket',
              foreignField: 'hall_ticket',
              as: 'student'
          }},
          { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
          ...(collegeId ? [{ $match: { 'student.collegeId': collegeId } }] : []),
          { $sort: { hall_ticket: 1 } }
        ])
        .toArray();
      
      // 2. If exact match found, return it
      if (exactDocs.length > 0) {
        return exactDocs.map((row: any) => ({
          hall_ticket: row.hall_ticket,
          name: row.student?.name || '-',
          grade: row.grade || 'PASSED',
          subject_code: row.subject_code,
          subject_name: row.subject_name,
          credits: row.credits
        }));
      }

      // 3. Fallback: If no exact match, use regex (e.g., searching for "lab")
      const partialMatchStage: any = {
        $or: [
          { subject_name: { $regex: subjectNameQuery, $options: 'i' } },
          { subject_code: { $regex: subjectNameQuery, $options: 'i' } }
        ]
      };
      const partialDocs = await this.mongoDb.collection('student_subjects')
        .aggregate([
          { $match: partialMatchStage },
          { $lookup: {
              from: 'students',
              localField: 'hall_ticket',
              foreignField: 'hall_ticket',
              as: 'student'
          }},
          { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
          ...(collegeId ? [{ $match: { 'student.collegeId': collegeId } }] : []),
          { $sort: { hall_ticket: 1 } }
        ])
        .toArray();
      
      return partialDocs.map((row: any) => ({
        hall_ticket: row.hall_ticket,
        name: row.student?.name || '-',
        grade: row.grade || 'PASSED',
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        credits: row.credits
      }));
    } catch (err) {
      console.error('Error fetching students by subject from MongoDB', err);
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
    if (!this.mongoDb || !this.mongoConnected) return [];
    
    try {
      const startNum = parseInt(start, 10) || 1;
      const endNum = parseInt(end, 10) || 999;
      const prefixLen = prefix.length;

      // Build a regex pattern for hall_ticket range filtering
      // We need to extract the numeric part after the prefix and filter by range
      const docs = await this.mongoDb.collection('student_subjects')
        .aggregate([
          { $match: { subject_name: subjectName } },
          { $lookup: {
              from: 'students',
              localField: 'hall_ticket',
              foreignField: 'hall_ticket',
              as: 'student'
          }},
          { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
          { $match: { hall_ticket: { $regex: `^${prefix}` } } },
          { $sort: { hall_ticket: 1 } }
        ])
        .toArray();

      // Filter by numeric range in application layer
      const filtered = docs.filter((doc: any) => {
        const numericPart = doc.hall_ticket.substring(prefixLen);
        const num = parseInt(numericPart, 10);
        return !isNaN(num) && num >= startNum && num <= endNum;
      });

      return filtered.map((row: any) => ({
        hall_ticket: row.hall_ticket,
        name: row.student?.name || '-',
        grade: row.grade || 'PASSED',
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        credits: row.credits
      }));
    } catch (err) {
      console.error('Error fetching filtered subject results from MongoDB', err);
      return [];
    }
  }

  // Get unique subject names for suggestions
  public async getUniqueSubjectNames(): Promise<string[]> {
    if (!this.mongoDb || !this.mongoConnected) return [];
    
    try {
      const result = await this.mongoDb.collection('student_subjects')
        .aggregate([
          { $group: { _id: '$subject_name' } },
          { $sort: { _id: 1 } }
        ])
        .toArray();
      return result.map((r: any) => r._id);
    } catch (err) {
      console.error('Error fetching unique subject names from MongoDB', err);
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

    // Save to MongoDB log collection if connected
    if (this.mongoDb && this.mongoConnected) {
      try {
        await this.mongoDb.collection('logs').insertOne({
          id: entry.id,
          timestamp: entry.timestamp,
          type: entry.type,
          message: entry.message,
          hall_ticket: entry.hall_ticket || null,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving log to MongoDB', err);
      }
    }

    return entry;
  }

  public async getLogs(): Promise<LogEntry[]> {
    if (!this.mongoDb || !this.mongoConnected) return [];
    
    try {
      const docs = await this.mongoDb.collection('logs')
        .find({})
        .sort({ created_at: -1 })
        .limit(500)
        .toArray();
      return docs.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        type: row.type,
        message: row.message,
        hall_ticket: row.hall_ticket
      }));
    } catch (err) {
      console.error('Error fetching logs from MongoDB', err);
      return [];
    }
  }

  public async clearLogs(): Promise<void> {
    if (this.mongoDb && this.mongoConnected) {
      try {
        await this.mongoDb.collection('logs').deleteMany({});
      } catch (err) {
        console.error('Error clearing logs from MongoDB', err);
      }
    }
  }

  // Checkpoints
  public async saveCheckpoint(last_hall_ticket: string, end_hall_ticket: string, prefix: string): Promise<void> {
    if (this.mongoDb && this.mongoConnected) {
      try {
        await this.mongoDb.collection('checkpoints').updateOne(
          { prefix },
          { 
            $set: { 
              last_hall_ticket, 
              end_hall_ticket, 
              prefix,
              updated_at: new Date().toISOString()
            } 
          },
          { upsert: true }
        );
      } catch (err) {
        console.error('Error saving checkpoint to MongoDB', err);
      }
    }
  }

  public async getCheckpoint(): Promise<{ last_hall_ticket: string; end_hall_ticket: string; prefix: string } | null> {
    if (!this.mongoDb || !this.mongoConnected) return null;
    
    try {
      const doc = await this.mongoDb.collection('checkpoints').findOne({});
      if (!doc) return null;
      
      return {
        last_hall_ticket: doc.last_hall_ticket,
        end_hall_ticket: doc.end_hall_ticket,
        prefix: doc.prefix
      };
    } catch (err) {
      console.error('Error fetching checkpoint from MongoDB', err);
      return null;
    }
  }

  public async clearCheckpoint(): Promise<void> {
    if (this.mongoDb && this.mongoConnected) {
      try {
        await this.mongoDb.collection('checkpoints').deleteMany({});
      } catch (err) {
        console.error('Error clearing checkpoint from MongoDB', err);
      }
    }
  }

  // Stats
  public async getStats(collegeId?: string): Promise<DatabaseStats> {
    if (!this.mongoDb || !this.mongoConnected) {
      return {
        driver: 'mongodb',
        mongodb_connected: false,
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
      // Use aggregation for efficient stats calculation
      const matchStage: any = {};
      if (collegeId) matchStage.collegeId = collegeId;
      
      const statsAggregation = await this.mongoDb.collection('students').aggregate([
        ...(collegeId ? [{ $match: matchStage }] : []),
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            found: { $sum: { $cond: ['$is_missing', 0, 1] } },
            missing: { $sum: { $cond: ['$is_missing', 1, 0] } },
            sgpaValues: {
              $push: {
                $cond: [
                  { $and: ['$sgpa', { $ne: '-' }] },
                  { $toDouble: '$sgpa' },
                  null
                ]
              }
            },
            cgpaValues: {
              $push: {
                $cond: [
                  { $and: ['$cgpa', { $ne: '-' }] },
                  { $toDouble: '$cgpa' },
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            total: 1,
            found: 1,
            missing: 1,
            avgSgpa: { $avg: '$sgpaValues' },
            avgCgpa: { $avg: '$cgpaValues' },
            maxSgpa: { $max: '$sgpaValues' },
            maxCgpa: { $max: '$cgpaValues' }
          }
        }
      ]).toArray();

      const stats = statsAggregation[0] || { total: 0, found: 0, missing: 0, avgSgpa: 0, avgCgpa: 0, maxSgpa: 0, maxCgpa: 0 };

      // Get total subjects count
      let totalSubjects = 0;
      try {
        totalSubjects = await this.mongoDb.collection('student_subjects').countDocuments();
      } catch (_) {}

      // Get top performers (students with valid SGPA, sorted descending)
      const topPerformersQuery: any = { is_missing: false, sgpa: { $ne: '-' } };
      if (collegeId) topPerformersQuery.collegeId = collegeId;
      const topPerformers = await this.mongoDb.collection('students')
        .find(topPerformersQuery)
        .sort({ sgpa: -1 })
        .limit(5)
        .toArray();

      // Count pass/fail using aggregation
      const passFailMatch: any = { is_missing: false };
      if (collegeId) passFailMatch.collegeId = collegeId;
      const passFailAggregation = await this.mongoDb.collection('students').aggregate([
        { $match: passFailMatch },
        {
          $lookup: {
            from: 'student_subjects',
            localField: 'hall_ticket',
            foreignField: 'hall_ticket',
            as: 'subjects'
          }
        },
        {
          $addFields: {
            hasFailedSubject: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$subjects',
                      cond: { $eq: ['$$this.grade', 'F'] }
                    }
                  }
                },
                0
              ]
            },
            sgpaNum: {
              $cond: [
                { $eq: ['$sgpa', '-'] },
                null,
                { $toDouble: '$sgpa' }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            pass: {
              $sum: {
                $cond: [
                  { $and: [{ $not: '$hasFailedSubject' }, '$sgpaNum', { $gte: ['$sgpaNum', 5.0] }] },
                  1,
                  0
                ]
              }
            },
            fail: {
              $sum: {
                $cond: [
                  { $or: ['$hasFailedSubject', { $not: '$sgpaNum' }, { $lt: ['$sgpaNum', 5.0] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray();

      const passFailStats = passFailAggregation[0] || { pass: 0, fail: 0 };
      const passCount = passFailStats.pass;
      const failCount = passFailStats.fail;
      const passPercentage = stats.found > 0 ? parseFloat(((passCount / stats.found) * 100).toFixed(1)) : 0;

      return {
        driver: 'mongodb',
        mongodb_connected: true,
        total_students: stats.total,
        found_students: stats.found,
        missing_students: stats.missing,
        total_subjects: totalSubjects,
        avg_sgpa: stats.avgSgpa ? parseFloat(stats.avgSgpa.toFixed(2)) : 0,
        avg_cgpa: stats.avgCgpa ? parseFloat(stats.avgCgpa.toFixed(2)) : 0,
        highest_sgpa: stats.maxSgpa || 0,
        highest_cgpa: stats.maxCgpa || 0,
        pass_count: passCount,
        fail_count: failCount,
        pass_percentage: passPercentage,
        top_performers: topPerformers.map(s => ({
          hall_ticket: s.hall_ticket,
          name: s.name,
          sgpa: s.sgpa,
          cgpa: s.cgpa
        }))
      };
    } catch (err) {
      console.error('Error fetching stats from MongoDB', err);
      throw err;
    }
  }

  // DB Clear
  public async clearDatabase(): Promise<void> {
    if (this.mongoDb && this.mongoConnected) {
      try {
        await this.mongoDb.collection('students').deleteMany({});
        await this.mongoDb.collection('logs').deleteMany({});
        await this.mongoDb.collection('checkpoints').deleteMany({});
        await this.mongoDb.collection('student_subjects').deleteMany({});
      } catch (err) {
        console.error('Error clearing database', err);
        throw err;
      }
    }
  }

  // Mock data seeding removed - MongoDB should only contain real scraped data
}

export const db = new DatabaseService();