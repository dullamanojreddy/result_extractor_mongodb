# 📊 Result Analyzer

### Enterprise Result Extraction, Archiving & Academic Analytics Platform

Automatically extracts academic results from legacy **ASP.NET WebForms** portals by handling session initialization, ViewState, EventValidation, and cookies behind the scenes. The system batch-discovers result records, archives raw HTML locally, stores structured data in MySQL, and provides a modern analytics dashboard with real-time monitoring.

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite)

</p>

---

# Dashboard

<p align="center">
<img src="assets/dashboard.png" width="95%">
</p>

---

# Overview

Result Analyzer is an enterprise-grade scraping and analytics platform designed for extracting academic results from legacy ASP.NET WebForms portals. Instead of manually searching individual roll numbers, the system automatically discovers records within configurable ranges, manages ASP.NET session state, archives the raw HTML, parses structured information, and stores everything inside a MySQL database.

The platform includes a modern React dashboard that provides live scraping progress, student search, subject analytics, printable report cards, ranking metrics, and data export capabilities.

---

# Features

- 🚀 Automatic batch result extraction
- 🔐 Handles ASP.NET ViewState & EventValidation automatically
- 🍪 Automatic Session & Cookie management
- 🔄 Multi-worker Producer–Consumer scraping pipeline
- 📄 Raw HTML archival for offline reprocessing
- 🗄️ MySQL structured data storage
- 📊 Interactive analytics dashboard
- 🔍 Student directory with instant search
- 📑 Printable report cards
- 🏆 SGPA / CGPA ranking engine
- 📈 Subject-wise analytics
- 📦 Excel, CSV & JSON export
- 📡 Live pipeline monitor
- ⚡ Database caching to prevent duplicate requests
- ♻️ Resume interrupted scraping sessions
- 📋 Real-time logging terminal

---

# Screenshots

## Dashboard

<p align="center">
<img src="assets/dashboard.png" width="95%">
</p>

---

## Pipeline Monitor

<p align="center">
<img src="assets/pipeline.png" width="95%">
</p>

---

## Student Search

<p align="center">
<img src="assets/search.png" width="95%">
</p>

---

## Analytics

<p align="center">
<img src="assets/analytics.png" width="95%">
</p>

---

# System Architecture

```text
                   Legacy ASP.NET Portal
                             │
       Session Initialization & Cookie Manager
                             │
        ViewState / EventValidation Extraction
                             │
               Batch Request Generator
                             │
                   Fetch Worker Pool
                             │
                     Raw HTML Cache
                             │
                     Parser Engine
                             │
                   Database Repository
                             │
                    MySQL Data Storage
                             │
                 Analytics Service Layer
                             │
              React + TypeScript Dashboard
```

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL |
| Language | TypeScript |
| Spreadsheet Export | SheetJS |
| Icons | Lucide React |

---

# Project Structure

```text
result-analyzer/
│
├── database/
│   └── schema.sql
│
├── storage/
│   └── raw/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── server/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── .env.example
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

# Scraper Workflow

```text
Generate Roll Number Range
            │
            ▼
Initialize ASP.NET Session
            │
            ▼
Extract ViewState & EventValidation
            │
            ▼
Submit Form Request
            │
            ▼
Receive HTML Response
            │
            ▼
Store Raw HTML
            │
            ▼
Parse Student Details
            │
            ▼
Store Structured Data
            │
            ▼
Generate Analytics
            │
            ▼
Display Dashboard
```

---

# Performance Optimizations

- Multi-worker concurrent scraping
- Producer–Consumer queue architecture
- Automatic database cache checking
- Batch database inserts
- MySQL connection pooling
- Local HTML caching
- Queue backpressure control
- Indexed database lookups
- Automatic retry handling
- Incremental scraping support

---

# Installation

```bash
git clone https://github.com/yourusername/result-analyzer.git

cd result-analyzer

npm install

cp .env.example .env

npm run dev
```

---

# Environment Variables

```env
PORT=3000

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=result_analyzer
```

---

# API Overview

| Method | Endpoint | Description |
|----------|----------------------|------------------------------|
| GET | /api/health | Health status |
| POST | /api/pipeline/start | Start scraping |
| POST | /api/pipeline/pause | Pause pipeline |
| POST | /api/pipeline/resume | Resume pipeline |
| POST | /api/pipeline/stop | Stop pipeline |
| GET | /api/students | Get all students |
| GET | /api/student/:id | Get single student |
| POST | /api/subject-result | Subject analytics |
| GET | /api/export/excel | Export Excel |
| GET | /api/export/csv | Export CSV |
| GET | /api/export/json | Export JSON |

---

# Roadmap

- Multi-portal support
- Authentication & user roles
- OCR integration
- AI-powered analytics
- Docker deployment
- Redis job queue
- PostgreSQL support
- Cloud storage integration

---

# License

This project is released under the **MIT License**.

---

## ⭐ If you found this project useful, consider giving it a star on GitHub!