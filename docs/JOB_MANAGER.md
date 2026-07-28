# VCE Result Analyzer - Job Manager & Task Scheduler

## Overview
The **Job Manager** abstracts bulk result ingestion into tracked execution jobs (`JOB_<TIMESTAMP>`). Every scraping or database synchronization session is treated as an isolated, stateful background task with full lifecycle control:

- **Lifecycle States**: `idle` ➔ `running` ➔ `paused` ➔ `completed` / `error`
- **Dynamic Control**: In-flight pause, resume, cancel, and targeted retry of failed hall tickets.
- **Progress Tracking**: Real-time progress percentage, items processed, remaining count, throughput rate (items/min), and estimated completion time (ETA).

---

## Job Lifecycle Architecture

```text
 User Interface
       │ (HTTP POST /api/pipeline/start)
       ▼
 ┌──────────────┐
 │ Job Manager  │ ◄── Creates & Initializes Session (ID: JOB_1753658200)
 └──────┬───────┘
        │
        ├──► 1. Pre-Run Database Memory Check (HashSet Deduplication)
        │       • Loads existing hall tickets into memory set
        │       • Filters out already processed tickets (O(1) lookup)
        │
        ├──► 2. Launch 4-Stage Decoupled Pipeline
        │       • Stage A: Ticket Generator
        │       • Stage B: Async Fetch Workers (I/O Bound, 3-8 threads)
        │       • Stage C: DOM Parser Workers (CPU Bound, 2-4 threads)
        │       • Stage D: Batch Database Writer (Transaction Batches of 5-100)
        │
        └──► 3. Real-Time Monitor & Backpressure Watchdog
                • Pauses fetchers if Parse Queue > 30 or DB Queue > 40
                • Calculates live throughput and ETA
```

---

## API Endpoints for Job Control

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/pipeline/start` | `POST` | Create and start a new scraping job session |
| `/api/pipeline/pause` | `POST` | Pause the active job session |
| `/api/pipeline/resume` | `POST` | Resume a paused job session |
| `/api/pipeline/stop` | `POST` | Cancel the running job session |
| `/api/pipeline/stats` | `GET` | Retrieve real-time job metrics and queue sizes |
| `/api/raw-html/reparse` | `POST` | Re-parse all cached raw HTML offline without network requests |

---

## Configuration Options

```json
{
  "portal_url": "https://sis.vce.ac.in/Results_BE_02-07-2026/",
  "prefix": "1602-24-737-",
  "start_num": "001",
  "end_num": "120",
  "delay_seconds": 0.5,
  "retry_limit": 3,
  "fetch_workers": 4,
  "parse_workers": 2,
  "db_batch_size": 10,
  "skip_existing": true
}
```
