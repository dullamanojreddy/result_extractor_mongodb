# Database Schema (SQLite)

## Table: `students`
Stores overall student summary and result credentials.

```sql
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hall_ticket TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '-',
  father_name TEXT DEFAULT '-',
  course TEXT DEFAULT '-',
  exam TEXT DEFAULT '-',
  sgpa TEXT DEFAULT '-',
  cgpa TEXT DEFAULT '-',
  is_missing INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_ht ON students(hall_ticket);
CREATE INDEX IF NOT EXISTS idx_students_sgpa ON students(sgpa);
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa);
```

## Table: `subjects`
Stores individual course/subject grades for every student.

```sql
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  hall_ticket TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  credits REAL DEFAULT 0,
  semester TEXT DEFAULT '-',
  year TEXT DEFAULT '-',
  grade TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subjects_ht ON subjects(hall_ticket);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(subject_name);
CREATE INDEX IF NOT EXISTS idx_subjects_grade ON subjects(grade);
```

## Table: `mandatory_requirements`
Stores extra-curricular and mandatory activity completion statuses.

```sql
CREATE TABLE IF NOT EXISTS mandatory_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  hall_ticket TEXT NOT NULL,
  activity TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

## Table: `logs`
Stores execution runtime logs.

```sql
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  hall_ticket TEXT,
  type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')),
  message TEXT NOT NULL
);
```

## Table: `checkpoints`
Stores resume markers for long-running batch operations.

```sql
CREATE TABLE IF NOT EXISTS checkpoints (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_hall_ticket TEXT NOT NULL,
  end_hall_ticket TEXT NOT NULL,
  prefix TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
