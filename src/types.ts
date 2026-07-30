export interface Student {
  id?: number;
  hall_ticket: string;
  name: string; // '-' if missing
  father_name: string;
  course: string;
  branch?: string;
  exam: string;
  sgpa: string; // '-' if missing
  cgpa: string; // '-' if missing
  created_at: string;
  updated_at?: string;
  is_missing?: boolean;
  subjects?: Subject[];
  mandatory_requirements?: MandatoryRequirement[];
}

export interface Subject {
  id?: number;
  subject_code: string;
  subject_name: string;
  credits: number | string;
  semester: string;
  year: string;
  grade?: string;
}

export interface ScrapeProgress {
  current_hall_ticket: string;
  processed: number;
  total: number;
  status: 'idle' | 'running' | 'completed' | 'paused' | 'error';
}

export interface StudentSubject {
  id?: number;
  student_id: number;
  subject_id: number;
  grade: string;
  // Joined fields for convenience
  hall_ticket?: string;
  student_name?: string;
  subject_code?: string;
  subject_name?: string;
  credits?: number | string;
}

export interface SubjectWithGrade extends Subject {
  grade: string;
}

export interface MandatoryRequirement {
  id?: number;
  student_id?: number;
  hall_ticket?: string;
  activity: string;
  status: string;
}

export interface ScrapeSession {
  id: string;
  prefix: string;
  start_num: string;
  end_num: string;
  total_tickets: number;
  processed: number;
  found: number;
  missing: number;
  started_at: string;
  finished_at?: string;
  status: 'running' | 'completed' | 'paused' | 'failed';
  duration_seconds?: number;
}

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  enabled: boolean;
}

export interface MongoDBConfig {
  uri: string;
  database: string;
  enabled: boolean;
}

export interface ScrapeConfig {
  portal_url: string;
  prefix: string;
  start_num: string;
  end_num: string;
  delay_seconds: number;
  headless: boolean;
  export_excel: boolean;
  export_csv: boolean;
  retry_limit: number;
  // Pipeline Settings
  fetch_workers?: number;
  parse_workers?: number;
  db_batch_size?: number;
  save_raw_html?: boolean;
}

export interface PipelineStats {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  fetch_queue_size: number;
  parse_queue_size: number;
  db_queue_size: number;
  active_fetch_workers: number;
  active_parse_workers: number;
  processed_tickets: number;
  total_tickets: number;
  found_count: number;
  missing_count: number;
  cached_html_count: number;
  current_hall_ticket: string;
  items_per_minute: number;
  elapsed_seconds: number;
  estimated_seconds_remaining: number;
  current_session_id?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  hall_ticket?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface DatabaseStats {
  driver: 'mongodb' | 'local_json';
  mongodb_connected?: boolean;
  total_students: number;
  found_students: number;
  missing_students: number;
  total_subjects: number;
  avg_sgpa: number;
  avg_cgpa: number;
  highest_sgpa: number;
  highest_cgpa: number;
  pass_count: number;
  fail_count: number;
  pass_percentage: number;
  top_performers: Array<{
    hall_ticket: string;
    name: string;
    sgpa: string;
    cgpa: string;
    course?: string;
  }>;
  grade_distribution?: Record<string, number>;
}

export interface SubjectAnalytics {
  subject_code: string;
  subject_name: string;
  total_enrolled: number;
  passed_count: number;
  failed_count: number;
  pass_percentage: number;
  grade_counts: Record<string, number>;
  top_scorers: Array<{
    hall_ticket: string;
    name: string;
    grade: string;
  }>;
}

export interface AdvancedAnalytics {
  top_sgpa_10: Student[];
  top_cgpa_10: Student[];
  students_above_9: Student[];
  students_below_6: Student[];
  failed_students: Student[];
  grade_distribution: Record<string, number>;
  branch_breakdown: Record<string, { total: number; avg_sgpa: number }>;
  system_stats?: {
    total_students: number;
    found_students: number;
    missing_students: number;
    avg_sgpa: number;
    avg_cgpa: number;
    local_storage: string;
  };
}

export interface RawHtmlItem {
  hall_ticket: string;
  filename: string;
  size_bytes: number;
  updated_at: string;
}