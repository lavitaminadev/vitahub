-- VITAHUB Database Schema & Seed
-- Run: mysql -u root -p < seed.sql

CREATE DATABASE IF NOT EXISTS vitahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vitahub;

-- Organizations (tenants)
INSERT INTO organizations (id, name, code, currency, is_active, created_at, updated_at) VALUES
(UUID(), 'Vitamina Agency', 'VIT', 'CLP', 1, NOW(), NOW());

-- Get the organization ID
SET @org_id = (SELECT id FROM organizations LIMIT 1);

-- Admin user (password: admin123)
INSERT INTO users (id, organization_id, name, email, password, role, is_active, created_at, updated_at) VALUES
(UUID(), @org_id, 'Admin', 'admin@vitahub.cl',
 '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6m6m6m6m6m6m6m', -- bcrypt hash of "admin123"
 'admin', 1, NOW(), NOW());

-- Sample client
INSERT INTO clients (id, organization_id, name, industry, status, retainer_amount, currency, default_ud_budget, created_at, updated_at) VALUES
(UUID(), @org_id, 'Cliente Demo', 'Retail', 'active', 500000, 'CLP', 20, NOW(), NOW());

-- Sample lead
SET @client_id = (SELECT id FROM clients LIMIT 1);
INSERT INTO leads (id, organization_id, name, email, phone, company, status, created_at, updated_at) VALUES
(UUID(), @org_id, 'Lead Demo', 'lead@demo.cl', '+56912345678', 'Demo Corp', 'new', NOW(), NOW());

-- UD Budget for current month
INSERT INTO ud_budgets (id, client_id, year, month, contracted, reserved, consumed, status, created_at, updated_at) VALUES
(UUID(), @client_id, YEAR(CURDATE()), MONTH(CURDATE()), 20, 0, 0, 'open', NOW(), NOW());

-- Current week XP period
SET @user_id = (SELECT id FROM users LIMIT 1);
SET @week_start = DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY);
SET @week_end = DATE_ADD(@week_start, INTERVAL 6 DAY);
INSERT INTO xp_periods (id, organization_id, user_id, week_start, week_end, total_xp, tier, status, created_at, updated_at) VALUES
(UUID(), @org_id, @user_id, @week_start, @week_end, 0, 'bronze', 'open', NOW(), NOW());

-- API Service catalog
INSERT INTO services (id, organization_id, name, category, unit_price, currency, ud_per_unit, status, created_at, updated_at) VALUES
(UUID(), @org_id, 'Post Feed Simple', 'monthly', 50000, 'CLP', 1.0, 'active', NOW(), NOW()),
(UUID(), @org_id, 'Post Feed Autor', 'monthly', 75000, 'CLP', 1.5, 'active', NOW(), NOW()),
(UUID(), @org_id, 'Carrusel (4 slides)', 'monthly', 110000, 'CLP', 2.2, 'active', NOW(), NOW()),
(UUID(), @org_id, 'Story Original', 'monthly', 20000, 'CLP', 0.4, 'active', NOW(), NOW()),
(UUID(), @org_id, 'Story Adaptado', 'monthly', 5000, 'CLP', 0.1, 'active', NOW(), NOW()),
(UUID(), @org_id, 'Flyer Digital', 'monthly', 75000, 'CLP', 1.5, 'active', NOW(), NOW()),
(UUID(), @org_id, 'Reel Cover', 'monthly', 15000, 'CLP', 0.3, 'active', NOW(), NOW());

-- Sample pieces
INSERT INTO pieces (id, organization_id, client_id, type, title, status, difficulty_level, ud_amount, correction_count, created_at, updated_at) VALUES
(UUID(), @org_id, @client_id, 'post_simple', 'Lanzamiento Producto', 'backlog', 2, 1.0, 0, NOW(), NOW()),
(UUID(), @org_id, @client_id, 'carousel', 'Campaña Verano', 'backlog', 3, 2.2, 0, NOW(), NOW()),
(UUID(), @org_id, @client_id, 'story_original', 'Historia Instagram Semana 1', 'backlog', 1, 0.4, 0, NOW(), NOW());
