-- VCE Result Analyzer - Enterprise Normalized MySQL Schema
-- Run this script in MySQL Workbench, phpMyAdmin, or mysql CLI

CREATE DATABASE IF NOT EXISTS `vce_results` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vce_results`;

-- 1. Students Master Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hall_ticket` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) DEFAULT '-',
  `father_name` VARCHAR(255) DEFAULT '-',
  `course` VARCHAR(255) DEFAULT '-',
  `branch` VARCHAR(255) DEFAULT '-',
  `exam` VARCHAR(255) DEFAULT '-',
  `sgpa` VARCHAR(20) DEFAULT '-',
  `cgpa` VARCHAR(20) DEFAULT '-',
  `is_missing` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_hall_ticket` (`hall_ticket`),
  INDEX `idx_sgpa` (`sgpa`),
  INDEX `idx_cgpa` (`cgpa`),
  INDEX `idx_branch` (`branch`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Subjects Master Catalog Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_code` VARCHAR(50) NOT NULL UNIQUE,
  `subject_name` VARCHAR(255) NOT NULL,
  `credits` VARCHAR(20) DEFAULT '3.0',
  `semester` VARCHAR(20) DEFAULT '-',
  `year` VARCHAR(20) DEFAULT '-',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_subject_code` (`subject_code`),
  INDEX `idx_subject_name` (`subject_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Student-Subject Grade Mapping (Junction Table)
CREATE TABLE IF NOT EXISTS `student_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `grade` VARCHAR(10) NOT NULL DEFAULT '-',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_subject` (`student_id`, `subject_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Mandatory Requirements Table
CREATE TABLE IF NOT EXISTS `mandatory_requirements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `activity` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PASSED',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Scrape Sessions History
CREATE TABLE IF NOT EXISTS `scrape_sessions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `prefix` VARCHAR(50) NOT NULL,
  `start_num` VARCHAR(50) NOT NULL,
  `end_num` VARCHAR(50) NOT NULL,
  `total_tickets` INT DEFAULT 0,
  `processed` INT DEFAULT 0,
  `found` INT DEFAULT 0,
  `missing` INT DEFAULT 0,
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `finished_at` DATETIME NULL,
  `status` VARCHAR(20) DEFAULT 'running',
  `duration_seconds` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Key-Value Application Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. System Logs Audit Table
CREATE TABLE IF NOT EXISTS `logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `timestamp` VARCHAR(50) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `message` TEXT NOT NULL,
  `hall_ticket` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`),
  INDEX `idx_log_ticket` (`hall_ticket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
