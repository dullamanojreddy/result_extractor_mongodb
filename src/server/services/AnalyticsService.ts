import { db } from '../database.js';
import { AdvancedAnalytics, SubjectAnalytics, Student } from '../../types.js';

export class AnalyticsService {
  public static async getAdvancedAnalytics(collegeId?: string, userId?: string, isAdmin?: boolean): Promise<AdvancedAnalytics> {
    const allStudents = await db.getAllStudents(collegeId, userId, isAdmin);
    const validStudents = allStudents.filter(s => s && !s.is_missing);

    // Get system stats
    const stats = await db.getStats(collegeId, userId, isAdmin);

    // Top 10 SGPA
    const topSgpa = [...validStudents]
      .filter(s => s.sgpa && s.sgpa !== '-')
      .sort((a, b) => parseFloat(b.sgpa) - parseFloat(a.sgpa))
      .slice(0, 10);

    // Top 10 CGPA
    const topCgpa = [...validStudents]
      .filter(s => s.cgpa && s.cgpa !== '-')
      .sort((a, b) => parseFloat(b.cgpa) - parseFloat(a.cgpa))
      .slice(0, 10);

    // Students Above 9 SGPA
    const studentsAbove9 = validStudents.filter(s => {
      const val = parseFloat(s.sgpa);
      return !isNaN(val) && val >= 9.0;
    });

    // Students Below 6 SGPA
    const studentsBelow6 = validStudents.filter(s => {
      const val = parseFloat(s.sgpa);
      return !isNaN(val) && val < 6.0;
    });

    // Failed Students (has 'F' grade in any subject or missing SGPA)
    const failedStudents = validStudents.filter(s => {
      if (!s.subjects) return false;
      return s.subjects.some(sub => sub.grade === 'F' || sub.grade === 'FAIL' || sub.grade === 'AB');
    });

    // Grade Distribution Across All Subjects
    const gradeDistribution: Record<string, number> = {
      'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0
    };

    validStudents.forEach(s => {
      s.subjects?.forEach(sub => {
        const g = (sub.grade || '').toUpperCase();
        if (g) gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
      });
    });

    // Branch Breakdown
    const branchBreakdown: Record<string, { total: number; avg_sgpa: number }> = {};
    const branchSgpaSums: Record<string, { sum: number; count: number }> = {};

    validStudents.forEach(s => {
      const branch = s.branch || 'CSE';
      if (!branchSgpaSums[branch]) branchSgpaSums[branch] = { sum: 0, count: 0 };
      const val = parseFloat(s.sgpa);
      if (!isNaN(val)) {
        branchSgpaSums[branch].sum += val;
        branchSgpaSums[branch].count += 1;
      }
    });

    Object.keys(branchSgpaSums).forEach(b => {
      const item = branchSgpaSums[b];
      branchBreakdown[b] = {
        total: item.count,
        avg_sgpa: item.count > 0 ? parseFloat((item.sum / item.count).toFixed(2)) : 0
      };
    });

    return {
      top_sgpa_10: topSgpa,
      top_cgpa_10: topCgpa,
      students_above_9: studentsAbove9,
      students_below_6: studentsBelow6,
      failed_students: failedStudents,
      grade_distribution: gradeDistribution,
      branch_breakdown: branchBreakdown,
      system_stats: {
        total_students: stats.total_students,
        found_students: stats.found_students,
        missing_students: stats.missing_students,
        avg_sgpa: stats.avg_sgpa,
        avg_cgpa: stats.avg_cgpa,
        local_storage: `${(stats.total_subjects * 0.05).toFixed(1)} MB`
      }
    };
  }

  public static async getSubjectAnalytics(subjectQuery: string, collegeId?: string, userId?: string, isAdmin?: boolean): Promise<SubjectAnalytics> {
    const allStudents = (await db.getAllStudents(collegeId, userId, isAdmin)).filter(s => s && !s.is_missing);
    const query = subjectQuery.toLowerCase().trim();

    let subjectCode = '';
    let subjectName = '';
    const matches: Array<{ hall_ticket: string; name: string; grade: string }> = [];
    const gradeCounts: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };

    allStudents.forEach(s => {
      s.subjects?.forEach(sub => {
        if (
          sub.subject_name.toLowerCase().includes(query) ||
          sub.subject_code.toLowerCase().includes(query)
        ) {
          if (!subjectCode) subjectCode = sub.subject_code;
          if (!subjectName) subjectName = sub.subject_name;

          matches.push({
            hall_ticket: s.hall_ticket,
            name: s.name,
            grade: sub.grade || ''
          });

          const g = (sub.grade || '').toUpperCase();
          gradeCounts[g] = (gradeCounts[g] || 0) + 1;
        }
      });
    });

    const totalEnrolled = matches.length;
    const failedCount = gradeCounts['F'] || 0;
    const passedCount = totalEnrolled - failedCount;
    const passPercentage = totalEnrolled > 0 ? parseFloat(((passedCount / totalEnrolled) * 100).toFixed(1)) : 0;

    const topScorers = matches
      .filter(m => m.grade === 'O' || m.grade === 'A+')
      .slice(0, 10);

    return {
      subject_code: subjectCode || query.toUpperCase(),
      subject_name: subjectName || query,
      total_enrolled: totalEnrolled,
      passed_count: passedCount,
      failed_count: failedCount,
      pass_percentage: passPercentage,
      grade_counts: gradeCounts,
      top_scorers: topScorers
    };
  }
}