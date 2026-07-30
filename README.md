# 📊 Result Analyzer

### Enterprise Result Extraction, Intelligent Data Caching & Academic Analytics Platform

Automatically extracts academic results from legacy **ASP.NET WebForms** portals by handling session initialization, ViewState, EventValidation, cookies, and request workflows behind the scenes.

Result Analyzer is a scalable academic data platform that discovers, processes, stores, and analyzes student results across multiple universities and colleges.

Unlike traditional scraping systems, Result Analyzer follows a **database-first architecture** where previously extracted academic records are reused instantly, and only missing records are fetched from the original portal.

The platform provides a modern analytics dashboard with student search, grade cards, rankings, subject analytics, extraction monitoring, and secure academic data management.

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite)

</p>

---

# Overview

Result Analyzer is an enterprise-grade result extraction and academic analytics platform designed for processing results from legacy university portals.

The system eliminates manual hall ticket searching by automatically discovering records in batches, managing ASP.NET WebForms security mechanisms, parsing result pages, and storing structured academic information.

The platform uses an intelligent **Extract Once, Reuse Everywhere** approach.

Example:

```
Existing Database:

150 - 200 Student Records


New Request:

170 - 178


System:

170 - 178 → Loaded from MongoDB
0 Duplicate Portal Requests
```

This reduces extraction time, prevents duplicate scraping, decreases portal load, and creates a centralized academic result repository.

---

# Features

## 🚀 Result Extraction Engine

- Automatic batch result extraction
- ASP.NET ViewState handling
- ASP.NET EventValidation handling
- Automatic session and cookie management
- Legacy portal compatibility
- Retry and failure recovery
- Incremental extraction support


## 🧠 Intelligent Data Processing

- MongoDB academic repository
- Database-first architecture
- Automatic cache checking
- Duplicate record prevention
- Missing-record extraction
- Shared academic data storage
- College-wise data isolation
- University-wise organization


## 🏫 Multi-University Support

Architecture supports:

```
University
     |
     ├── College
     |       |
     |       ├── Branch
     |       |
     |       └── Batch
     |
     └── Student Records
```

Supported expansion:

- Osmania University (OU)
- Jawaharlal Nehru Technological University Hyderabad (JNTUH)
- Future university integrations


## 📊 Analytics Dashboard

- Student directory
- Hall ticket search
- Candidate name search
- Grade card generation
- SGPA analytics
- CGPA analytics
- Ranking system
- Subject performance analysis
- Academic insights


## 📦 Export System

- Excel export
- CSV export
- JSON export


## 📡 Monitoring

- Real-time processing status
- Extraction progress
- Database synchronization status
- System health monitoring
- Admin debugging information

---

# System Architecture

```
                    User Request
                          |
                          |
                          ▼

              College & Batch Selection

                          |
                          |
                          ▼

              Data Availability Engine

                    /             \

                   /               \

                  ▼                 ▼

        MongoDB Existing Data    Extraction Engine


                  |                 |

                  |                 ▼

                  |          ASP.NET Portal

                  |                 |

                  |                 ▼

                  |       Session Initialization

                  |                 |

                  |                 ▼

                  |       ViewState Processing

                  |                 |

                  |                 ▼

                  |       Result Fetching


                  \                 /

                   \               /

                    ▼             ▼


              Academic Data Repository

                          |

                          ▼

              Analytics Service Layer

                          |

                          ▼

              React TypeScript Dashboard
```

---

# Result Processing Workflow

```
User Selects College & Student Range

              |
              ▼

Check MongoDB Records

              |
       -----------------
       |               |
       ▼               ▼

Data Exists       Data Missing

       |               |
       ▼               ▼

Load Database    Start Extraction

                       |
                       ▼

             Initialize ASP.NET Session

                       |
                       ▼

             Extract ViewState Data

                       |
                       ▼

             Submit Result Request

                       |
                       ▼

             Receive HTML Response

                       |
                       ▼

             Parse Student Information

                       |
                       ▼

             Store MongoDB Records


                       |
                       ▼

             Generate Analytics

                       |
                       ▼

             Display Dashboard
```

---

# Intelligent Cache Example

```
Database:

001
002
003
...
200


User Request:

170 - 178


Backend:

✓ Checking Academic Database

✓ Existing Records Found

✓ Skipping Duplicate Extraction

✓ Loading Secure Records

✓ Preparing Dashboard
```

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| ODM | Mongoose |
| Language | TypeScript |
| Export | SheetJS |
| Icons | Lucide React |

---

# Project Structure

```
result-analyzer/

│
├── storage/
│   └── raw-html/
│
├── src/
│
│   ├── components/
│   │
│   ├── pages/
│   │
│   ├── server/
│   │
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── docs/
│
├── .env.example
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

# Performance Optimizations

- Database-first architecture
- Intelligent caching
- Incremental extraction
- Duplicate request prevention
- MongoDB indexing
- Batch database operations
- Worker-based processing
- Retry mechanisms
- Raw HTML archival
- Resume interrupted extraction
- Optimized student lookup

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

MONGODB_URI=mongodb://127.0.0.1:27017/result_analyzer

JWT_SECRET=your_secret_key
```

---

# API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | System health |
| POST | /api/pipeline/start | Start processing |
| POST | /api/pipeline/pause | Pause processing |
| POST | /api/pipeline/resume | Resume processing |
| POST | /api/pipeline/stop | Stop processing |
| GET | /api/students | Student directory |
| GET | /api/student/:id | Student details |
| GET | /api/dashboard | Analytics dashboard |
| POST | /api/subject-result | Subject analytics |
| GET | /api/export/excel | Export Excel |
| GET | /api/export/csv | Export CSV |
| GET | /api/export/json | Export JSON |

---

# 👨‍💻 Developer

## Dulla Manoj Reddy

Building scalable academic automation platforms using data extraction, intelligent caching, and analytics.

---

## ⭐ If you found this project useful, consider giving it a star on GitHub!
