-- Project Apex — PostgreSQL Initialization Script
-- This runs once when the container first starts.
-- SQLAlchemy will also run create_all on startup; this provides explicit DDL
-- for DBA review and manual deployments.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fast ILIKE search

-- ── Enum types ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE lead_source AS ENUM (
        'fb_ad', 'google_search', 'organic', 'referral', 'direct'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM (
        'new', 'contacted', 'quoted', 'booked', 'completed', 'lost'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Leads ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
    lead_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source          lead_source NOT NULL DEFAULT 'organic',
    status          lead_status NOT NULL DEFAULT 'new',

    -- Customer
    customer_name   VARCHAR(255) NOT NULL,
    customer_phone  VARCHAR(20) NOT NULL,
    customer_email  VARCHAR(255),

    -- Vehicle
    vehicle_make    VARCHAR(100),
    vehicle_model   VARCHAR(100),
    vehicle_year    VARCHAR(4),
    service_needed  TEXT,

    -- Attribution / tracking
    utm_source      VARCHAR(100),
    utm_medium      VARCHAR(100),
    utm_campaign    VARCHAR(255),
    ad_id           VARCHAR(255),
    ga4_client_id   VARCHAR(255),

    -- Internal
    notes           TEXT,
    assigned_to     VARCHAR(255),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source     ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads (customer_phone);
CREATE INDEX IF NOT EXISTS idx_leads_name_trgm  ON leads USING gin (customer_name gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Lead Events ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_events (
    event_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id     UUID NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
    event_type  VARCHAR(50) NOT NULL,   -- sms_sent, email_sent, status_changed, note_added
    payload     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id   ON lead_events (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON lead_events (created_at DESC);

-- ── Users (Admin Dashboard) ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'advisor',  -- admin | advisor | viewer
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Work Orders ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS work_orders (
    order_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID REFERENCES leads(lead_id) ON DELETE SET NULL,
    technician      VARCHAR(255),
    labor_hours     DECIMAL(5,2),
    parts_cost      DECIMAL(10,2),
    labor_cost      DECIMAL(10,2),
    total_amount    DECIMAL(10,2),
    invoice_number  VARCHAR(100) UNIQUE,
    paid            BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_payment_id VARCHAR(255),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_work_orders_updated_at ON work_orders;
CREATE TRIGGER set_work_orders_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Seed Data (demo only — remove for production) ──────────────────────────────

INSERT INTO leads (source, status, customer_name, customer_phone, customer_email,
                   vehicle_make, vehicle_model, vehicle_year, service_needed, utm_source)
VALUES
    ('fb_ad',        'new',       'Maria Garcia',   '+15551110001', 'maria@example.com',   'Honda',    'Civic',   '2020', 'Oil Change',         'facebook'),
    ('google_search','contacted', 'James Wilson',   '+15551110002', 'james@example.com',   'Ford',     'F-150',   '2019', 'Brake Inspection',   'google'),
    ('organic',      'quoted',    'Sarah Johnson',  '+15551110003', 'sarah@example.com',   'Toyota',   'Camry',   '2022', 'AC Repair',          NULL),
    ('fb_ad',        'booked',    'Robert Davis',   '+15551110004', 'robert@example.com',  'Chevrolet','Silverado','2018','Tire Rotation',      'facebook'),
    ('google_search','completed', 'Lisa Martinez',  '+15551110005', 'lisa@example.com',    'BMW',      '3 Series','2021', 'Engine Diagnostic',  'google'),
    ('referral',     'new',       'Michael Brown',  '+15551110006', 'mike@example.com',    'Nissan',   'Altima',  '2017', 'Transmission Fluid', NULL),
    ('organic',      'contacted', 'Emily Anderson', '+15551110007', 'emily@example.com',   'Subaru',   'Outback', '2023', 'Wheel Alignment',    NULL)
ON CONFLICT DO NOTHING;
