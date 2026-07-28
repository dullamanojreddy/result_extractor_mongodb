# Local MySQL Setup Guide for VCE Result Analyzer

This document explains how to configure and run local MySQL database with the VCE Result Analyzer.

---

## 1. Quick Prerequisites

You need a running MySQL instance on your local machine or network:
- **MySQL Server 8.0+** or **MariaDB 10.5+**
- (Optional) **MySQL Workbench** or **phpMyAdmin** or **Docker**

---

## 2. Using Docker for Instant Local MySQL (Recommended)

Run the following command in your local terminal:

```bash
docker run -d \
  --name mysql-vce \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=vce_results \
  mysql:8
```

---

## 3. Database Schema Setup

The application automatically creates required tables (`students`, `logs`, `checkpoints`) when connecting to MySQL.

If you prefer to execute the SQL statements manually:

1. Locate `/database/schema.sql` in this project.
2. Run it inside your MySQL client:

```sql
CREATE DATABASE IF NOT EXISTS `vce_results`;
USE `vce_results`;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hall_ticket` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) DEFAULT '-',
  `father_name` VARCHAR(255) DEFAULT '-',
  `course` VARCHAR(255) DEFAULT '-',
  `exam` VARCHAR(255) DEFAULT '-',
  `sgpa` VARCHAR(20) DEFAULT '-',
  `cgpa` VARCHAR(20) DEFAULT '-',
  `is_missing` TINYINT(1) DEFAULT 0,
  `subjects` JSON DEFAULT NULL,
  `mandatory_requirements` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_hall_ticket` (`hall_ticket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `timestamp` VARCHAR(50) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `message` TEXT NOT NULL,
  `hall_ticket` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. Connecting via Application UI

1. Open the **Settings** modal in the top right menu.
2. Select the **MySQL Local Database** tab.
3. Enter your parameters:
   - **Host**: `localhost` (or `127.0.0.1`)
   - **Port**: `3306`
   - **User**: `root`
   - **Password**: `root` (or your password)
   - **Database**: `vce_results`
4. Click **Test & Save MySQL Connection**.
5. Once connected, the header status badge will display **MySQL Live**!

---

## 5. Automatic Fallback Mode

If MySQL server is offline or unreachable, the system automatically falls back to local JSON storage without breaking application functionality or interrupting student result extraction.
