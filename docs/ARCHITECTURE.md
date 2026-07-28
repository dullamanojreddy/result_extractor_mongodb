# VCE Result Analyzer - High-Performance Pipeline Architecture

```text
                        VCE RESULT ANALYZER
                      Enterprise Architecture

                           React 19 GUI
                                │
                                ▼
                   Application Service Layer
                                │
   ┌────────────────────┬───────┴────────────┬───────────────────┐
   ▼                    ▼                    ▼                   ▼
Scraper Pipeline   Analytics Service   Export Service     Raw HTML Storage
   │                    │                    │                   │
   ├─ Fetch Workers     └────────────────────┼───────────────────┘
   ├─ Parse Workers                          │
   └─ DB Batch Worker                        ▼
                                     Repository Layer
                                             │
                                             ▼
                                 MySQL Database / JSON Local
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
                  students               subjects          student_subjects
```

## Producer-Consumer Pipeline Architecture

Instead of single-threaded synchronous scraping, the application runs an asynchronous 4-stage pipeline:

```text
1. Hall Ticket Generator  ──►  2. Fetch Queue  ──►  3. Parse Queue  ──►  4. DB Batch Queue
   (Generates HT Range)        (Fetch Workers)       (Parser Workers)     (Database Writer)
```

### Stage 1: Ticket Generator
Generates hall ticket sequences without network I/O.

### Stage 2: Fetch Workers (N Threads)
- Asynchronously submits HTTP POST requests to the VCE portal.
- Checks local `storage/raw/{hall_ticket}.html` cache before hitting network.
- Saves raw fetched HTML to disk (`storage/raw/`) for offline debugging and re-parsing.
- Pushes fetched HTML into the Parse Queue.

### Stage 3: Parser Workers (M Threads)
- Versioned parser engine (`ParserEngine`) parses raw HTML without network overhead.
- Extracts candidate name, father name, course, branch, SGPA, CGPA, subjects table, and mandatory activities.
- Handles missing or invalid hall tickets safely.
- Pushes structured `Student` domain models into the DB Batch Queue.

### Stage 4: Database Batch Worker
- Batches writes into MySQL (with fallback to local `database/results.json`).
- Commits transactions in configurable batches (e.g. 5 records/commit).
- Enforces backpressure: if DB queue exceeds 40 pending items, Fetch Workers slow down to prevent memory leaks.

## Repository Pattern & Layered Structure
- **UI Layer**: React 19 components (`PipelineMonitorModal`, `StudentReportCardModal`, `AdvancedAnalyticsModal`).
- **Service Layer**: `ScraperPipeline`, `AnalyticsService`, `RawHtmlStorage`, `ExporterService`.
- **Repository Layer**: `StudentRepository`, `SubjectRepository`, `AnalyticsRepository`.
- **Database Layer**: MySQL Connection Pool (`mysql2`) with automatic schema creation & local JSON memory fallback.
