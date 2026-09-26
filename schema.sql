-- ============================================================
-- Pink Oaks Luxury Residences - SQL Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, and phpMyAdmin
-- ============================================================

-- 1. Create Database (optional, comment out if database already exists)
CREATE DATABASE IF NOT EXISTS `pinkoaks_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `pinkoaks_db`;

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `submitted_at` VARCHAR(40) NOT NULL COMMENT 'ISO 8601 submission timestamp',
  `name` VARCHAR(120) NOT NULL COMMENT 'Customer full name',
  `email` VARCHAR(180) NOT NULL COMMENT 'Customer email address',
  `phone` VARCHAR(40) NOT NULL COMMENT 'Customer contact number',
  `unit` VARCHAR(120) DEFAULT NULL COMMENT 'Unit or residence of interest',
  `message` TEXT DEFAULT NULL COMMENT 'Customer inquiry message or notes',
  `page_url` VARCHAR(500) DEFAULT NULL COMMENT 'Referring page URL',
  `utm_source` VARCHAR(80) DEFAULT NULL COMMENT 'Marketing campaign source',
  `utm_medium` VARCHAR(80) DEFAULT NULL COMMENT 'Marketing campaign medium',
  `utm_campaign` VARCHAR(80) DEFAULT NULL COMMENT 'Marketing campaign name',
  `ip` VARCHAR(60) DEFAULT NULL COMMENT 'Client IP address',
  `status` ENUM('new', 'contacted', 'scheduled', 'closed') DEFAULT 'new' COMMENT 'Lead pipeline status',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  KEY `idx_submitted_at` (`submitted_at`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pink Oaks website lead inquiries';
