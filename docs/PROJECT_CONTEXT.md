# VCE Result Analyzer - Project Context

## Overview
Desktop-grade academic result extractor, parser, and analytics application for Vasavi College of Engineering (VCE). Features a high-performance Producer-Consumer pipeline, local raw HTML caching, normalized MySQL persistence, and real-time rank/grade analytics.
That is a huge win! Now that the server behaves correctly on startup, we just need to fix the Name Extraction so your dashboard doesn't show - for every student.
Looking at your browser screenshot, the portal uses very simple labels (Name, Father's Name, Course). Here is the surgical fix for your parseVceHtml function in src/server/scraper.ts.
1. Update the Parser RegEx
In src/server/scraper.ts, replace the extraction logic with this version, which matches the exact labels seen in the VCE portal screenshot:
code
TypeScript
// Inside parseVceHtml function:

// 1. Extract Name (Matches 'Name' followed by the next <td>)
const nameMatch = html.match(/Name\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);

// 2. Extract Father's Name (Matches 'Father's Name' followed by the next <td>)
const fatherMatch = html.match(/Father's\s*Name\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);

// 3. Extract Course (Matches 'Course' followed by the next <td>)
const courseMatch = html.match(/Course\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);

// 4. Extract SGPA and CGPA
const sgpaMatch = html.match(/SGPA\s*[:\-]?\s*(\d+\.\d{2})/i);
const cgpaMatch = html.match(/CGPA\s*[:\-]?\s*(\d+\.\d{2})/i);

const clean = (val: string | undefined) => {
  if (!val) return '-';
  return val
    .replace(/<[^>]*>/g, '')   // Strip HTML tags
    .replace(/&nbsp;/g, ' ')   // Fix HTML spaces
    .replace(/\s+/g, ' ')      // Remove double spaces
    .trim() || '-';
};

const name = clean(nameMatch?.[1]);
const father_name = clean(fatherMatch?.[1]);
const course = clean(courseMatch?.[1]);
2. Force a refresh of the 30 students
Since the database already has those 30 records saved with names as -, the scraper will skip them (Cache Hit). You need to clear them out so the scraper runs the new logic on them:
Run this in MySQL Workbench:
code
SQL
SET SQL_SAFE_UPDATES = 0;
DELETE FROM students;
SET SQL_SAFE_UPDATES = 1;
3. Final Test
Restart your server.
Go to the UI.
Click Start Batch Extraction for 1 to 30.
Check the table.
## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Express.js, TypeScript
- **Database**: Local MySQL Pool (`mysql2`) with automatic normalized schema initialization (`students`, `subjects`, `student_subjects`, `mandatory_requirements`, `scrape_sessions`, `settings`, `logs`) + Local JSON fallback (`database/results.json`)
- **Raw Storage**: Disk HTML cache (`storage/raw/*.html`)
- **Exporter**: OpenPyXL / XLSX & PapaParse / CSV Exporter & Raw JSON Exporter

## Key Features & Architecture
1. **Producer-Consumer Pipeline**: 4-stage decoupled pipeline (Generator -> Fetch Workers -> Parser Workers -> DB Batch Writer) with live queue monitor & backpressure.
2. **Offline Raw HTML Storage**: Automatically saves raw HTML pages for re-parsing without hitting the live portal.
3. **Candidate Grade Memo Inspector**: Search any hall ticket number to render a printable/exportable official grade report card.
4. **Advanced Academic Analytics**: Rank lists (Top 10 SGPA & Top 10 CGPA), Distinction lists (SGPA >= 9.0), Risk Watch (SGPA < 6.0 & Backlogs), Branch breakdown, and Subject grade spread.
5. **MySQL Database & Local Fallback**: Automatically connects to local MySQL or seamlessly falls back to local JSON persistence.

## Project Structure
- `server.ts` - Main Express server & API routes
- `src/server/database.ts` - MySQL pool repository & Schema auto-creation
- `src/server/services/ScraperPipeline.ts` - Producer-Consumer pipeline engine
- `src/server/services/ParserEngine.ts` - Versioned HTML parser
- `src/server/services/RawHtmlStorage.ts` - Disk HTML caching & re-parser
- `src/server/services/AnalyticsService.ts` - High-level academic analytics
- `database/schema.sql` - Enterprise normalized SQL schema file
- `docs/JOB_MANAGER.md` - Job Manager & Task Scheduler documentation
- `docs/PERFORMANCE_TUNING.md` - Performance tuning & ingestion optimization benchmark guide
- `docs/ARCHITECTURE.md` - High-performance producer-consumer pipeline architecture
- `docs/` - Comprehensive documentation suite
