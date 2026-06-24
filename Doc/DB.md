# Imposify — Enterprise-Grade Database Design

## Principal Database Architect Documentation

---

# PART 1: CONCEPTUAL DATA MODEL

## 1.1 Entity Identification

```
Core Business Entities:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│                   IMPOSIFY ENTITIES                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  IDENTITY DOMAIN          DOCUMENT DOMAIN               │
│  ┌──────────┐             ┌─────────────┐               │
│  │  Users   │             │ PDF Uploads │               │
│  └──────────┘             └─────────────┘               │
│  ┌──────────┐             ┌─────────────┐               │
│  │  Roles   │             │PDF Metadata │               │
│  └──────────┘             └─────────────┘               │
│  ┌──────────────┐         ┌──────────────┐              │
│  │ Permissions  │         │Generated PDFs│              │
│  └──────────────┘         └──────────────┘              │
│                                                          │
│  PROCESSING DOMAIN        COMMERCE DOMAIN               │
│  ┌──────────────┐         ┌───────────────┐             │
│  │Layout Presets│         │ Subscriptions │             │
│  └──────────────┘         └───────────────┘             │
│  ┌──────────────┐         ┌───────────────┐             │
│  │   Jobs       │         │   Payments    │             │
│  └──────────────┘         └───────────────┘             │
│                                                          │
│  OBSERVABILITY DOMAIN                                    │
│  ┌──────────────┐         ┌───────────────┐             │
│  │  Analytics   │         │  Audit Logs   │             │
│  └──────────────┘         └───────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 1.2 High-Level Entity Relationships

```
┌───────────────────────────────────────────────────────────────────┐
│                    CONCEPTUAL ER DIAGRAM                           │
└───────────────────────────────────────────────────────────────────┘

         ┌──────────┐    has many    ┌──────────┐
         │  ROLES   │◄──────────────►│  USERS   │
         └──────────┘                └──────────┘
              │                           │
              │ has many                  │ performs
              ▼                           │
         ┌──────────────┐               ┌▼──────────────┐
         │ PERMISSIONS  │               │  PDF UPLOADS  │
         └──────────────┘               └───────────────┘
                                              │
                                    ┌─────────┼─────────┐
                                    │         │         │
                               has one    triggers  has one
                                    │         │         │
                                    ▼         ▼         ▼
                             ┌──────────┐ ┌──────┐ ┌────────────┐
                             │PDF META  │ │ JOBS │ │GENERATED   │
                             │DATA      │ │      │ │PDFs        │
                             └──────────┘ └──────┘ └────────────┘
                                               │
                                         uses preset
                                               │
                                    ┌──────────▼──────────┐
                                    │   LAYOUT PRESETS    │
                                    └─────────────────────┘

         ┌──────────┐    has one     ┌──────────────┐
         │  USERS   │──────────────►│SUBSCRIPTIONS │
         └──────────┘               └──────────────┘
              │                           │
              │ makes                     │ triggers
              ▼                           ▼
         ┌──────────┐               ┌──────────────┐
         │ PAYMENTS │               │  ANALYTICS   │
         └──────────┘               └──────────────┘
              │
              │ logged in
              ▼
         ┌──────────┐
         │AUDIT LOGS│
         └──────────┘
```

---

# PART 2: LOGICAL DATA MODEL

## 2.1 Complete Entity Attribute Model

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: user_id (UUID)
    email (UNIQUE, NOT NULL)
    username (UNIQUE, NOT NULL)
    password_hash (NOT NULL)
    full_name
    avatar_url
    phone_number
    country_code
    timezone
    locale
    email_verified (BOOLEAN)
    phone_verified (BOOLEAN)
    is_active (BOOLEAN)
    is_deleted (BOOLEAN)
    last_login_at (TIMESTAMP)
    last_login_ip (INET)
    failed_login_attempts (INTEGER)
    locked_until (TIMESTAMP)
FK: role_id → roles.role_id
FK: subscription_id → subscriptions.subscription_id
    created_at (TIMESTAMP)
    updated_at (TIMESTAMP)
    deleted_at (TIMESTAMP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: roles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: role_id (UUID)
    role_name (UNIQUE, NOT NULL)
    role_slug (UNIQUE, NOT NULL)
    description
    is_system_role (BOOLEAN)
    priority_level (INTEGER)
    created_at
    updated_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: permissions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: permission_id (UUID)
    permission_name (UNIQUE, NOT NULL)
    permission_slug (UNIQUE, NOT NULL)
    module_name (NOT NULL)
    action_type (ENUM: create,read,update,delete,execute)
    description
    created_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: role_permissions (Junction)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: (role_id, permission_id)
FK: role_id → roles.role_id
FK: permission_id → permissions.permission_id
    granted_by (UUID)
    granted_at (TIMESTAMP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: pdf_uploads
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: upload_id (UUID)
FK: user_id → users.user_id
    original_filename (NOT NULL)
    stored_filename (NOT NULL)
    storage_path (NOT NULL)
    storage_provider (ENUM: local, s3, gcs)
    storage_bucket
    file_size_bytes (BIGINT)
    file_hash_sha256 (NOT NULL)
    mime_type
    upload_source (ENUM: web, api, mobile)
    upload_status (ENUM: pending,processing,completed,failed)
    virus_scan_status (ENUM: pending,clean,infected,skipped)
    virus_scan_at (TIMESTAMP)
    is_public (BOOLEAN)
    is_deleted (BOOLEAN)
    expires_at (TIMESTAMP)
    created_at
    updated_at
    deleted_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: pdf_metadata
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: metadata_id (UUID)
FK: upload_id → pdf_uploads.upload_id (1:1)
    title
    author
    subject
    keywords (TEXT[])
    creator_application
    producer
    pdf_version
    total_pages (INTEGER)
    page_width_pt (NUMERIC)
    page_height_pt (NUMERIC)
    page_orientation (ENUM: portrait, landscape, mixed)
    has_bookmarks (BOOLEAN)
    has_forms (BOOLEAN)
    has_annotations (BOOLEAN)
    is_encrypted (BOOLEAN)
    is_linearized (BOOLEAN)
    color_space (ENUM: rgb, cmyk, grayscale, mixed)
    dpi_detected (INTEGER)
    language_detected
    estimated_print_pages (INTEGER)
    creation_date (TIMESTAMP)
    modification_date (TIMESTAMP)
    extracted_at (TIMESTAMP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: layout_presets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: preset_id (UUID)
FK: created_by → users.user_id (NULL = system preset)
    preset_name (NOT NULL)
    preset_slug (NOT NULL)
    preset_type (ENUM: system, user_custom, organization)
    description
    pages_per_sheet (INTEGER: 1,2,4,6,8,9,16)
    layout_columns (INTEGER)
    layout_rows (INTEGER)
    duplex_mode (ENUM: none, long_edge, short_edge)
    binding_edge (ENUM: left, right, top, bottom)
    page_order (ENUM: horizontal, horizontal_rtl, vertical, booklet)
    margin_top_mm (NUMERIC)
    margin_bottom_mm (NUMERIC)
    margin_left_mm (NUMERIC)
    margin_right_mm (NUMERIC)
    gutter_mm (NUMERIC)
    rotation_degrees (INTEGER: 0, 90, 180, 270)
    scale_factor (NUMERIC)
    paper_size (ENUM: A4,A3,Letter,Legal,Custom)
    custom_width_mm (NUMERIC)
    custom_height_mm (NUMERIC)
    show_border (BOOLEAN)
    show_page_numbers (BOOLEAN)
    page_number_position (ENUM: top_left,top_center,...,bottom_right)
    watermark_text
    watermark_opacity (NUMERIC)
    is_booklet_mode (BOOLEAN)
    front_page_arrangement (JSONB)
    back_page_arrangement (JSONB)
    is_active (BOOLEAN)
    is_deleted (BOOLEAN)
    usage_count (INTEGER)
    created_at
    updated_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: processing_jobs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: job_id (UUID)
FK: user_id → users.user_id
FK: upload_id → pdf_uploads.upload_id
FK: preset_id → layout_presets.preset_id
FK: generated_pdf_id → generated_pdfs.generated_pdf_id
    job_type (ENUM: imposition, compression, merge, split)
    job_status (ENUM: queued,running,completed,failed,cancelled,retrying)
    priority (INTEGER: 1-10)
    queue_name
    worker_id
    attempt_number (INTEGER)
    max_attempts (INTEGER)
    progress_percentage (NUMERIC)
    progress_message
    input_parameters (JSONB)
    output_parameters (JSONB)
    error_code
    error_message
    error_stack_trace
    started_at (TIMESTAMP)
    completed_at (TIMESTAMP)
    processing_duration_ms (BIGINT)
    cpu_usage_percent (NUMERIC)
    memory_usage_mb (NUMERIC)
    created_at
    updated_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: generated_pdfs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: generated_pdf_id (UUID)
FK: upload_id → pdf_uploads.upload_id
FK: user_id → users.user_id
FK: preset_id → layout_presets.preset_id
FK: job_id → processing_jobs.job_id
    output_filename (NOT NULL)
    storage_path (NOT NULL)
    storage_provider (ENUM: local, s3, gcs)
    file_size_bytes (BIGINT)
    file_hash_sha256
    total_pages_original (INTEGER)
    total_pages_output (INTEGER)
    pages_per_sheet (INTEGER)
    size_reduction_percent (NUMERIC)
    estimated_paper_saved (INTEGER)
    estimated_cost_saved (NUMERIC)
    download_count (INTEGER)
    last_downloaded_at (TIMESTAMP)
    download_url
    download_url_expires_at (TIMESTAMP)
    is_deleted (BOOLEAN)
    expires_at (TIMESTAMP)
    created_at
    updated_at
    deleted_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: subscriptions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: subscription_id (UUID)
FK: user_id → users.user_id
FK: plan_id → subscription_plans.plan_id
    status (ENUM: active,inactive,cancelled,past_due,trialing,paused)
    billing_cycle (ENUM: monthly, annual, lifetime)
    current_period_start (DATE)
    current_period_end (DATE)
    trial_start (DATE)
    trial_end (DATE)
    cancel_at_period_end (BOOLEAN)
    cancelled_at (TIMESTAMP)
    cancellation_reason
    payment_gateway (ENUM: stripe, razorpay, paddle)
    gateway_subscription_id
    gateway_customer_id
    uploads_used_this_period (INTEGER)
    uploads_limit_this_period (INTEGER)
    storage_used_bytes (BIGINT)
    storage_limit_bytes (BIGINT)
    created_at
    updated_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: subscription_plans
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: plan_id (UUID)
    plan_name (NOT NULL)
    plan_slug (UNIQUE, NOT NULL)
    description
    plan_tier (ENUM: free, student, pro, enterprise)
    price_monthly (NUMERIC)
    price_annual (NUMERIC)
    currency_code (CHAR(3))
    max_uploads_per_month (INTEGER)
    max_file_size_mb (INTEGER)
    max_pages_per_file (INTEGER)
    storage_limit_gb (NUMERIC)
    max_generated_pdfs_stored (INTEGER)
    allows_watermark_removal (BOOLEAN)
    allows_custom_presets (BOOLEAN)
    allows_api_access (BOOLEAN)
    allows_priority_processing (BOOLEAN)
    allows_batch_processing (BOOLEAN)
    allows_advanced_compression (BOOLEAN)
    max_batch_size (INTEGER)
    support_level (ENUM: community,email,priority,dedicated)
    is_active (BOOLEAN)
    sort_order (INTEGER)
    created_at
    updated_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: payments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: payment_id (UUID)
FK: user_id → users.user_id
FK: subscription_id → subscriptions.subscription_id
    payment_type (ENUM: subscription, one_time, refund, credit)
    amount (NUMERIC, NOT NULL)
    currency_code (CHAR(3))
    amount_in_cents (BIGINT)
    status (ENUM: pending,processing,succeeded,failed,refunded,disputed)
    payment_gateway (ENUM: stripe, razorpay, paddle)
    gateway_payment_id (UNIQUE)
    gateway_invoice_id
    gateway_charge_id
    payment_method_type (ENUM: card, upi, netbanking, wallet)
    payment_method_last4
    payment_method_brand
    billing_name
    billing_email
    billing_address_line1
    billing_address_line2
    billing_city
    billing_state
    billing_country_code
    billing_postal_code
    tax_amount (NUMERIC)
    tax_rate (NUMERIC)
    discount_amount (NUMERIC)
    coupon_code
    failure_code
    failure_message
    refunded_amount (NUMERIC)
    refunded_at (TIMESTAMP)
    invoice_url
    receipt_url
    paid_at (TIMESTAMP)
    created_at
    updated_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: analytics_events
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: event_id (UUID)
FK: user_id → users.user_id (nullable for anon)
FK: session_id → user_sessions.session_id
    event_type (NOT NULL)
    event_category (ENUM: upload,process,download,auth,subscription,ui)
    event_action
    event_label
    event_value (NUMERIC)
    upload_id (UUID, FK nullable)
    job_id (UUID, FK nullable)
    preset_id (UUID, FK nullable)
    page_url
    referrer_url
    user_agent
    ip_address (INET)
    country_code
    city
    device_type (ENUM: desktop, mobile, tablet)
    browser_name
    os_name
    session_duration_ms (BIGINT)
    properties (JSONB)
    created_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: user_sessions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: session_id (UUID)
FK: user_id → users.user_id
    session_token_hash (NOT NULL, UNIQUE)
    refresh_token_hash
    ip_address (INET)
    user_agent
    device_fingerprint
    is_active (BOOLEAN)
    expires_at (TIMESTAMP)
    last_activity_at (TIMESTAMP)
    created_at
    revoked_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTITY: audit_logs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PK: audit_id (UUID)
FK: user_id → users.user_id (nullable)
FK: session_id → user_sessions.session_id (nullable)
    action_type (NOT NULL)
    action_category (ENUM: auth,data,admin,payment,security,system)
    table_name
    record_id
    old_values (JSONB)
    new_values (JSONB)
    changed_fields (TEXT[])
    ip_address (INET)
    user_agent
    request_id
    api_endpoint
    http_method
    http_status_code (INTEGER)
    severity (ENUM: info,warning,error,critical)
    is_suspicious (BOOLEAN)
    risk_score (INTEGER)
    notes
    created_at (TIMESTAMP, NOT NULL)
```

---

# PART 3: PHYSICAL DATA MODEL — COMPLETE SQL

## 3.1 Database Configuration & Extensions

```sql
-- ============================================================
-- IMPOSIFY DATABASE — PHYSICAL MODEL
-- Version: 1.0.0
-- Architect: Principal Database Architect
-- Target: PostgreSQL 16+
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "tablefunc";

-- ============================================================
-- SCHEMA SEPARATION
-- ============================================================

CREATE SCHEMA IF NOT EXISTS core;       -- Users, Auth
CREATE SCHEMA IF NOT EXISTS documents;  -- PDF domain
CREATE SCHEMA IF NOT EXISTS commerce;   -- Billing domain
CREATE SCHEMA IF NOT EXISTS analytics;  -- Events domain
CREATE SCHEMA IF NOT EXISTS audit;      -- Compliance domain
CREATE SCHEMA IF NOT EXISTS config;     -- System config

-- Set search path
SET search_path TO core, documents, commerce, analytics, audit, config, public;
```

## 3.2 Custom ENUM Types

```sql
-- ============================================================
-- ENUM TYPE DEFINITIONS
-- ============================================================

-- Auth & User Enums
CREATE TYPE core.user_status AS ENUM (
    'active', 'inactive', 'suspended', 'pending_verification', 'deleted'
);

CREATE TYPE core.auth_provider AS ENUM (
    'local', 'google', 'github', 'microsoft'
);

CREATE TYPE core.action_type AS ENUM (
    'create', 'read', 'update', 'delete', 'execute', 'export', 'import'
);

-- Storage Enums
CREATE TYPE documents.storage_provider AS ENUM (
    'local', 's3', 'gcs', 'azure_blob'
);

CREATE TYPE documents.upload_status AS ENUM (
    'pending', 'uploading', 'processing', 'completed', 'failed', 'quarantined'
);

CREATE TYPE documents.virus_scan_status AS ENUM (
    'pending', 'scanning', 'clean', 'infected', 'skipped', 'error'
);

CREATE TYPE documents.upload_source AS ENUM (
    'web', 'api', 'mobile_ios', 'mobile_android', 'browser_extension'
);

-- PDF Enums
CREATE TYPE documents.page_orientation AS ENUM (
    'portrait', 'landscape', 'mixed'
);

CREATE TYPE documents.color_space AS ENUM (
    'rgb', 'cmyk', 'grayscale', 'mixed', 'unknown'
);

-- Layout Enums
CREATE TYPE documents.preset_type AS ENUM (
    'system', 'user_custom', 'organization', 'shared'
);

CREATE TYPE documents.duplex_mode AS ENUM (
    'none', 'long_edge', 'short_edge'
);

CREATE TYPE documents.binding_edge AS ENUM (
    'left', 'right', 'top', 'bottom'
);

CREATE TYPE documents.page_order AS ENUM (
    'horizontal', 'horizontal_rtl', 'vertical', 'booklet',
    'booklet_rtl', 'custom'
);

CREATE TYPE documents.paper_size AS ENUM (
    'A3', 'A4', 'A5', 'B4', 'B5', 'Letter', 'Legal',
    'Tabloid', 'Executive', 'Custom'
);

CREATE TYPE documents.page_number_position AS ENUM (
    'top_left', 'top_center', 'top_right',
    'bottom_left', 'bottom_center', 'bottom_right'
);

-- Job Enums
CREATE TYPE documents.job_type AS ENUM (
    'imposition', 'compression', 'merge', 'split',
    'rotate', 'watermark', 'thumbnail_generation', 'metadata_extraction'
);

CREATE TYPE documents.job_status AS ENUM (
    'queued', 'running', 'completed', 'failed',
    'cancelled', 'retrying', 'timeout'
);

-- Commerce Enums
CREATE TYPE commerce.subscription_status AS ENUM (
    'active', 'inactive', 'cancelled', 'past_due',
    'trialing', 'paused', 'unpaid'
);

CREATE TYPE commerce.billing_cycle AS ENUM (
    'monthly', 'annual', 'lifetime', 'custom'
);

CREATE TYPE commerce.payment_gateway AS ENUM (
    'stripe', 'razorpay', 'paddle', 'paypal', 'manual'
);

CREATE TYPE commerce.payment_status AS ENUM (
    'pending', 'processing', 'succeeded', 'failed',
    'refunded', 'partially_refunded', 'disputed', 'voided'
);

CREATE TYPE commerce.payment_type AS ENUM (
    'subscription', 'one_time', 'refund', 'credit', 'adjustment'
);

CREATE TYPE commerce.payment_method_type AS ENUM (
    'card', 'upi', 'netbanking', 'wallet', 'bank_transfer', 'crypto'
);

CREATE TYPE commerce.plan_tier AS ENUM (
    'free', 'student', 'pro', 'team', 'enterprise'
);

CREATE TYPE commerce.support_level AS ENUM (
    'community', 'email', 'priority', 'dedicated', 'sla'
);

-- Analytics Enums
CREATE TYPE analytics.event_category AS ENUM (
    'upload', 'process', 'download', 'auth',
    'subscription', 'ui', 'api', 'error', 'performance'
);

CREATE TYPE analytics.device_type AS ENUM (
    'desktop', 'mobile', 'tablet', 'unknown'
);

-- Audit Enums
CREATE TYPE audit.action_category AS ENUM (
    'auth', 'data', 'admin', 'payment', 'security', 'system', 'api'
);

CREATE TYPE audit.severity AS ENUM (
    'debug', 'info', 'warning', 'error', 'critical'
);
```

## 3.3 Core Schema — Users & Auth

```sql
-- ============================================================
-- TABLE: core.roles
-- Purpose: Define user roles within the system
-- ============================================================

CREATE TABLE core.roles (
    role_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name       VARCHAR(100) NOT NULL,
    role_slug       VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system_role  BOOLEAN NOT NULL DEFAULT FALSE,
    priority_level  SMALLINT NOT NULL DEFAULT 0
                        CHECK (priority_level BETWEEN 0 AND 100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_roles_name UNIQUE (role_name),
    CONSTRAINT uq_roles_slug UNIQUE (role_slug),
    CONSTRAINT chk_roles_slug_format 
        CHECK (role_slug ~ '^[a-z0-9_-]+$')
);

COMMENT ON TABLE core.roles IS 
    'Defines access roles. System roles cannot be deleted.';
COMMENT ON COLUMN core.roles.priority_level IS 
    'Higher number = higher privilege. Used for role hierarchy.';

-- ============================================================
-- TABLE: core.permissions
-- Purpose: Granular permission definitions per module
-- ============================================================

CREATE TABLE core.permissions (
    permission_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_name VARCHAR(150) NOT NULL,
    permission_slug VARCHAR(150) NOT NULL,
    module_name     VARCHAR(100) NOT NULL,
    action_type     core.action_type NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_permissions_slug UNIQUE (permission_slug),
    CONSTRAINT uq_permissions_module_action 
        UNIQUE (module_name, action_type, permission_name)
);

COMMENT ON TABLE core.permissions IS 
    'Granular permission atoms. Assigned to roles via role_permissions.';

-- ============================================================
-- TABLE: core.role_permissions
-- Purpose: Many-to-many junction for role-permission assignment
-- ============================================================

CREATE TABLE core.role_permissions (
    role_id         UUID NOT NULL,
    permission_id   UUID NOT NULL,
    granted_by      UUID,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role 
        FOREIGN KEY (role_id) 
        REFERENCES core.roles(role_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission 
        FOREIGN KEY (permission_id) 
        REFERENCES core.permissions(permission_id) 
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE: core.subscription_plans
-- Purpose: Available subscription tiers and their limits
-- ============================================================

CREATE TABLE commerce.subscription_plans (
    plan_id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name                   VARCHAR(100) NOT NULL,
    plan_slug                   VARCHAR(100) NOT NULL,
    description                 TEXT,
    plan_tier                   commerce.plan_tier NOT NULL,
    price_monthly               NUMERIC(10,2) NOT NULL DEFAULT 0.00
                                    CHECK (price_monthly >= 0),
    price_annual                NUMERIC(10,2) NOT NULL DEFAULT 0.00
                                    CHECK (price_annual >= 0),
    currency_code               CHAR(3) NOT NULL DEFAULT 'USD',
    max_uploads_per_month       INTEGER NOT NULL DEFAULT 5
                                    CHECK (max_uploads_per_month > 0),
    max_file_size_mb            INTEGER NOT NULL DEFAULT 10
                                    CHECK (max_file_size_mb > 0),
    max_pages_per_file          INTEGER NOT NULL DEFAULT 100,
    storage_limit_gb            NUMERIC(10,2) NOT NULL DEFAULT 0.5,
    max_generated_pdfs_stored   INTEGER NOT NULL DEFAULT 10,
    max_batch_size              INTEGER NOT NULL DEFAULT 1,
    allows_watermark_removal    BOOLEAN NOT NULL DEFAULT FALSE,
    allows_custom_presets       BOOLEAN NOT NULL DEFAULT FALSE,
    allows_api_access           BOOLEAN NOT NULL DEFAULT FALSE,
    allows_priority_processing  BOOLEAN NOT NULL DEFAULT FALSE,
    allows_batch_processing     BOOLEAN NOT NULL DEFAULT FALSE,
    allows_advanced_compression BOOLEAN NOT NULL DEFAULT FALSE,
    allows_analytics_export     BOOLEAN NOT NULL DEFAULT FALSE,
    support_level               commerce.support_level 
                                    NOT NULL DEFAULT 'community',
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order                  SMALLINT NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_plans_slug UNIQUE (plan_slug)
);

-- ============================================================
-- TABLE: core.users
-- Purpose: Central user identity table
-- ============================================================

CREATE TABLE core.users (
    user_id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                   VARCHAR(320) NOT NULL,
    username                VARCHAR(50) NOT NULL,
    password_hash           VARCHAR(255),
    full_name               VARCHAR(255),
    avatar_url              TEXT,
    phone_number            VARCHAR(20),
    country_code            CHAR(2),
    timezone                VARCHAR(50) NOT NULL DEFAULT 'UTC',
    locale                  VARCHAR(10) NOT NULL DEFAULT 'en-US',

    -- Auth provider
    auth_provider           core.auth_provider NOT NULL DEFAULT 'local',
    oauth_provider_id       VARCHAR(255),

    -- Verification
    email_verified          BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at       TIMESTAMPTZ,
    phone_verified          BOOLEAN NOT NULL DEFAULT FALSE,

    -- Account state
    status                  core.user_status NOT NULL DEFAULT 'pending_verification',
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,

    -- Security
    last_login_at           TIMESTAMPTZ,
    last_login_ip           INET,
    failed_login_attempts   SMALLINT NOT NULL DEFAULT 0
                                CHECK (failed_login_attempts >= 0),
    locked_until            TIMESTAMPTZ,
    password_changed_at     TIMESTAMPTZ,
    mfa_enabled             BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret_encrypted    TEXT,
    mfa_backup_codes        TEXT[],

    -- Relationships
    role_id                 UUID NOT NULL,

    -- Metadata
    referral_source         VARCHAR(100),
    utm_source              VARCHAR(100),
    utm_medium              VARCHAR(100),
    utm_campaign            VARCHAR(100),

    -- Soft delete
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT chk_users_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_users_username_format 
        CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$'),
    CONSTRAINT chk_users_oauth_local 
        CHECK (
            (auth_provider = 'local' AND password_hash IS NOT NULL) OR
            (auth_provider != 'local' AND oauth_provider_id IS NOT NULL)
        ),

    CONSTRAINT fk_users_role 
        FOREIGN KEY (role_id) 
        REFERENCES core.roles(role_id) 
        ON DELETE RESTRICT
);

COMMENT ON TABLE core.users IS 
    'Central identity table. Supports local and OAuth auth.';
COMMENT ON COLUMN core.users.password_hash IS 
    'bcrypt/argon2 hash. NULL for OAuth users.';
COMMENT ON COLUMN core.users.mfa_secret_encrypted IS 
    'Encrypted TOTP secret. Encrypted at application level before storage.';

-- ============================================================
-- TABLE: core.user_sessions
-- Purpose: Track active user sessions for auth management
-- ============================================================

CREATE TABLE core.user_sessions (
    session_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL,
    session_token_hash  VARCHAR(255) NOT NULL,
    refresh_token_hash  VARCHAR(255),
    ip_address          INET,
    user_agent          TEXT,
    device_fingerprint  VARCHAR(255),
    device_type         analytics.device_type DEFAULT 'unknown',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at          TIMESTAMPTZ,
    revocation_reason   VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_sessions_token UNIQUE (session_token_hash),
    CONSTRAINT fk_sessions_user 
        FOREIGN KEY (user_id) 
        REFERENCES core.users(user_id) 
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE: core.subscriptions
-- Purpose: User subscription lifecycle management
-- ============================================================

CREATE TABLE commerce.subscriptions (
    subscription_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID NOT NULL,
    plan_id                     UUID NOT NULL,
    status                      commerce.subscription_status 
                                    NOT NULL DEFAULT 'trialing',
    billing_cycle               commerce.billing_cycle NOT NULL DEFAULT 'monthly',
    current_period_start        DATE NOT NULL,
    current_period_end          DATE NOT NULL,
    trial_start                 DATE,
    trial_end                   DATE,
    cancel_at_period_end        BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at                TIMESTAMPTZ,
    cancellation_reason         TEXT,
    pause_collection_until      DATE,

    -- Gateway data
    payment_gateway             commerce.payment_gateway,
    gateway_subscription_id     VARCHAR(255),
    gateway_customer_id         VARCHAR(255),

    -- Usage tracking
    uploads_used_this_period    INTEGER NOT NULL DEFAULT 0
                                    CHECK (uploads_used_this_period >= 0),
    storage_used_bytes          BIGINT NOT NULL DEFAULT 0
                                    CHECK (storage_used_bytes >= 0),

    -- Metadata
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_subscriptions_user 
        UNIQUE (user_id),  -- One active subscription per user
    CONSTRAINT chk_sub_period 
        CHECK (current_period_end > current_period_start),
    CONSTRAINT chk_sub_trial 
        CHECK (trial_end IS NULL OR trial_end > trial_start),

    CONSTRAINT fk_sub_user 
        FOREIGN KEY (user_id) 
        REFERENCES core.users(user_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_sub_plan 
        FOREIGN KEY (plan_id) 
        REFERENCES commerce.subscription_plans(plan_id) 
        ON DELETE RESTRICT
);

-- ============================================================
-- TABLE: commerce.payments
-- Purpose: Financial transaction ledger
-- ============================================================

CREATE TABLE commerce.payments (
    payment_id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL,
    subscription_id         UUID,
    payment_type            commerce.payment_type NOT NULL,
    amount                  NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency_code           CHAR(3) NOT NULL DEFAULT 'USD',
    amount_in_cents         BIGINT NOT NULL CHECK (amount_in_cents >= 0),
    status                  commerce.payment_status NOT NULL DEFAULT 'pending',

    -- Gateway
    payment_gateway         commerce.payment_gateway NOT NULL,
    gateway_payment_id      VARCHAR(255),
    gateway_invoice_id      VARCHAR(255),
    gateway_charge_id       VARCHAR(255),
    gateway_event_id        VARCHAR(255),

    -- Method
    payment_method_type     commerce.payment_method_type,
    payment_method_last4    CHAR(4),
    payment_method_brand    VARCHAR(50),
    payment_method_fingerprint VARCHAR(255),

    -- Billing address
    billing_name            VARCHAR(255),
    billing_email           VARCHAR(320),
    billing_address_line1   VARCHAR(255),
    billing_address_line2   VARCHAR(255),
    billing_city            VARCHAR(100),
    billing_state           VARCHAR(100),
    billing_country_code    CHAR(2),
    billing_postal_code     VARCHAR(20),

    -- Amounts breakdown
    subtotal_amount         NUMERIC(12,2),
    tax_amount              NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_rate                NUMERIC(5,4) NOT NULL DEFAULT 0.0000,
    discount_amount         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    coupon_code             VARCHAR(50),
    coupon_discount_type    VARCHAR(20),

    -- Refund
    refunded_amount         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    refunded_at             TIMESTAMPTZ,
    refund_reason           TEXT,

    -- Failure
    failure_code            VARCHAR(100),
    failure_message         TEXT,

    -- URLs
    invoice_url             TEXT,
    receipt_url             TEXT,
    hosted_invoice_url      TEXT,

    paid_at                 TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_payments_gateway_id 
        UNIQUE (payment_gateway, gateway_payment_id),
    CONSTRAINT chk_payments_refund 
        CHECK (refunded_amount <= amount),
    CONSTRAINT chk_payments_amount_cents 
        CHECK (amount_in_cents = ROUND(amount * 100)),

    CONSTRAINT fk_payments_user 
        FOREIGN KEY (user_id) 
        REFERENCES core.users(user_id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_payments_subscription 
        FOREIGN KEY (subscription_id) 
        REFERENCES commerce.subscriptions(subscription_id) 
        ON DELETE SET NULL
);
```

## 3.4 Documents Schema

```sql
-- ============================================================
-- TABLE: documents.pdf_uploads
-- Purpose: Track all PDF files uploaded by users
-- ============================================================

CREATE TABLE documents.pdf_uploads (
    upload_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL,
    original_filename   VARCHAR(500) NOT NULL,
    stored_filename     VARCHAR(500) NOT NULL,
    storage_path        TEXT NOT NULL,
    storage_provider    documents.storage_provider NOT NULL DEFAULT 'local',
    storage_bucket      VARCHAR(255),
    storage_region      VARCHAR(50),
    file_size_bytes     BIGINT NOT NULL CHECK (file_size_bytes > 0),
    file_hash_sha256    CHAR(64) NOT NULL,
    file_hash_md5       CHAR(32),
    mime_type           VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    upload_source       documents.upload_source NOT NULL DEFAULT 'web',
    upload_status       documents.upload_status NOT NULL DEFAULT 'pending',

    -- Security scanning
    virus_scan_status   documents.virus_scan_status NOT NULL DEFAULT 'pending',
    virus_scan_engine   VARCHAR(50),
    virus_scan_at       TIMESTAMPTZ,
    virus_threat_name   VARCHAR(255),

    -- Access control
    is_public           BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    is_duplicate        BOOLEAN NOT NULL DEFAULT FALSE,
    original_upload_id  UUID,  -- Points to original if duplicate

    -- Lifecycle
    expires_at          TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_uploads_user 
        FOREIGN KEY (user_id) 
        REFERENCES core.users(user_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_uploads_original 
        FOREIGN KEY (original_upload_id) 
        REFERENCES documents.pdf_uploads(upload_id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_uploads_hash_format 
        CHECK (file_hash_sha256 ~ '^[a-f0-9]{64}$')
);

COMMENT ON TABLE documents.pdf_uploads IS 
    'Master record for all uploaded PDFs. One row per upload event.';
COMMENT ON COLUMN documents.pdf_uploads.file_hash_sha256 IS 
    'Used for deduplication. Compare hash before storing file.';

-- ============================================================
-- TABLE: documents.pdf_metadata
-- Purpose: Extracted PDF document metadata (1:1 with uploads)
-- ============================================================

CREATE TABLE documents.pdf_metadata (
    metadata_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id           UUID NOT NULL,

    -- Document info
    title               VARCHAR(500),
    author              VARCHAR(500),
    subject             VARCHAR(500),
    keywords            TEXT[],
    creator_application VARCHAR(255),
    producer            VARCHAR(255),
    pdf_version         VARCHAR(10),
    xmp_metadata        XML,

    -- Page properties
    total_pages         INTEGER NOT NULL CHECK (total_pages > 0),
    page_width_pt       NUMERIC(10,4),
    page_height_pt      NUMERIC(10,4),
    page_width_mm       NUMERIC(10,4) GENERATED ALWAYS AS 
                            (page_width_pt * 0.352778) STORED,
    page_height_mm      NUMERIC(10,4) GENERATED ALWAYS AS 
                            (page_height_pt * 0.352778) STORED,
    page_orientation    documents.page_orientation,
    detected_paper_size documents.paper_size,

    -- Content flags
    has_bookmarks       BOOLEAN NOT NULL DEFAULT FALSE,
    has_forms           BOOLEAN NOT NULL DEFAULT FALSE,
    has_annotations     BOOLEAN NOT NULL DEFAULT FALSE,
    has_javascript      BOOLEAN NOT NULL DEFAULT FALSE,
    has_embedded_files  BOOLEAN NOT NULL DEFAULT FALSE,
    has_digital_sig     BOOLEAN NOT NULL DEFAULT FALSE,

    -- Security
    is_encrypted        BOOLEAN NOT NULL DEFAULT FALSE,
    is_linearized       BOOLEAN NOT NULL DEFAULT FALSE,
    encryption_method   VARCHAR(50),

    -- Visual properties
    color_space         documents.color_space DEFAULT 'unknown',
    dpi_detected        SMALLINT CHECK (dpi_detected > 0),
    has_images          BOOLEAN NOT NULL DEFAULT FALSE,
    image_count         INTEGER,

    -- Language
    language_detected   VARCHAR(20),
    language_confidence NUMERIC(5,4),

    -- Print estimates
    estimated_print_pages INTEGER,
    estimated_paper_saved INTEGER,

    -- Document dates
    pdf_creation_date   TIMESTAMPTZ,
    pdf_modified_date   TIMESTAMPTZ,

    extracted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_metadata_upload UNIQUE (upload_id),
    CONSTRAINT fk_metadata_upload 
        FOREIGN KEY (upload_id) 
        REFERENCES documents.pdf_uploads(upload_id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE documents.pdf_metadata IS 
    '1:1 with pdf_uploads. Contains parsed PDF document properties.';
COMMENT ON COLUMN documents.pdf_metadata.page_width_mm IS 
    'Auto-calculated from points. 1 pt = 0.352778 mm';

-- ============================================================
-- TABLE: documents.layout_presets
-- Purpose: Reusable print layout configurations
-- ============================================================

CREATE TABLE documents.layout_presets (
    preset_id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by              UUID,  -- NULL = system preset
    preset_name             VARCHAR(200) NOT NULL,
    preset_slug             VARCHAR(200) NOT NULL,
    preset_type             documents.preset_type NOT NULL DEFAULT 'user_custom',
    description             TEXT,
    icon_name               VARCHAR(100),
    color_hex               CHAR(7),

    -- Layout configuration
    pages_per_sheet         SMALLINT NOT NULL DEFAULT 4
                                CHECK (pages_per_sheet IN (1,2,4,6,8,9,16)),
    layout_columns          SMALLINT NOT NULL DEFAULT 2
                                CHECK (layout_columns BETWEEN 1 AND 8),
    layout_rows             SMALLINT NOT NULL DEFAULT 2
                                CHECK (layout_rows BETWEEN 1 AND 8),
    duplex_mode             documents.duplex_mode NOT NULL DEFAULT 'none',
    binding_edge            documents.binding_edge NOT NULL DEFAULT 'left',
    page_order              documents.page_order NOT NULL DEFAULT 'horizontal',

    -- Margins (all in millimeters)
    margin_top_mm           NUMERIC(6,2) NOT NULL DEFAULT 5.0
                                CHECK (margin_top_mm >= 0),
    margin_bottom_mm        NUMERIC(6,2) NOT NULL DEFAULT 5.0
                                CHECK (margin_bottom_mm >= 0),
    margin_left_mm          NUMERIC(6,2) NOT NULL DEFAULT 5.0
                                CHECK (margin_left_mm >= 0),
    margin_right_mm         NUMERIC(6,2) NOT NULL DEFAULT 5.0
                                CHECK (margin_right_mm >= 0),
    gutter_mm               NUMERIC(6,2) NOT NULL DEFAULT 2.0
                                CHECK (gutter_mm >= 0),

    -- Transformation
    rotation_degrees        SMALLINT NOT NULL DEFAULT 0
                                CHECK (rotation_degrees IN (0, 90, 180, 270)),
    scale_factor            NUMERIC(5,3) NOT NULL DEFAULT 1.000
                                CHECK (scale_factor BETWEEN 0.1 AND 2.0),

    -- Paper
    paper_size              documents.paper_size NOT NULL DEFAULT 'A4',
    custom_width_mm         NUMERIC(8,2),
    custom_height_mm        NUMERIC(8,2),

    -- Visual options
    show_border             BOOLEAN NOT NULL DEFAULT FALSE,
    border_width_pt         NUMERIC(4,2) DEFAULT 0.5,
    border_color_hex        CHAR(7) DEFAULT '#000000',
    show_page_numbers       BOOLEAN NOT NULL DEFAULT FALSE,
    page_number_position    documents.page_number_position 
                                DEFAULT 'bottom_center',
    page_number_format      VARCHAR(50) DEFAULT '{n}',

    -- Watermark
    watermark_text          VARCHAR(200),
    watermark_opacity       NUMERIC(4,3) DEFAULT 0.1
                                CHECK (watermark_opacity BETWEEN 0 AND 1),
    watermark_angle         SMALLINT DEFAULT 45
                                CHECK (watermark_angle BETWEEN -180 AND 180),
    watermark_font_size     SMALLINT DEFAULT 48,

    -- Booklet mode
    is_booklet_mode         BOOLEAN NOT NULL DEFAULT FALSE,
    booklet_signature_size  SMALLINT DEFAULT 4,

    -- Custom arrangement (JSONB for maximum flexibility)
    front_page_arrangement  JSONB,
    back_page_arrangement   JSONB,
    custom_config           JSONB,

    -- Lifecycle
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured             BOOLEAN NOT NULL DEFAULT FALSE,
    usage_count             INTEGER NOT NULL DEFAULT 0
                                CHECK (usage_count >= 0),
    last_used_at            TIMESTAMPTZ,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ,

    CONSTRAINT uq_presets_slug UNIQUE (preset_slug),
    CONSTRAINT chk_presets_custom_paper 
        CHECK (
            paper_size != 'Custom' OR 
            (custom_width_mm IS NOT NULL AND custom_height_mm IS NOT NULL)
        ),
    CONSTRAINT chk_presets_layout_match 
        CHECK (layout_columns * layout_rows >= pages_per_sheet),
    CONSTRAINT fk_presets_creator 
        FOREIGN KEY (created_by) 
        REFERENCES core.users(user_id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE documents.layout_presets IS 
    'Stores reusable imposition layouts. System presets have created_by=NULL.';
COMMENT ON COLUMN documents.layout_presets.front_page_arrangement IS 
    'JSONB array defining page slot positions on front side.
     Example: [{"slot": 1, "page_number": 1, "rotation": 0}]';

-- ============================================================
-- TABLE: documents.generated_pdfs
-- Purpose: Output PDF files produced by the imposition engine
-- ============================================================

CREATE TABLE documents.generated_pdfs (
    generated_pdf_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id               UUID NOT NULL,
    user_id                 UUID NOT NULL,
    preset_id               UUID,
    job_id                  UUID,

    -- File info
    output_filename         VARCHAR(500) NOT NULL,
    storage_path            TEXT NOT NULL,
    storage_provider        documents.storage_provider NOT NULL DEFAULT 'local',
    storage_bucket          VARCHAR(255),
    file_size_bytes         BIGINT CHECK (file_size_bytes > 0),
    file_hash_sha256        CHAR(64),

    -- Processing stats
    total_pages_original    INTEGER NOT NULL CHECK (total_pages_original > 0),
    total_pages_output      INTEGER NOT NULL CHECK (total_pages_output > 0),
    pages_per_sheet         SMALLINT NOT NULL,
    size_reduction_percent  NUMERIC(5,2),
    estimated_paper_saved   INTEGER,
    estimated_cost_saved    NUMERIC(8,2),
    processing_duration_ms  BIGINT,

    -- Download tracking
    download_count          INTEGER NOT NULL DEFAULT 0
                                CHECK (download_count >= 0),
    last_downloaded_at      TIMESTAMPTZ,
    download_url            TEXT,
    download_url_expires_at TIMESTAMPTZ,

    -- Lifecycle
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_genpdf_upload 
        FOREIGN KEY (upload_id) 
        REFERENCES documents.pdf_uploads(upload_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_genpdf_user 
        FOREIGN KEY (user_id) 
        REFERENCES core.users(user_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_genpdf_preset 
        FOREIGN KEY (preset_id) 
        REFERENCES documents.layout_presets(preset_id) 
        ON DELETE SET NULL
);

-- ============================================================
-- TABLE: documents.processing_jobs
-- Purpose: Async job queue tracking for PDF operations
-- ============================================================

CREATE TABLE documents.processing_jobs (
    job_id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL,
    upload_id               UUID NOT NULL,
    preset_id               UUID,
    generated_pdf_id        UUID,

    -- Job classification
    job_type                documents.job_type NOT NULL DEFAULT 'imposition',
    job_status              documents.job_status NOT NULL DEFAULT 'queued',
    priority                SMALLINT NOT NULL DEFAULT 5
                                CHECK (priority BETWEEN 1 AND 10),
    queue_name              VARCHAR(100) NOT NULL DEFAULT 'default',

    -- Worker tracking
    worker_id               VARCHAR(255),
    worker_hostname         VARCHAR(255),

    -- Retry logic
    attempt_number          SMALLINT NOT NULL DEFAULT 1
                                CHECK (attempt_number >= 1),
    max_attempts            SMALLINT NOT NULL DEFAULT 3
                                CHECK (max_attempts >= 1),
    next_retry_at           TIMESTAMPTZ,
    retry_backoff_seconds   INTEGER,

    -- Progress
    progress_percentage     NUMERIC(5,2) NOT NULL DEFAULT 0.0
                                CHECK (progress_percentage BETWEEN 0 AND 100),
    progress_message        VARCHAR(500),
    progress_details        JSONB,

    -- Parameters
    input_parameters        JSONB NOT NULL DEFAULT '{}',
    output_parameters       JSONB,

    -- Error handling
    error_code              VARCHAR(100),
    error_message           TEXT,
    error_stack_trace       TEXT,

    -- Resource usage
    started_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    processing_duration_ms  BIGINT 
                                GENERATED ALWAYS AS (
                                    CASE 
                                        WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
                                        THEN EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
                                        ELSE NULL
                                    END
                                ) STORED,
    cpu_usage_percent       NUMERIC(5,2),
    memory_usage_mb         NUMERIC(8,2),
    peak_memory_mb          NUMERIC(8,2),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_jobs_user 
        FOREIGN KEY (user_id) 
        REFERENCES core.users(user_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_jobs_upload 
        FOREIGN KEY (upload_id) 
        REFERENCES documents.pdf_uploads(upload_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_jobs_preset 
        FOREIGN KEY (preset_id) 
        REFERENCES documents.layout_presets(preset_id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_jobs_output 
        FOREIGN KEY (generated_pdf_id) 
        REFERENCES documents.generated_pdfs(generated_pdf_id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE documents.processing_jobs IS 
    'Tracks all async PDF processing tasks. Integrates with Celery/RQ.';
COMMENT ON COLUMN documents.processing_jobs.processing_duration_ms IS 
    'Auto-calculated from started_at and completed_at.';
```

## 3.5 Analytics & Audit Schema

```sql
-- ============================================================
-- TABLE: analytics.analytics_events
-- Purpose: Behavioral event tracking (append-only)
-- ============================================================

CREATE TABLE analytics.analytics_events (
    event_id        UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id         UUID,
    session_id      UUID,

    -- Event classification
    event_type      VARCHAR(100) NOT NULL,
    event_category  analytics.event_category NOT NULL,
    event_action    VARCHAR(200),
    event_label     VARCHAR(500),
    event_value     NUMERIC(12,4),

    -- Entity references
    upload_id       UUID,
    job_id          UUID,
    preset_id       UUID,
    generated_pdf_id UUID,

    -- Request context
    page_url        TEXT,
    referrer_url    TEXT,
    user_agent      TEXT,
    ip_address      INET,
    request_id      UUID,

    -- Geo data
    country_code    CHAR(2),
    country_name    VARCHAR(100),
    region_name     VARCHAR(100),
    city            VARCHAR(100),
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),

    -- Device
    device_type     analytics.device_type DEFAULT 'unknown',
    browser_name    VARCHAR(100),
    browser_version VARCHAR(50),
    os_name         VARCHAR(100),
    os_version      VARCHAR(50),
    screen_width    SMALLINT,
    screen_height   SMALLINT,

    -- Performance
    page_load_ms    INTEGER,
    session_duration_ms BIGINT,

    -- Flexible payload
    properties      JSONB,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Partition key (for time-based partitioning)
    CONSTRAINT pk_analytics_events PRIMARY KEY (event_id, created_at)

) PARTITION BY RANGE (created_at);

COMMENT ON TABLE analytics.analytics_events IS 
    'Immutable event log. Partitioned by month. Never UPDATE or DELETE rows.';

-- Create monthly partitions (example for 2024-2025)
CREATE TABLE analytics.analytics_events_2024_01 
    PARTITION OF analytics.analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE analytics.analytics_events_2024_02 
    PARTITION OF analytics.analytics_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Add remaining months programmatically via function (see below)

-- ============================================================
-- TABLE: audit.audit_logs
-- Purpose: Immutable compliance and security audit trail
-- ============================================================

CREATE TABLE audit.audit_logs (
    audit_id        UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id         UUID,
    session_id      UUID,

    -- Action details
    action_type     VARCHAR(200) NOT NULL,
    action_category audit.action_category NOT NULL,

    -- Target entity
    table_name      VARCHAR(100),
    schema_name     VARCHAR(100),
    record_id       VARCHAR(255),

    -- Change data capture
    old_values      JSONB,
    new_values      JSONB,
    changed_fields  TEXT[],
    diff_summary    JSONB,

    -- Request context
    ip_address      INET,
    user_agent      TEXT,
    request_id      UUID,
    correlation_id  UUID,
    api_endpoint    VARCHAR(500),
    http_method     VARCHAR(10),
    http_status_code SMALLINT,

    -- Risk assessment
    severity        audit.severity NOT NULL DEFAULT 'info',
    is_suspicious   BOOLEAN NOT NULL DEFAULT FALSE,
    risk_score      SMALLINT DEFAULT 0 
                        CHECK (risk_score BETWEEN 0 AND 100),
    risk_factors    TEXT[],

    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_audit_logs PRIMARY KEY (audit_id, created_at)

) PARTITION BY RANGE (created_at);

COMMENT ON TABLE audit.audit_logs IS 
    'Immutable audit trail. NEVER allow UPDATE/DELETE on this table.';

-- Partitions for audit_logs
CREATE TABLE audit.audit_logs_2024_q1 
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE audit.audit_logs_2024_q2 
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE audit.audit_logs_2024_q3 
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE audit.audit_logs_2024_q4 
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

CREATE TABLE audit.audit_logs_2025_q1 
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
```

---

# PART 4: COMPLETE INDEXING STRATEGY

```sql
-- ============================================================
-- INDEXES: core.users
-- ============================================================

-- Primary lookup indexes
CREATE UNIQUE INDEX idx_users_email 
    ON core.users(LOWER(email))
    WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX idx_users_username 
    ON core.users(LOWER(username))
    WHERE is_deleted = FALSE;

-- Auth provider lookup
CREATE INDEX idx_users_oauth 
    ON core.users(auth_provider, oauth_provider_id)
    WHERE oauth_provider_id IS NOT NULL;

-- Admin queries
CREATE INDEX idx_users_status 
    ON core.users(status) 
    WHERE is_deleted = FALSE;

CREATE INDEX idx_users_role 
    ON core.users(role_id);

CREATE INDEX idx_users_created_at 
    ON core.users(created_at DESC);

-- Security monitoring
CREATE INDEX idx_users_locked 
    ON core.users(locked_until) 
    WHERE locked_until IS NOT NULL;

CREATE INDEX idx_users_last_login 
    ON core.users(last_login_at DESC)
    WHERE last_login_at IS NOT NULL;

-- Country-based analytics
CREATE INDEX idx_users_country 
    ON core.users(country_code)
    WHERE country_code IS NOT NULL;

-- ============================================================
-- INDEXES: core.user_sessions
-- ============================================================

CREATE UNIQUE INDEX idx_sessions_token 
    ON core.user_sessions(session_token_hash);

CREATE INDEX idx_sessions_user_active 
    ON core.user_sessions(user_id, is_active, expires_at)
    WHERE is_active = TRUE;

CREATE INDEX idx_sessions_expires 
    ON core.user_sessions(expires_at)
    WHERE is_active = TRUE;

CREATE INDEX idx_sessions_ip 
    ON core.user_sessions(ip_address);

-- ============================================================
-- INDEXES: documents.pdf_uploads
-- ============================================================

-- User's file listing (most common query)
CREATE INDEX idx_uploads_user_created 
    ON documents.pdf_uploads(user_id, created_at DESC)
    WHERE is_deleted = FALSE;

-- Deduplication check
CREATE INDEX idx_uploads_hash 
    ON documents.pdf_uploads(file_hash_sha256);

-- Status-based worker queries
CREATE INDEX idx_uploads_status 
    ON documents.pdf_uploads(upload_status, created_at ASC)
    WHERE upload_status IN ('pending', 'uploading', 'processing');

-- Virus scan queue
CREATE INDEX idx_uploads_virus_scan 
    ON documents.pdf_uploads(virus_scan_status, created_at ASC)
    WHERE virus_scan_status = 'pending';

-- Expiry cleanup
CREATE INDEX idx_uploads_expires 
    ON documents.pdf_uploads(expires_at)
    WHERE expires_at IS NOT NULL AND is_deleted = FALSE;

-- Storage provider breakdown
CREATE INDEX idx_uploads_storage 
    ON documents.pdf_uploads(storage_provider, created_at DESC);

-- ============================================================
-- INDEXES: documents.pdf_metadata
-- ============================================================

CREATE UNIQUE INDEX idx_metadata_upload 
    ON documents.pdf_metadata(upload_id);

-- Page count range queries
CREATE INDEX idx_metadata_pages 
    ON documents.pdf_metadata(total_pages);

-- Language analytics
CREATE INDEX idx_metadata_language 
    ON documents.pdf_metadata(language_detected)
    WHERE language_detected IS NOT NULL;

-- File size analysis
CREATE INDEX idx_metadata_orientation 
    ON documents.pdf_metadata(page_orientation);

-- Full-text search on title/author
CREATE INDEX idx_metadata_title_fts 
    ON documents.pdf_metadata 
    USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(author, '')));

-- Keywords GIN index
CREATE INDEX idx_metadata_keywords_gin 
    ON documents.pdf_metadata 
    USING GIN (keywords);

-- ============================================================
-- INDEXES: documents.layout_presets
-- ============================================================

CREATE UNIQUE INDEX idx_presets_slug 
    ON documents.layout_presets(preset_slug)
    WHERE is_deleted = FALSE;

-- User's custom presets
CREATE INDEX idx_presets_creator 
    ON documents.layout_presets(created_by, created_at DESC)
    WHERE created_by IS NOT NULL;

-- System presets
CREATE INDEX idx_presets_system 
    ON documents.layout_presets(preset_type, is_active)
    WHERE preset_type = 'system';

-- Popular presets
CREATE INDEX idx_presets_usage 
    ON documents.layout_presets(usage_count DESC)
    WHERE is_active = TRUE AND is_deleted = FALSE;

-- Pages per sheet filter
CREATE INDEX idx_presets_pages_per_sheet 
    ON documents.layout_presets(pages_per_sheet, is_active)
    WHERE is_deleted = FALSE;

-- JSONB index for custom arrangements
CREATE INDEX idx_presets_front_arrangement 
    ON documents.layout_presets 
    USING GIN (front_page_arrangement);

-- ============================================================
-- INDEXES: documents.processing_jobs
-- ============================================================

-- Worker job pickup (critical hot path)
CREATE INDEX idx_jobs_queue_pickup 
    ON documents.processing_jobs(queue_name, priority DESC, created_at ASC)
    WHERE job_status = 'queued';

-- User job history
CREATE INDEX idx_jobs_user_status 
    ON documents.processing_jobs(user_id, job_status, created_at DESC);

-- Upload's jobs
CREATE INDEX idx_jobs_upload 
    ON documents.processing_jobs(upload_id, created_at DESC);

-- Running jobs monitoring
CREATE INDEX idx_jobs_running 
    ON documents.processing_jobs(worker_id, started_at)
    WHERE job_status = 'running';

-- Failed jobs for retry
CREATE INDEX idx_jobs_retry 
    ON documents.processing_jobs(next_retry_at ASC)
    WHERE job_status = 'retrying' AND next_retry_at IS NOT NULL;

-- Performance analysis
CREATE INDEX idx_jobs_duration 
    ON documents.processing_jobs(processing_duration_ms DESC)
    WHERE processing_duration_ms IS NOT NULL;

-- ============================================================
-- INDEXES: documents.generated_pdfs
-- ============================================================

-- User's generated files
CREATE INDEX idx_genpdf_user_created 
    ON documents.generated_pdfs(user_id, created_at DESC)
    WHERE is_deleted = FALSE;

-- Upload's outputs
CREATE INDEX idx_genpdf_upload 
    ON documents.generated_pdfs(upload_id)
    WHERE is_deleted = FALSE;

-- Expiry cleanup job
CREATE INDEX idx_genpdf_expires 
    ON documents.generated_pdfs(expires_at ASC)
    WHERE expires_at IS NOT NULL AND is_deleted = FALSE;

-- Download analytics
CREATE INDEX idx_genpdf_downloads 
    ON documents.generated_pdfs(download_count DESC);

-- ============================================================
-- INDEXES: commerce.subscriptions
-- ============================================================

CREATE UNIQUE INDEX idx_subscriptions_user 
    ON commerce.subscriptions(user_id);

CREATE INDEX idx_subscriptions_status 
    ON commerce.subscriptions(status, current_period_end);

-- Renewal processing
CREATE INDEX idx_subscriptions_renewal 
    ON commerce.subscriptions(current_period_end ASC)
    WHERE status = 'active' AND cancel_at_period_end = FALSE;

CREATE INDEX idx_subscriptions_gateway 
    ON commerce.subscriptions(payment_gateway, gateway_subscription_id)
    WHERE gateway_subscription_id IS NOT NULL;

-- ============================================================
-- INDEXES: commerce.payments
-- ============================================================

CREATE UNIQUE INDEX idx_payments_gateway_id 
    ON commerce.payments(payment_gateway, gateway_payment_id)
    WHERE gateway_payment_id IS NOT NULL;

CREATE INDEX idx_payments_user_created 
    ON commerce.payments(user_id, created_at DESC);

CREATE INDEX idx_payments_status 
    ON commerce.payments(status, created_at DESC);

CREATE INDEX idx_payments_subscription 
    ON commerce.payments(subscription_id, created_at DESC);

-- Revenue reports
CREATE INDEX idx_payments_paid_at 
    ON commerce.payments(paid_at DESC)
    WHERE status = 'succeeded';

-- Refund processing
CREATE INDEX idx_payments_refunds 
    ON commerce.payments(status)
    WHERE status IN ('refunded', 'partially_refunded', 'disputed');

-- ============================================================
-- INDEXES: analytics.analytics_events (per partition)
-- ============================================================

-- Applied to parent, inherited by partitions
CREATE INDEX idx_analytics_user_created 
    ON analytics.analytics_events(user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

CREATE INDEX idx_analytics_type_created 
    ON analytics.analytics_events(event_type, created_at DESC);

CREATE INDEX idx_analytics_category_created 
    ON analytics.analytics_events(event_category, created_at DESC);

CREATE INDEX idx_analytics_session 
    ON analytics.analytics_events(session_id)
    WHERE session_id IS NOT NULL;

CREATE INDEX idx_analytics_upload 
    ON analytics.analytics_events(upload_id)
    WHERE upload_id IS NOT NULL;

-- JSONB GIN for property searches
CREATE INDEX idx_analytics_properties 
    ON analytics.analytics_events 
    USING GIN (properties);

-- ============================================================
-- INDEXES: audit.audit_logs (per partition)
-- ============================================================

CREATE INDEX idx_audit_user_created 
    ON audit.audit_logs(user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

CREATE INDEX idx_audit_table_record 
    ON audit.audit_logs(table_name, record_id, created_at DESC);

CREATE INDEX idx_audit_severity 
    ON audit.audit_logs(severity, created_at DESC)
    WHERE severity IN ('warning', 'error', 'critical');

CREATE INDEX idx_audit_suspicious 
    ON audit.audit_logs(is_suspicious, created_at DESC)
    WHERE is_suspicious = TRUE;

CREATE INDEX idx_audit_ip 
    ON audit.audit_logs(ip_address, created_at DESC);

CREATE INDEX idx_audit_action_category 
    ON audit.audit_logs(action_category, created_at DESC);
```

---

# PART 5: VIEWS

```sql
-- ============================================================
-- VIEW: User Dashboard Summary
-- ============================================================

CREATE OR REPLACE VIEW core.v_user_dashboard AS
SELECT
    u.user_id,
    u.email,
    u.username,
    u.full_name,
    u.status,
    u.email_verified,
    u.last_login_at,
    u.created_at AS member_since,
    r.role_name,
    r.role_slug,

    -- Subscription info
    sp.plan_name,
    sp.plan_tier,
    s.status AS subscription_status,
    s.current_period_end AS subscription_expires,
    s.uploads_used_this_period,
    sp.max_uploads_per_month AS uploads_limit,
    ROUND(
        s.storage_used_bytes::NUMERIC / (1024 * 1024 * 1024), 2
    ) AS storage_used_gb,
    sp.storage_limit_gb,

    -- Usage stats
    (
        SELECT COUNT(*) 
        FROM documents.pdf_uploads pu 
        WHERE pu.user_id = u.user_id AND pu.is_deleted = FALSE
    ) AS total_uploads,

    (
        SELECT COUNT(*) 
        FROM documents.generated_pdfs gp 
        WHERE gp.user_id = u.user_id AND gp.is_deleted = FALSE
    ) AS total_generated_pdfs,

    (
        SELECT COALESCE(SUM(gp.estimated_paper_saved), 0) 
        FROM documents.generated_pdfs gp 
        WHERE gp.user_id = u.user_id
    ) AS total_paper_saved,

    (
        SELECT COALESCE(SUM(gp.estimated_cost_saved), 0) 
        FROM documents.generated_pdfs gp 
        WHERE gp.user_id = u.user_id
    ) AS total_cost_saved

FROM core.users u
JOIN core.roles r ON u.role_id = r.role_id
LEFT JOIN commerce.subscriptions s ON s.user_id = u.user_id
LEFT JOIN commerce.subscription_plans sp ON s.plan_id = sp.plan_id
WHERE u.is_deleted = FALSE;

COMMENT ON VIEW core.v_user_dashboard IS 
    'Aggregated user dashboard data. Cache in Redis for 5 minutes.';

-- ============================================================
-- VIEW: PDF Upload with Metadata
-- ============================================================

CREATE OR REPLACE VIEW documents.v_pdf_uploads_detailed AS
SELECT
    pu.upload_id,
    pu.user_id,
    u.username,
    u.email,
    pu.original_filename,
    pu.file_size_bytes,
    ROUND(pu.file_size_bytes::NUMERIC / (1024 * 1024), 2) AS file_size_mb,
    pu.upload_status,
    pu.virus_scan_status,
    pu.storage_provider,
    pu.upload_source,
    pu.created_at AS uploaded_at,

    -- Metadata
    pm.title,
    pm.author,
    pm.total_pages,
    pm.pdf_version,
    pm.page_orientation,
    pm.detected_paper_size,
    ROUND(pm.page_width_mm, 2) AS page_width_mm,
    ROUND(pm.page_height_mm, 2) AS page_height_mm,
    pm.color_space,
    pm.is_encrypted,
    pm.has_forms,
    pm.language_detected,
    pm.estimated_print_pages,

    -- Job status
    pj.job_status AS latest_job_status,
    pj.progress_percentage AS latest_job_progress,

    -- Output
    gp.generated_pdf_id,
    gp.download_count,
    gp.estimated_paper_saved,
    ROUND(gp.size_reduction_percent, 1) AS size_reduction_percent

FROM documents.pdf_uploads pu
JOIN core.users u ON pu.user_id = u.user_id
LEFT JOIN documents.pdf_metadata pm ON pu.upload_id = pm.upload_id
LEFT JOIN LATERAL (
    SELECT job_status, progress_percentage 
    FROM documents.processing_jobs 
    WHERE upload_id = pu.upload_id 
    ORDER BY created_at DESC 
    LIMIT 1
) pj ON TRUE
LEFT JOIN LATERAL (
    SELECT generated_pdf_id, download_count, 
           estimated_paper_saved, size_reduction_percent
    FROM documents.generated_pdfs 
    WHERE upload_id = pu.upload_id AND is_deleted = FALSE
    ORDER BY created_at DESC 
    LIMIT 1
) gp ON TRUE
WHERE pu.is_deleted = FALSE;

-- ============================================================
-- VIEW: Processing Job Queue Monitor
-- ============================================================

CREATE OR REPLACE VIEW documents.v_job_queue_monitor AS
SELECT
    pj.job_id,
    pj.queue_name,
    pj.job_type,
    pj.job_status,
    pj.priority,
    pj.attempt_number,
    pj.progress_percentage,
    pj.worker_id,
    pj.worker_hostname,
    u.username,
    u.email,
    pu.original_filename,
    lp.preset_name,
    pm.total_pages,
    pj.created_at AS queued_at,
    pj.started_at,
    CASE 
        WHEN pj.started_at IS NOT NULL AND pj.completed_at IS NULL
        THEN EXTRACT(EPOCH FROM (NOW() - pj.started_at))::INTEGER
        ELSE NULL
    END AS running_seconds,
    pj.processing_duration_ms,
    pj.error_code,
    pj.error_message

FROM documents.processing_jobs pj
JOIN core.users u ON pj.user_id = u.user_id
JOIN documents.pdf_uploads pu ON pj.upload_id = pu.upload_id
LEFT JOIN documents.layout_presets lp ON pj.preset_id = lp.preset_id
LEFT JOIN documents.pdf_metadata pm ON pu.upload_id = pm.upload_id
WHERE pj.job_status NOT IN ('completed', 'cancelled')
ORDER BY pj.priority DESC, pj.created_at ASC;

-- ============================================================
-- VIEW: Revenue Analytics
-- ============================================================

CREATE OR REPLACE VIEW commerce.v_revenue_analytics AS
SELECT
    DATE_TRUNC('month', p.paid_at) AS revenue_month,
    p.payment_gateway,
    p.currency_code,
    sp.plan_tier,
    sp.plan_name,
    p.billing_country_code AS country_code,
    COUNT(*) AS transaction_count,
    COUNT(DISTINCT p.user_id) AS unique_paying_users,
    SUM(p.amount) AS gross_revenue,
    SUM(p.tax_amount) AS total_tax,
    SUM(p.discount_amount) AS total_discounts,
    SUM(p.amount - p.tax_amount - p.discount_amount) AS net_revenue,
    SUM(p.refunded_amount) AS total_refunded,
    SUM(p.amount - p.refunded_amount) AS net_after_refunds,
    AVG(p.amount) AS avg_transaction_value,
    MAX(p.amount) AS max_transaction_value

FROM commerce.payments p
JOIN commerce.subscriptions s ON p.subscription_id = s.subscription_id
JOIN commerce.subscription_plans sp ON s.plan_id = sp.plan_id
WHERE p.status = 'succeeded'
  AND p.paid_at IS NOT NULL
GROUP BY 1, 2, 3, 4, 5, 6;

-- ============================================================
-- VIEW: System Health Dashboard
-- ============================================================

CREATE OR REPLACE VIEW analytics.v_system_health AS
SELECT
    -- Upload metrics (last 24h)
    (
        SELECT COUNT(*) 
        FROM documents.pdf_uploads 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
    ) AS uploads_last_24h,

    -- Job metrics
    (
        SELECT COUNT(*) 
        FROM documents.processing_jobs 
        WHERE job_status = 'running'
    ) AS jobs_currently_running,

    (
        SELECT COUNT(*) 
        FROM documents.processing_jobs 
        WHERE job_status = 'queued'
    ) AS jobs_in_queue,

    (
        SELECT COUNT(*) 
        FROM documents.processing_jobs 
        WHERE job_status = 'failed' 
          AND created_at >= NOW() - INTERVAL '1 hour'
    ) AS jobs_failed_last_hour,

    -- Average processing time (last 100 successful jobs)
    (
        SELECT ROUND(AVG(processing_duration_ms))
        FROM (
            SELECT processing_duration_ms 
            FROM documents.processing_jobs 
            WHERE job_status = 'completed' 
              AND processing_duration_ms IS NOT NULL
            ORDER BY completed_at DESC 
            LIMIT 100
        ) recent_jobs
    ) AS avg_processing_ms_last_100,

    -- Active users (last 15 min)
    (
        SELECT COUNT(DISTINCT user_id) 
        FROM core.user_sessions 
        WHERE last_activity_at >= NOW() - INTERVAL '15 minutes'
          AND is_active = TRUE
    ) AS active_sessions_15min,

    -- Storage stats
    (
        SELECT ROUND(SUM(file_size_bytes)::NUMERIC / (1024^3), 2)
        FROM documents.pdf_uploads 
        WHERE is_deleted = FALSE
    ) AS total_storage_used_gb,

    NOW() AS snapshot_at;

-- ============================================================
-- VIEW: Security Alerts
-- ============================================================

CREATE OR REPLACE VIEW audit.v_security_alerts AS
SELECT
    al.audit_id,
    al.created_at,
    al.severity,
    al.risk_score,
    al.action_type,
    al.action_category,
    al.ip_address,
    al.user_id,
    u.email,
    u.username,
    al.risk_factors,
    al.notes,

    -- Failed login count for same IP in last hour
    (
        SELECT COUNT(*) 
        FROM audit.audit_logs al2 
        WHERE al2.ip_address = al.ip_address 
          AND al2.action_type = 'LOGIN_FAILED'
          AND al2.created_at >= NOW() - INTERVAL '1 hour'
    ) AS failed_logins_same_ip_1h

FROM audit.audit_logs al
LEFT JOIN core.users u ON al.user_id = u.user_id
WHERE al.is_suspicious = TRUE 
   OR al.severity IN ('error', 'critical')
   OR al.risk_score >= 70
ORDER BY al.created_at DESC;
```

---

# PART 6: TRIGGERS

```sql
-- ============================================================
-- TRIGGER FUNCTION: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION config.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema IN ('core', 'documents', 'commerce', 'analytics')
    LOOP
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER trg_set_updated_at
             BEFORE UPDATE ON %I.%I
             FOR EACH ROW
             EXECUTE FUNCTION config.trigger_set_updated_at();',
            t.table_schema,
            t.table_name
        );
    END LOOP;
END;
$$;

-- ============================================================
-- TRIGGER FUNCTION: Audit logging trigger
-- ============================================================

CREATE OR REPLACE FUNCTION audit.trigger_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_data    JSONB;
    v_new_data    JSONB;
    v_changed     TEXT[];
    v_action      VARCHAR;
    v_user_id     UUID;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
        v_changed := ARRAY(SELECT key FROM jsonb_each(v_new_data));
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Calculate changed fields only
        SELECT ARRAY(
            SELECT key FROM jsonb_each(v_new_data)
            WHERE jsonb_each.value IS DISTINCT FROM (v_old_data->key)
        ) INTO v_changed;
        
        -- Skip if nothing changed
        IF array_length(v_changed, 1) = 0 OR v_changed IS NULL THEN
            RETURN NEW;
        END IF;
        
        -- Filter sensitive fields from audit
        v_old_data := v_old_data - ARRAY['password_hash', 'mfa_secret_encrypted', 'mfa_backup_codes'];
        v_new_data := v_new_data - ARRAY['password_hash', 'mfa_secret_encrypted', 'mfa_backup_codes'];
        
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_old_data := to_jsonb(OLD) - ARRAY['password_hash', 'mfa_secret_encrypted'];
        v_new_data := NULL;
        v_changed := NULL;
    END IF;

    -- Try to extract user_id from the row
    BEGIN
        v_user_id := CASE
            WHEN TG_OP = 'DELETE' THEN (v_old_data->>'user_id')::UUID
            ELSE (v_new_data->>'user_id')::UUID
        END;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    INSERT INTO audit.audit_logs (
        user_id,
        action_type,
        action_category,
        table_name,
        schema_name,
        record_id,
        old_values,
        new_values,
        changed_fields,
        severity,
        created_at
    ) VALUES (
        v_user_id,
        v_action,
        'data',
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
            ELSE NEW.id::TEXT
        END,
        v_old_data,
        v_new_data,
        v_changed,
        'info',
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    -- Never fail the main transaction due to audit error
    RAISE WARNING 'Audit log failed: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Apply audit trigger to critical tables
CREATE TRIGGER trg_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON core.users
    FOR EACH ROW EXECUTE FUNCTION audit.trigger_audit_log();

CREATE TRIGGER trg_audit_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON commerce.subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit.trigger_audit_log();

CREATE TRIGGER trg_audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON commerce.payments
    FOR EACH ROW EXECUTE FUNCTION audit.trigger_audit_log();

CREATE TRIGGER trg_audit_role_permissions
    AFTER INSERT OR DELETE ON core.role_permissions
    FOR EACH ROW EXECUTE FUNCTION audit.trigger_audit_log();

-- ============================================================
-- TRIGGER FUNCTION: Enforce subscription limits on upload
-- ============================================================

CREATE OR REPLACE FUNCTION documents.trigger_check_upload_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_subscription  RECORD;
    v_plan          RECORD;
    v_upload_count  INTEGER;
BEGIN
    -- Get user's subscription
    SELECT s.*, sp.*
    INTO v_subscription
    FROM commerce.subscriptions s
    JOIN commerce.subscription_plans sp ON s.plan_id = sp.plan_id
    WHERE s.user_id = NEW.user_id
      AND s.status IN ('active', 'trialing');

    IF NOT FOUND THEN
        RAISE EXCEPTION 
            'QUOTA_NO_ACTIVE_SUBSCRIPTION: User % has no active subscription', 
            NEW.user_id;
    END IF;

    -- Check monthly upload limit
    IF v_subscription.uploads_used_this_period >= v_subscription.max_uploads_per_month THEN
        RAISE EXCEPTION 
            'QUOTA_UPLOAD_LIMIT: Monthly upload limit of % reached', 
            v_subscription.max_uploads_per_month;
    END IF;

    -- Check file size limit
    IF NEW.file_size_bytes > (v_subscription.max_file_size_mb * 1024 * 1024) THEN
        RAISE EXCEPTION 
            'QUOTA_FILE_SIZE: File size % MB exceeds plan limit of % MB',
            ROUND(NEW.file_size_bytes / (1024.0 * 1024.0), 2),
            v_subscription.max_file_size_mb;
    END IF;

    -- Check storage limit
    IF (v_subscription.storage_used_bytes + NEW.file_size_bytes) > 
       (v_subscription.storage_limit_gb * 1024 * 1024 * 1024) THEN
        RAISE EXCEPTION 
            'QUOTA_STORAGE: Storage limit of % GB would be exceeded',
            v_subscription.storage_limit_gb;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_upload_quota
    BEFORE INSERT ON documents.pdf_uploads
    FOR EACH ROW EXECUTE FUNCTION documents.trigger_check_upload_quota();

-- ============================================================
-- TRIGGER FUNCTION: Increment upload counter on subscription
-- ============================================================

CREATE OR REPLACE FUNCTION documents.trigger_increment_upload_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.upload_status = 'completed' AND 
       (OLD.upload_status IS NULL OR OLD.upload_status != 'completed') THEN
        
        UPDATE commerce.subscriptions
        SET 
            uploads_used_this_period = uploads_used_this_period + 1,
            storage_used_bytes = storage_used_bytes + NEW.file_size_bytes,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Decrement on delete
    IF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        UPDATE commerce.subscriptions
        SET 
            storage_used_bytes = GREATEST(0, storage_used_bytes - NEW.file_size_bytes),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_upload_usage
    AFTER INSERT OR UPDATE ON documents.pdf_uploads
    FOR EACH ROW EXECUTE FUNCTION documents.trigger_increment_upload_usage();

-- ============================================================
-- TRIGGER FUNCTION: Reset subscription usage on period renewal
-- ============================================================

CREATE OR REPLACE FUNCTION commerce.trigger_reset_period_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Detect period rollover
    IF NEW.current_period_start != OLD.current_period_start THEN
        NEW.uploads_used_this_period := 0;
        -- Storage persists (not reset monthly)
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reset_period_usage
    BEFORE UPDATE ON commerce.subscriptions
    FOR EACH ROW EXECUTE FUNCTION commerce.trigger_reset_period_usage();

-- ============================================================
-- TRIGGER FUNCTION: Update preset usage count
-- ============================================================

CREATE OR REPLACE FUNCTION documents.trigger_update_preset_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.preset_id IS NOT NULL THEN
        UPDATE documents.layout_presets
        SET 
            usage_count = usage_count + 1,
            last_used_at = NOW()
        WHERE preset_id = NEW.preset_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_preset_usage
    AFTER INSERT ON documents.generated_pdfs
    FOR EACH ROW EXECUTE FUNCTION documents.trigger_update_preset_usage();

-- ============================================================
-- TRIGGER FUNCTION: Security - detect suspicious login activity
-- ============================================================

CREATE OR REPLACE FUNCTION audit.trigger_detect_suspicious_login()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_failed_count  INTEGER;
    v_risk_score    SMALLINT := 0;
    v_risk_factors  TEXT[] := '{}';
BEGIN
    -- Only process login events
    IF NEW.action_type NOT IN ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGIN_MFA_FAILED') THEN
        RETURN NEW;
    END IF;

    -- Count recent failures from same IP
    SELECT COUNT(*)
    INTO v_failed_count
    FROM audit.audit_logs
    WHERE ip_address = NEW.ip_address
      AND action_type = 'LOGIN_FAILED'
      AND created_at >= NOW() - INTERVAL '1 hour'
      AND audit_id != NEW.audit_id;

    IF v_failed_count >= 10 THEN
        v_risk_score := v_risk_score + 50;
        v_risk_factors := v_risk_factors || 'brute_force_ip';
    ELSIF v_failed_count >= 5 THEN
        v_risk_score := v_risk_score + 25;
        v_risk_factors := v_risk_factors || 'multiple_failures_ip';
    END IF;

    -- Check for user-specific failures
    IF NEW.user_id IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_failed_count
        FROM audit.audit_logs
        WHERE user_id = NEW.user_id
          AND action_type = 'LOGIN_FAILED'
          AND created_at >= NOW() - INTERVAL '15 minutes';

        IF v_failed_count >= 5 THEN
            v_risk_score := v_risk_score + 30;
            v_risk_factors := v_risk_factors || 'account_targeted';
        END IF;
    END IF;

    -- Update the row we're inserting
    NEW.risk_score := LEAST(100, v_risk_score);
    NEW.risk_factors := v_risk_factors;
    NEW.is_suspicious := (v_risk_score >= 50);

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_detect_suspicious_login
    BEFORE INSERT ON audit.audit_logs
    FOR EACH ROW EXECUTE FUNCTION audit.trigger_detect_suspicious_login();
```

---

# PART 7: STORED PROCEDURES & FUNCTIONS

```sql
-- ============================================================
-- FUNCTION: Create default partition for analytics events
-- ============================================================

CREATE OR REPLACE FUNCTION config.create_monthly_partition(
    p_schema_name   TEXT,
    p_table_name    TEXT,
    p_year          INTEGER,
    p_month         INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_partition_name    TEXT;
    v_start_date        DATE;
    v_end_date          DATE;
    v_sql               TEXT;
BEGIN
    v_partition_name := format('%s_%s_%s', 
        p_table_name, p_year, LPAD(p_month::TEXT, 2, '0'));
    v_start_date := DATE(format('%s-%s-01', p_year, p_month));
    v_end_date := v_start_date + INTERVAL '1 month';

    v_sql := format(
        'CREATE TABLE IF NOT EXISTS %I.%I 
         PARTITION OF %I.%I
         FOR VALUES FROM (%L) TO (%L)',
        p_schema_name, v_partition_name,
        p_schema_name, p_table_name,
        v_start_date, v_end_date
    );

    EXECUTE v_sql;

    RAISE NOTICE 'Created partition: %.%', p_schema_name, v_partition_name;
EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE 'Partition already exists: %.%', p_schema_name, v_partition_name;
END;
$$;

-- Pre-create partitions for 2025-2026
DO $$
DECLARE
    y INT;
    m INT;
BEGIN
    FOR y IN 2025..2026 LOOP
        FOR m IN 1..12 LOOP
            PERFORM config.create_monthly_partition('analytics', 'analytics_events', y, m);
            PERFORM config.create_monthly_partition('audit', 'audit_logs', y, m);
        END LOOP;
    END LOOP;
END;
$$;

-- ============================================================
-- PROCEDURE: Register new user
-- ============================================================

CREATE OR REPLACE PROCEDURE core.sp_register_user(
    p_email         VARCHAR(320),
    p_username      VARCHAR(50),
    p_password_hash VARCHAR(255),
    p_full_name     VARCHAR(255) DEFAULT NULL,
    p_country_code  CHAR(2) DEFAULT NULL,
    p_referral_src  VARCHAR(100) DEFAULT NULL,
    OUT p_user_id   UUID,
    OUT p_error     VARCHAR(200)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_default_role_id   UUID;
    v_free_plan_id      UUID;
    v_subscription_id   UUID;
BEGIN
    p_error := NULL;

    -- Validate email uniqueness
    IF EXISTS (
        SELECT 1 FROM core.users 
        WHERE LOWER(email) = LOWER(p_email) AND is_deleted = FALSE
    ) THEN
        p_error := 'EMAIL_ALREADY_EXISTS';
        RETURN;
    END IF;

    -- Validate username uniqueness
    IF EXISTS (
        SELECT 1 FROM core.users 
        WHERE LOWER(username) = LOWER(p_username) AND is_deleted = FALSE
    ) THEN
        p_error := 'USERNAME_ALREADY_EXISTS';
        RETURN;
    END IF;

    -- Get default role (student/user)
    SELECT role_id INTO v_default_role_id
    FROM core.roles WHERE role_slug = 'user' LIMIT 1;

    IF v_default_role_id IS NULL THEN
        p_error := 'SYSTEM_ERROR_NO_DEFAULT_ROLE';
        RETURN;
    END IF;

    -- Get free plan
    SELECT plan_id INTO v_free_plan_id
    FROM commerce.subscription_plans 
    WHERE plan_slug = 'free' AND is_active = TRUE 
    LIMIT 1;

    -- Insert user
    INSERT INTO core.users (
        email, username, password_hash, full_name,
        country_code, role_id, referral_source,
        auth_provider, status
    ) VALUES (
        LOWER(TRIM(p_email)),
        LOWER(TRIM(p_username)),
        p_password_hash,
        p_full_name,
        p_country_code,
        v_default_role_id,
        p_referral_src,
        'local',
        'pending_verification'
    )
    RETURNING user_id INTO p_user_id;

    -- Create free subscription (with 14-day trial)
    INSERT INTO commerce.subscriptions (
        user_id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end
    ) VALUES (
        p_user_id,
        v_free_plan_id,
        'trialing',
        'monthly',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '14 days'
    );

    -- Log the registration event
    INSERT INTO audit.audit_logs (
        user_id, action_type, action_category,
        table_name, record_id, severity, new_values
    ) VALUES (
        p_user_id, 'USER_REGISTERED', 'auth',
        'users', p_user_id::TEXT, 'info',
        jsonb_build_object('email', p_email, 'username', p_username)
    );

EXCEPTION WHEN OTHERS THEN
    p_error := format('UNEXPECTED_ERROR: %s', SQLERRM);
    RAISE WARNING 'sp_register_user failed: %', SQLERRM;
END;
$$;

-- ============================================================
-- PROCEDURE: Submit PDF imposition job
-- ============================================================

CREATE OR REPLACE PROCEDURE documents.sp_submit_imposition_job(
    p_user_id       UUID,
    p_upload_id     UUID,
    p_preset_id     UUID,
    p_priority      SMALLINT DEFAULT 5,
    p_custom_params JSONB DEFAULT '{}',
    OUT p_job_id    UUID,
    OUT p_error     VARCHAR(200)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_upload        RECORD;
    v_preset        RECORD;
    v_subscription  RECORD;
    v_queue_name    VARCHAR(100);
BEGIN
    p_error := NULL;

    -- Validate upload ownership
    SELECT * INTO v_upload
    FROM documents.pdf_uploads
    WHERE upload_id = p_upload_id 
      AND user_id = p_user_id
      AND is_deleted = FALSE
      AND virus_scan_status = 'clean';

    IF NOT FOUND THEN
        p_error := 'UPLOAD_NOT_FOUND_OR_NOT_CLEAN';
        RETURN;
    END IF;

    IF v_upload.upload_status != 'completed' THEN
        p_error := format('UPLOAD_NOT_READY: Status is %s', v_upload.upload_status);
        RETURN;
    END IF;

    -- Validate preset if provided
    IF p_preset_id IS NOT NULL THEN
        SELECT * INTO v_preset
        FROM documents.layout_presets
        WHERE preset_id = p_preset_id
          AND is_active = TRUE
          AND is_deleted = FALSE;

        IF NOT FOUND THEN
            p_error := 'PRESET_NOT_FOUND';
            RETURN;
        END IF;

        -- Validate preset ownership (can use system or own presets)
        IF v_preset.preset_type = 'user_custom' AND v_preset.created_by != p_user_id THEN
            p_error := 'PRESET_ACCESS_DENIED';
            RETURN;
        END IF;
    END IF;

    -- Determine queue based on subscription priority
    SELECT s.status, sp.allows_priority_processing, sp.plan_tier
    INTO v_subscription
    FROM commerce.subscriptions s
    JOIN commerce.subscription_plans sp ON s.plan_id = sp.plan_id
    WHERE s.user_id = p_user_id;

    v_queue_name := CASE
        WHEN v_subscription.allows_priority_processing THEN 'priority'
        WHEN v_subscription.plan_tier IN ('pro', 'enterprise', 'team') THEN 'standard'
        ELSE 'default'
    END;

    -- Create the job
    INSERT INTO documents.processing_jobs (
        user_id,
        upload_id,
        preset_id,
        job_type,
        job_status,
        priority,
        queue_name,
        input_parameters,
        max_attempts
    ) VALUES (
        p_user_id,
        p_upload_id,
        p_preset_id,
        'imposition',
        'queued',
        COALESCE(p_priority, 5),
        v_queue_name,
        p_custom_params,
        3
    )
    RETURNING job_id INTO p_job_id;

    -- Log analytics event
    INSERT INTO analytics.analytics_events (
        user_id,
        event_type,
        event_category,
        event_action,
        upload_id,
        preset_id,
        properties
    ) VALUES (
        p_user_id,
        'JOB_SUBMITTED',
        'process',
        'imposition_job_created',
        p_upload_id,
        p_preset_id,
        jsonb_build_object(
            'job_id', p_job_id,
            'queue', v_queue_name,
            'priority', p_priority
        )
    );

EXCEPTION WHEN OTHERS THEN
    p_error := format('JOB_SUBMISSION_ERROR: %s', SQLERRM);
    RAISE WARNING 'sp_submit_imposition_job failed: %', SQLERRM;
END;
$$;

-- ============================================================
-- PROCEDURE: Archive old analytics data
-- ============================================================

CREATE OR REPLACE PROCEDURE config.sp_archive_old_analytics(
    p_retention_months INTEGER DEFAULT 12,
    p_dry_run BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cutoff_date   DATE;
    v_archive_count BIGINT;
    v_partition_name TEXT;
    v_sql TEXT;
BEGIN
    v_cutoff_date := CURRENT_DATE - (p_retention_months || ' months')::INTERVAL;

    RAISE NOTICE 'Archive cutoff date: %. Dry run: %', v_cutoff_date, p_dry_run;

    -- Count rows to be archived
    SELECT COUNT(*) INTO v_archive_count
    FROM analytics.analytics_events
    WHERE created_at < v_cutoff_date;

    RAISE NOTICE 'Rows eligible for archiving: %', v_archive_count;

    IF p_dry_run THEN
        RAISE NOTICE 'DRY RUN complete. No data modified.';
        RETURN;
    END IF;

    -- Create archive table if not exists
    CREATE TABLE IF NOT EXISTS analytics.analytics_events_archive
    (LIKE analytics.analytics_events INCLUDING ALL);

    -- Move data to archive
    WITH moved AS (
        DELETE FROM analytics.analytics_events
        WHERE created_at < v_cutoff_date
        RETURNING *
    )
    INSERT INTO analytics.analytics_events_archive
    SELECT * FROM moved;

    GET DIAGNOSTICS v_archive_count = ROW_COUNT;

    RAISE NOTICE 'Archived % rows.', v_archive_count;

    -- Log the archival operation
    INSERT INTO audit.audit_logs (
        action_type, action_category, severity,
        notes, table_name
    ) VALUES (
        'DATA_ARCHIVED', 'system', 'info',
        format('Archived %s analytics rows older than %s months', 
               v_archive_count, p_retention_months),
        'analytics_events'
    );

END;
$$;

-- ============================================================
-- FUNCTION: Calculate user statistics
-- ============================================================

CREATE OR REPLACE FUNCTION core.fn_get_user_stats(
    p_user_id UUID,
    p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_uploads           BIGINT,
    total_generated_pdfs    BIGINT,
    total_pages_processed   BIGINT,
    total_paper_saved       BIGINT,
    total_cost_saved        NUMERIC,
    avg_size_reduction      NUMERIC,
    total_downloads         BIGINT,
    favourite_preset        VARCHAR,
    busiest_day             DATE,
    storage_used_mb         NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH user_uploads AS (
        SELECT 
            pu.upload_id,
            pu.file_size_bytes,
            pu.created_at::DATE AS upload_date
        FROM documents.pdf_uploads pu
        WHERE pu.user_id = p_user_id
          AND pu.is_deleted = FALSE
          AND pu.created_at >= NOW() - (p_period_days || ' days')::INTERVAL
    ),
    user_generated AS (
        SELECT
            gp.generated_pdf_id,
            gp.preset_id,
            gp.total_pages_original,
            gp.estimated_paper_saved,
            gp.estimated_cost_saved,
            gp.size_reduction_percent,
            gp.download_count
        FROM documents.generated_pdfs gp
        WHERE gp.user_id = p_user_id
          AND gp.is_deleted = FALSE
          AND gp.created_at >= NOW() - (p_period_days || ' days')::INTERVAL
    )
    SELECT
        (SELECT COUNT(*) FROM user_uploads)::BIGINT,
        (SELECT COUNT(*) FROM user_generated)::BIGINT,
        COALESCE((SELECT SUM(total_pages_original) FROM user_generated), 0)::BIGINT,
        COALESCE((SELECT SUM(estimated_paper_saved) FROM user_generated), 0)::BIGINT,
        COALESCE((SELECT SUM(estimated_cost_saved) FROM user_generated), 0),
        COALESCE((SELECT ROUND(AVG(size_reduction_percent), 2) FROM user_generated), 0),
        COALESCE((SELECT SUM(download_count) FROM user_generated), 0)::BIGINT,
        (
            SELECT lp.preset_name
            FROM user_generated ug
            JOIN documents.layout_presets lp ON ug.preset_id = lp.preset_id
            GROUP BY lp.preset_name
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ),
        (
            SELECT upload_date
            FROM user_uploads
            GROUP BY upload_date
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ),
        COALESCE(
            (SELECT ROUND(SUM(file_size_bytes)::NUMERIC / (1024*1024), 2) FROM user_uploads),
            0
        );
END;
$$;

-- ============================================================
-- FUNCTION: Cleanup expired files (called by cron)
-- ============================================================

CREATE OR REPLACE FUNCTION config.fn_cleanup_expired_files()
RETURNS TABLE (
    uploads_marked_deleted  INTEGER,
    generated_marked_deleted INTEGER,
    sessions_revoked        INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_uploads_deleted   INTEGER := 0;
    v_generated_deleted INTEGER := 0;
    v_sessions_revoked  INTEGER := 0;
BEGIN
    -- Soft delete expired uploads
    WITH expired_uploads AS (
        UPDATE documents.pdf_uploads
        SET is_deleted = TRUE, deleted_at = NOW()
        WHERE expires_at < NOW() AND is_deleted = FALSE
        RETURNING upload_id
    )
    SELECT COUNT(*) INTO v_uploads_deleted FROM expired_uploads;

    -- Soft delete expired generated PDFs
    WITH expired_generated AS (
        UPDATE documents.generated_pdfs
        SET is_deleted = TRUE, deleted_at = NOW()
        WHERE expires_at < NOW() AND is_deleted = FALSE
        RETURNING generated_pdf_id
    )
    SELECT COUNT(*) INTO v_generated_deleted FROM expired_generated;

    -- Revoke expired sessions
    WITH expired_sessions AS (
        UPDATE core.user_sessions
        SET is_active = FALSE, revoked_at = NOW(),
            revocation_reason = 'expired'
        WHERE expires_at < NOW() AND is_active = TRUE
        RETURNING session_id
    )
    SELECT COUNT(*) INTO v_sessions_revoked FROM expired_sessions;

    RETURN QUERY SELECT v_uploads_deleted, v_generated_deleted, v_sessions_revoked;
END;
$$;
```

---

# PART 8: ER DIAGRAM (TEXT REPRESENTATION)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    IMPOSIFY — ENTITY RELATIONSHIP DIAGRAM                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE SCHEMA                                     │
│                                                                              │
│  ┌──────────────────┐   M:N   ┌──────────────────┐                          │
│  │    PERMISSIONS   │◄───────►│      ROLES        │                          │
│  ├──────────────────┤ via     ├──────────────────┤                          │
│  │ PK permission_id │role_perms│ PK role_id       │                          │
│  │    module_name   │         │    role_name      │                          │
│  │    action_type   │         │    priority_level │                          │
│  └──────────────────┘         └────────┬─────────┘                          │
│                                        │ 1                                   │
│                                        │                                     │
│                                        ▼ M                                   │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                           USERS                                  │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │ PK  user_id                  │ email (UQ)                        │        │
│  │     username (UQ)            │ password_hash                     │        │
│  │     auth_provider            │ status                            │        │
│  │     mfa_enabled              │ last_login_at                     │        │
│  │ FK  role_id → roles          │ country_code                      │        │
│  └──────────────────────────────┬────────────────────────────────┬─┘        │
│                                  │ 1                              │ 1        │
│           ┌──────────────────────┘                                │          │
│           │                                                        │          │
│           ▼ M                                                      ▼ 1       │
│  ┌─────────────────────┐              ┌────────────────────────────────┐    │
│  │   USER_SESSIONS     │              │         SUBSCRIPTIONS          │    │
│  ├─────────────────────┤              ├────────────────────────────────┤    │
│  │ PK session_id       │              │ PK subscription_id             │    │
│  │ FK user_id          │              │ FK user_id                     │    │
│  │    session_token_   │              │ FK plan_id → sub_plans         │    │
│  │    hash (UQ)        │              │    status                      │    │
│  │    expires_at       │              │    billing_cycle               │    │
│  │    is_active        │              │    uploads_used_this_period    │    │
│  └─────────────────────┘              │    storage_used_bytes          │    │
│                                        └───────────────┬────────────────┘    │
│                                                         │ 1                   │
│                                                         ▼ M                  │
│                                        ┌────────────────────────────────┐    │
│                                        │           PAYMENTS              │    │
│                                        ├────────────────────────────────┤    │
│                                        │ PK payment_id                  │    │
│                                        │ FK user_id                     │    │
│                                        │ FK subscription_id             │    │
│                                        │    amount, currency_code       │    │
│                                        │    status, payment_gateway     │    │
│                                        │    gateway_payment_id (UQ)     │    │
│                                        └────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCUMENTS SCHEMA                                  │
│                                                                              │
│  users.user_id ──────────────────────────────────────────┐                 │
│                                                            │ 1               │
│                                                            ▼ M               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          PDF_UPLOADS                                    │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ PK upload_id            │ original_filename                             │ │
│  │ FK user_id              │ file_size_bytes                               │ │
│  │    stored_filename      │ file_hash_sha256                              │ │
│  │    storage_provider     │ upload_status                                 │ │
│  │    virus_scan_status    │ expires_at                                    │ │
│  └────────────────┬────────────────────────────────────────────────────────┘ │
│                   │ 1                                                         │
│     ┌─────────────┼─────────────────────────┐                               │
│     │             │                          │                               │
│     ▼ 1           ▼ M                        ▼ M                            │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────────────┐              │
│  │PDF_META  │  │PROCESSING_JOBS │  │    GENERATED_PDFS       │              │
│  │DATA      │  ├────────────────┤  ├────────────────────────┤              │
│  ├──────────┤  │ PK job_id      │  │ PK generated_pdf_id    │              │
│  │PK meta_id│  │ FK user_id     │  │ FK upload_id           │              │
│  │FK upload_│  │ FK upload_id   │  │ FK user_id             │              │
│  │   id(UQ) │  │ FK preset_id   │  │ FK preset_id           │              │
│  │total_pgs │  │ FK gen_pdf_id  │  │ FK job_id              │              │
│  │pg_width  │  │ job_type       │  │ output_filename        │              │
│  │pg_height │  │ job_status     │  │ total_pages_output     │              │
│  │has_forms │  │ priority       │  │ size_reduction_%       │              │
│  │color_    │  │ progress_%     │  │ download_count         │              │
│  │space     │  │ worker_id      │  │ estimated_cost_saved   │              │
│  └──────────┘  └───────┬────────┘  └────────────────────────┘              │
│                         │ M                                                   │
│                         │ uses                                                │
│                         ▼ 1                                                   │
│               ┌──────────────────────────────────────────────────────────┐   │
│               │                   LAYOUT_PRESETS                          │   │
│               ├──────────────────────────────────────────────────────────┤   │
│               │ PK preset_id         │ preset_name, preset_slug (UQ)     │   │
│               │ FK created_by(users) │ pages_per_sheet                   │   │
│               │    preset_type       │ duplex_mode, binding_edge         │   │
│               │    margins           │ paper_size                        │   │
│               │    front/back        │ is_booklet_mode                   │   │
│               │    arrangement(JSONB)│ usage_count                       │   │
│               └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         OBSERVABILITY SCHEMA                                 │
│                                                                              │
│  users ──────────────────────────────────────────────┐                      │
│                                                        │                      │
│  ┌──────────────────────────────────┐    ┌────────────▼────────────────┐   │
│  │       ANALYTICS_EVENTS           │    │         AUDIT_LOGS           │   │
│  │     (partitioned by month)        │    │   (partitioned by quarter)  │   │
│  ├──────────────────────────────────┤    ├────────────────────────────┤   │
│  │ PK (event_id, created_at)        │    │ PK (audit_id, created_at)  │   │
│  │ FK user_id (nullable)            │    │ FK user_id (nullable)       │   │
│  │ FK session_id                    │    │ FK session_id               │   │
│  │    event_type, event_category    │    │    action_type              │   │
│  │    upload_id, job_id, preset_id  │    │    table_name, record_id   │   │
│  │    device_type, country_code     │    │    old_values (JSONB)       │   │
│  │    properties (JSONB)            │    │    new_values (JSONB)       │   │
│  └──────────────────────────────────┘    │    severity, risk_score    │   │
│                                           │    is_suspicious           │   │
│                                           └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 9: NORMALIZATION ANALYSIS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NORMALIZATION ANALYSIS — IMPOSIFY DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1NF (First Normal Form) ✅
━━━━━━━━━━━━━━━━━━━━━━━
✓ All tables have a primary key
✓ All columns are atomic (single values)
✓ No repeating groups

Deliberate 1NF exception:
  - pdf_metadata.keywords → TEXT[] (PostgreSQL native array)
    Justification: Keywords are a set property of a document.
    Queried with GIN index, not joins. Performance > purity.
  - audit_logs.changed_fields → TEXT[]
    Justification: Ordered list of field names, always queried
    as a unit, never joined.

2NF (Second Normal Form) ✅
━━━━━━━━━━━━━━━━━━━━━━━━
✓ All tables use single-column surrogate UUID PKs
✓ No partial dependencies on composite PKs

Composite PK exception:
  - role_permissions (role_id, permission_id)
    All non-key attributes (granted_by, granted_at) depend
    on the full composite key. ✓ Fully 2NF compliant.
  - analytics_events (event_id, created_at) — partition key
    created_at is part of partition strategy, not business PK.
    This is a PostgreSQL-specific requirement, not a violation.

3NF (Third Normal Form) ✅
━━━━━━━━━━━━━━━━━━━━━━━━
✓ No transitive dependencies detected

Analysis:
  - users.country_code → stores code only
    country_name derived at application layer (not stored)
  - payments: billing address stored on payment row
    Justification: billing address is a historical snapshot.
    If user changes address, old payment records must retain
    the address at time of transaction. Denormalization is
    REQUIRED for financial compliance.
  - generated_pdfs.estimated_cost_saved
    Derived value, but STORED intentionally.
    Justification: Cost per page is a variable (set by user's
    country/printer). Cannot reliably recalculate later.

BCNF (Boyce-Codd Normal Form) ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Every determinant is a candidate key
✓ No non-trivial functional dependencies violate BCNF

4NF (Fourth Normal Form) ✅
━━━━━━━━━━━━━━━━━━━━━━━━
✓ No multi-valued dependencies
✓ role_permissions properly models the M:N relationship

INTENTIONAL DENORMALIZATION (Justified)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Table                   Denormalized Column         Justification
─────────────────────── ─────────────────────────── ──────────────────────────
generated_pdfs          total_pages_original        Snapshot at generation time
generated_pdfs          estimated_paper_saved       Variable input, snapshot
generated_pdfs          estimated_cost_saved        Variable input, snapshot
generated_pdfs          size_reduction_percent      Derived, stored for reports
pdf_metadata            page_width_mm               Computed column (auto-calc)
pdf_metadata            page_height_mm              Computed column (auto-calc)
processing_jobs         processing_duration_ms      Generated column (computed)
payments                billing_*                   Legal/financial snapshot
payments                amount_in_cents             Parallel precision column
analytics_events        country_name, city          Geo enrichment at insert
```

---

# PART 10: PARTITIONING STRATEGY

```sql
-- ============================================================
-- PARTITIONING DESIGN
-- ============================================================

/*
TABLE                   PARTITION TYPE    KEY             RATIONALE
─────────────────────── ───────────────── ─────────────── ─────────────────────
analytics_events        RANGE (monthly)   created_at      High volume, time-
                                                          series queries. Drop
                                                          old partitions easily.

audit_logs              RANGE (quarterly) created_at      Compliance retention.
                                                          Quarterly = manageable
                                                          partition count.

processing_jobs         RANGE (monthly)*  created_at      If volume warrants it
                                                          at 1M users.

pdf_uploads             RANGE (yearly)*   created_at      Lower volume, yearly
                                                          sufficient at scale.

* = implement at 100k+ users
*/

-- ============================================================
-- AUTO-CREATE FUTURE PARTITIONS (pg_cron job)
-- ============================================================

-- Requires pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Run first day of each month to create next month's partition
SELECT cron.schedule(
    'create-monthly-partitions',
    '0 0 1 * *',  -- Midnight on 1st of every month
    $$
    DO $$
    DECLARE
        v_next_year  INTEGER := EXTRACT(YEAR FROM NOW() + INTERVAL '2 months')::INTEGER;
        v_next_month INTEGER := EXTRACT(MONTH FROM NOW() + INTERVAL '2 months')::INTEGER;
    BEGIN
        PERFORM config.create_monthly_partition(
            'analytics', 'analytics_events', v_next_year, v_next_month
        );
        PERFORM config.create_monthly_partition(
            'audit', 'audit_logs', v_next_year, v_next_month
        );
    END;
    $$
    $$
);

-- Schedule cleanup job
SELECT cron.schedule(
    'cleanup-expired-files',
    '0 2 * * *',  -- 2 AM daily
    'SELECT * FROM config.fn_cleanup_expired_files()'
);
```

---

# PART 11: ARCHIVING STRATEGY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHIVING STRATEGY — IMPOSIFY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATA TIER         RETENTION      STORAGE         ACTION AFTER EXPIRY
────────────────  ─────────────  ──────────────  ────────────────────────
Active PDFs       30 days free   Hot (local/S3)  Soft delete → cold storage
                  90 days pro
                  365 days ent.

Generated PDFs    7 days free    Hot (S3)        Delete from S3
                  30 days pro
                  90 days ent.

Analytics Events  12 months hot  Partitioned PG  Move to cold PG / S3 CSV
                  7 years cold   S3 Parquet

Audit Logs        7 years        Partitioned PG  Move to S3 Glacier
                  (compliance)   + S3 Glacier

Processing Jobs   90 days        PG              Delete completed/cancelled
                  (active)

User Sessions     90 days        PG              Delete expired inactive

Payment Records   7 years        PG (never       Archive to read-only schema
                  (financial)    deleted)

TIERED STORAGE FLOW:
────────────────────

Uploaded File Journey:
  Upload → Local SSD (hot)
         → S3 Standard (after 24h)
         → S3 Intelligent-Tiering (after 30 days free tier)
         → S3 Glacier Instant (after 90 days)
         → S3 Glacier Deep Archive (after 1 year)
         → Delete (after retention period)

Analytics Journey:
  Event → PostgreSQL partition (hot, last 12 months)
        → CALL config.sp_archive_old_analytics(12) [monthly cron]
        → PG archive table (cold, 12-24 months)
        → Export to S3 as Parquet [for BI tools]
        → Delete from PG (older than 24 months)
        → S3 retained for 7 years
```

---

# PART 12: SCALING STRATEGY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCALING PLAYBOOK — 10K → 100K → 1M USERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1: 10,000 USERS
══════════════════════
Architecture: Single PostgreSQL instance (RDS db.t3.medium)
              + PgBouncer connection pooling

Optimizations:
  ✓ All indexes defined above are in place
  ✓ Partial indexes on soft-deleted rows
  ✓ PgBouncer transaction-mode pooling (max 25 connections)
  ✓ Redis cache for user sessions and preset lookups
  ✓ Autovacuum tuned for write-heavy tables

PostgreSQL Config (10k users):
  shared_buffers = 256MB
  effective_cache_size = 768MB
  work_mem = 4MB
  max_connections = 100
  wal_level = replica

Key queries to monitor:
  - Job queue pickup (polling every 2 seconds by workers)
  - User dashboard view (cache 5 min in Redis)
  - Subscription quota check (cache 1 min)

PHASE 2: 100,000 USERS
═══════════════════════
Architecture: Primary + 1 Read Replica (RDS db.r6g.xlarge)
              + PgBouncer on both
              + Redis Cluster

Read/Write split:
  Writes → Primary
  Reads → Replica:
    - v_user_dashboard
    - v_pdf_uploads_detailed
    - Analytics queries
    - Preset browsing

New indexes to add:
  -- Covering index for job queue (avoid heap fetches)
  CREATE INDEX idx_jobs_queue_covering
      ON documents.processing_jobs(
          queue_name, priority DESC, created_at ASC
      )
      INCLUDE (job_id, upload_id, user_id, preset_id, input_parameters)
      WHERE job_status = 'queued';

  -- BRIN index for time-series scans on analytics
  CREATE INDEX idx_analytics_created_brin
      ON analytics.analytics_events
      USING BRIN (created_at)
      WITH (pages_per_range = 128);

Materialized Views (refresh every 5 min):
  CREATE MATERIALIZED VIEW analytics.mv_daily_stats AS
  SELECT
      DATE_TRUNC('day', created_at) AS stat_date,
      event_category,
      COUNT(*) AS event_count,
      COUNT(DISTINCT user_id) AS unique_users
  FROM analytics.analytics_events
  WHERE created_at >= NOW() - INTERVAL '90 days'
  GROUP BY 1, 2;

  CREATE UNIQUE INDEX ON analytics.mv_daily_stats(stat_date, event_category);

PostgreSQL Config (100k users):
  shared_buffers = 4GB
  effective_cache_size = 12GB
  work_mem = 32MB
  max_connections = 200
  max_parallel_workers_per_gather = 4
  random_page_cost = 1.1  -- SSD storage

PHASE 3: 1,000,000 USERS
══════════════════════════
Architecture:
  - Primary (writes only) — db.r6g.4xlarge
  - 2x Read Replicas (reports, analytics) — db.r6g.2xlarge
  - 1x Read Replica (user-facing reads) — db.r6g.2xlarge
  - PgBouncer pool per replica
  - Redis Cluster (6 nodes) for L1 cache
  - TimescaleDB or ClickHouse for analytics (separate DB)

Table sharding consideration:
  pdf_uploads → Hash partition on user_id (16 partitions)
  processing_jobs → Range partition by created_at (monthly)
  analytics_events → Already partitioned, move to ClickHouse

  -- Example user_id hash partition
  CREATE TABLE documents.pdf_uploads (
      ...
  ) PARTITION BY HASH (user_id);

  CREATE TABLE documents.pdf_uploads_p0
      PARTITION OF documents.pdf_uploads
      FOR VALUES WITH (modulus 16, remainder 0);
  -- ... repeat for 1-15

Connection architecture:
  App Servers → PgBouncer → PostgreSQL Primary (writes)
  App Servers → PgBouncer → Read Replica Pool (reads)
  Analytics Worker → ClickHouse (analytics queries)

New optimizations:
  -- Declare frequently-accessed tables as UNLOGGED during bulk ops
  -- Temporarily disable triggers during bulk imports
  -- Async audit logging via queue (not synchronous trigger)

  -- Bloom filter index for duplicate hash checking
  CREATE EXTENSION IF NOT EXISTS bloom;
  CREATE INDEX idx_uploads_hash_bloom
      ON documents.pdf_uploads
      USING bloom (file_hash_sha256)
      WITH (length=80, col1=5);

PostgreSQL Config (1M users):
  shared_buffers = 16GB           -- 25% of RAM (64GB server)
  effective_cache_size = 48GB
  work_mem = 64MB
  max_connections = 500
  max_parallel_workers = 8
  max_parallel_workers_per_gather = 4
  checkpoint_completion_target = 0.9
  wal_buffers = 64MB
  default_statistics_target = 500
  random_page_cost = 1.0
  effective_io_concurrency = 300
  maintenance_work_mem = 2GB
```

---

# PART 13: POSTGRESQL BEST PRACTICES

```sql
-- ============================================================
-- BEST PRACTICE 1: UUID v7 for time-ordered IDs
-- ============================================================

-- Standard uuid_generate_v4() is random — poor index locality
-- At 1M+ users, switch to time-ordered UUIDs

CREATE OR REPLACE FUNCTION config.uuid_v7()
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_time  BIGINT;
    v_hex   TEXT;
BEGIN
    v_time := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
    v_hex := LPAD(TO_HEX(v_time), 12, '0')
          || '7'  -- version
          || LPAD(TO_HEX(FLOOR(RANDOM() * 4096)::INTEGER), 3, '0')
          || LPAD(TO_HEX(FLOOR(RANDOM() * 16384)::INTEGER + 32768), 4, '0')
          || LPAD(TO_HEX(FLOOR(RANDOM() * 281474976710656)::BIGINT), 12, '0');

    RETURN v_hex::UUID;
END;
$$;

-- ============================================================
-- BEST PRACTICE 2: Row-Level Security for multi-tenancy
-- ============================================================

ALTER TABLE documents.pdf_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_uploads_user_isolation
    ON documents.pdf_uploads
    FOR ALL
    TO app_user_role
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY rls_uploads_admin_all
    ON documents.pdf_uploads
    FOR ALL
    TO app_admin_role
    USING (TRUE);

-- Application sets this at session start:
-- SET LOCAL app.current_user_id = '<user_uuid>';

-- ============================================================
-- BEST PRACTICE 3: Table statistics tuning
-- ============================================================

-- High-cardinality columns need more stats buckets
ALTER TABLE documents.pdf_uploads 
    ALTER COLUMN file_hash_sha256 SET STATISTICS 500;

ALTER TABLE documents.processing_jobs 
    ALTER COLUMN job_status SET STATISTICS 10;  -- Low cardinality

ALTER TABLE analytics.analytics_events 
    ALTER COLUMN event_type SET STATISTICS 300;

-- ============================================================
-- BEST PRACTICE 4: Dead tuple management
-- ============================================================

-- processing_jobs is heavily updated → tune autovacuum aggressively
ALTER TABLE documents.processing_jobs SET (
    autovacuum_vacuum_scale_factor = 0.01,   -- vacuum at 1% dead
    autovacuum_analyze_scale_factor = 0.005,
    autovacuum_vacuum_threshold = 50,
    toast.autovacuum_vacuum_scale_factor = 0.01
);

-- High-update tables
ALTER TABLE core.user_sessions SET (
    autovacuum_vacuum_scale_factor = 0.01,
    autovacuum_vacuum_cost_delay = 2
);

ALTER TABLE commerce.subscriptions SET (
    autovacuum_vacuum_scale_factor = 0.05
);

-- ============================================================
-- BEST PRACTICE 5: Proper constraint definitions
-- ============================================================

-- Deferred constraints for complex transactions
ALTER TABLE documents.processing_jobs
    ADD CONSTRAINT fk_jobs_output_deferred
    FOREIGN KEY (generated_pdf_id)
    REFERENCES documents.generated_pdfs(generated_pdf_id)
    DEFERRABLE INITIALLY DEFERRED;

-- ============================================================
-- BEST PRACTICE 6: Query optimization helpers
-- ============================================================

-- Function to check if user can perform action (avoids N+1)
CREATE OR REPLACE FUNCTION core.fn_user_has_permission(
    p_user_id       UUID,
    p_permission_slug VARCHAR(150)
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM core.users u
        JOIN core.role_permissions rp ON u.role_id = rp.role_id
        JOIN core.permissions p ON rp.permission_id = p.permission_id
        WHERE u.user_id = p_user_id
          AND p.permission_slug = p_permission_slug
          AND u.is_deleted = FALSE
    );
$$;

-- ============================================================
-- BEST PRACTICE 7: Prepared statement hints
-- ============================================================

-- For the critical job pickup query (called thousands/sec)
PREPARE get_next_job(TEXT) AS
    SELECT 
        job_id, upload_id, preset_id, 
        user_id, input_parameters, job_type
    FROM documents.processing_jobs
    WHERE queue_name = $1
      AND job_status = 'queued'
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

-- ============================================================
-- BEST PRACTICE 8: Connection pool configuration
-- ============================================================

/*
PgBouncer config (pgbouncer.ini):

[databases]
imposify = host=localhost port=5432 dbname=imposify

[pgbouncer]
listen_port = 6432
pool_mode = transaction          -- Best for web apps
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
server_idle_timeout = 600
client_idle_timeout = 0
server_lifetime = 3600
application_name_add_host = 1
log_connections = 0              -- Reduce log noise
log_disconnections = 0
stats_period = 60
*/

-- ============================================================
-- BEST PRACTICE 9: Monitoring queries
-- ============================================================

-- Long-running queries
CREATE OR REPLACE VIEW config.v_long_running_queries AS
SELECT
    pid,
    NOW() - query_start AS duration,
    state,
    wait_event_type,
    wait_event,
    LEFT(query, 200) AS query_preview,
    usename,
    client_addr
FROM pg_stat_activity
WHERE state != 'idle'
  AND query_start IS NOT NULL
  AND (NOW() - query_start) > INTERVAL '30 seconds'
ORDER BY duration DESC;

-- Table bloat check
CREATE OR REPLACE VIEW config.v_table_bloat AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS total_size,
    pg_size_pretty(pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS table_size,
    n_dead_tup AS dead_tuples,
    n_live_tup AS live_tuples,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC NULLS LAST;

-- Cache hit ratio (should be > 99%)
CREATE OR REPLACE VIEW config.v_cache_hit_ratio AS
SELECT
    SUM(heap_blks_hit)::FLOAT / 
    NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0) * 100 AS cache_hit_ratio,
    SUM(idx_blks_hit)::FLOAT / 
    NULLIF(SUM(idx_blks_hit) + SUM(idx_blks_read), 0) * 100 AS index_cache_hit_ratio
FROM pg_statio_user_tables;

-- Unused indexes (waste of write overhead)
CREATE OR REPLACE VIEW config.v_unused_indexes AS
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS times_used,
    idx_tup_read AS tuples_read
FROM pg_stat_user_indexes
WHERE idx_scan < 10
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

# PART 14: SEED DATA

```sql
-- ============================================================
-- SEED: System Roles
-- ============================================================

INSERT INTO core.roles (role_id, role_name, role_slug, description, is_system_role, priority_level) VALUES
    (uuid_generate_v4(), 'Super Admin',    'super_admin',    'Full system access',              TRUE, 100),
    (uuid_generate_v4(), 'Admin',          'admin',          'Administrative access',           TRUE, 80),
    (uuid_generate_v4(), 'Support Agent',  'support',        'Customer support access',         TRUE, 40),
    (uuid_generate_v4(), 'User',           'user',           'Standard authenticated user',     TRUE, 10),
    (uuid_generate_v4(), 'Guest',          'guest',          'Anonymous/unauthenticated user',  TRUE, 0);

-- ============================================================
-- SEED: Subscription Plans
-- ============================================================

INSERT INTO commerce.subscription_plans (
    plan_name, plan_slug, plan_tier,
    price_monthly, price_annual, currency_code,
    max_uploads_per_month, max_file_size_mb, max_pages_per_file,
    storage_limit_gb, max_generated_pdfs_stored, max_batch_size,
    allows_custom_presets, allows_api_access, allows_priority_processing,
    allows_batch_processing, allows_advanced_compression,
    support_level, sort_order
) VALUES
    ('Free',         'free',       'free',       0,      0,      'USD', 5,   10,  100,  0.5,  10,  1,  FALSE, FALSE, FALSE, FALSE, FALSE, 'community', 1),
    ('Student',      'student',    'student',    2.99,   29.99,  'INR', 30,  25,  500,  2.0,  50,  1,  TRUE,  FALSE, FALSE, FALSE, FALSE, 'email',     2),
    ('Pro',          'pro',        'pro',        9.99,   99.99,  'USD', 200, 100, 2000, 10.0, 500, 5,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  'priority',  3),
    ('Enterprise',   'enterprise', 'enterprise', 49.99,  499.99, 'USD', -1,  500, -1,   100,  -1,  50, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  'dedicated', 4);

-- ============================================================
-- SEED: System Layout Presets (MAKAUT, GATE, Booklet, etc.)
-- ============================================================

INSERT INTO documents.layout_presets (
    created_by, preset_name, preset_slug, preset_type, description,
    pages_per_sheet, layout_columns, layout_rows,
    duplex_mode, binding_edge, page_order,
    margin_top_mm, margin_bottom_mm, margin_left_mm, margin_right_mm,
    gutter_mm, paper_size, rotation_degrees, scale_factor,
    show_border, show_page_numbers, is_booklet_mode,
    is_active, is_featured, sort_order
) VALUES
    -- 2-Up: Standard 2 pages per sheet
    (NULL, '2-Up Standard', '2-up-standard', 'system',
     'Print 2 pages side by side. Best for landscape notes.',
     2, 2, 1, 'long_edge', 'left', 'horizontal',
     5, 5, 5, 5, 2, 'A4', 0, 1.0,
     TRUE, FALSE, FALSE, TRUE, FALSE, 1),

    -- 4-Up: Standard 4 pages per sheet
    (NULL, '4-Up Standard', '4-up-standard', 'system',
     'Print 4 pages per sheet. Most popular for lecture notes.',
     4, 2, 2, 'long_edge', 'left', 'horizontal',
     4, 4, 4, 4, 2, 'A4', 0, 1.0,
     TRUE, FALSE, FALSE, TRUE, TRUE, 2),

    -- 9-Up: Study notes mode
    (NULL, '9-Up Notes Mode', '9-up-notes', 'system',
     'Print 9 pages per sheet. Maximum density for reference notes.',
     9, 3, 3, 'long_edge', 'left', 'horizontal',
     3, 3, 3, 3, 1.5, 'A4', 0, 1.0,
     TRUE, FALSE, FALSE, TRUE, TRUE, 3),

    -- MAKAUT Notes Mode
    (NULL, 'MAKAUT Notes Mode', 'makaut-notes', 'system',
     'Optimized for MAKAUT University printed notes. 4-up duplex A4.',
     4, 2, 2, 'long_edge', 'left', 'horizontal',
     5, 5, 8, 5, 2, 'A4', 0, 0.95,
     TRUE, TRUE, FALSE, TRUE, TRUE, 4),

    -- GATE Notes Mode
    (NULL, 'GATE Exam Mode', 'gate-exam', 'system',
     'GATE preparation notes. 4-up with larger margins for annotations.',
     4, 2, 2, 'long_edge', 'left', 'horizontal',
     8, 8, 8, 8, 3, 'A4', 0, 0.90,
     TRUE, TRUE, FALSE, TRUE, TRUE, 5),

    -- Booklet Mode
    (NULL, 'Booklet A5', 'booklet-a5', 'system',
     'Creates a foldable A5 booklet from A4 paper. Perfect for handouts.',
     2, 2, 1, 'short_edge', 'left', 'booklet',
     5, 5, 5, 5, 0, 'A4', 0, 1.0,
     FALSE, TRUE, TRUE, TRUE, TRUE, 6),

    -- Exam Notes (8-up dense)
    (NULL, 'Exam Cheat Sheet', 'exam-cheat-sheet', 'system',
     '8 pages per sheet. Maximum compression for quick reference.',
     8, 4, 2, 'long_edge', 'left', 'horizontal',
     2, 2, 2, 2, 1, 'A4', 0, 1.0,
     TRUE, FALSE, FALSE, TRUE, FALSE, 7),

    -- 1-Up with watermark (free tier)
    (NULL, 'Standard 1-Up', '1-up-standard', 'system',
     'One page per sheet, standard printing.',
     1, 1, 1, 'none', 'left', 'horizontal',
     10, 10, 10, 10, 0, 'A4', 0, 1.0,
     FALSE, FALSE, FALSE, TRUE, FALSE, 8);
```

---

# PART 15: COMPLETE SUMMARY

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    IMPOSIFY DATABASE — DESIGN SUMMARY                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SCHEMAS           4 application + 1 config                             │
│  TABLES            16 core tables                                        │
│  ENUM TYPES        22 custom PostgreSQL enums                            │
│  INDEXES           55+ covering, partial, GIN, BRIN indexes              │
│  VIEWS             6 production views                                    │
│  TRIGGERS          8 trigger functions                                   │
│  PROCEDURES        5 stored procedures                                   │
│  FUNCTIONS         6 helper functions                                    │
│  PARTITIONS        Time-based range partitioning on 2 tables             │
│                                                                          │
│  NORMALIZATION     3NF with justified denormalization                    │
│  ARCHIVING         Tiered: Hot → Warm → Cold → Glacier                   │
│  SCALING           Single → Read Replica → Sharded (3 phases)           │
│                                                                          │
│  SECURITY          Row-Level Security, audit triggers,                   │
│                    encrypted MFA secrets, no PII in logs                 │
│                                                                          │
│  COMPLIANCE        7-year audit trail, financial record snapshots,       │
│                    GDPR-ready soft deletes, PCI-adjacent payment         │
│                                                                          │
│  PERFORMANCE       Covering indexes, partial indexes, BRIN for           │
│                    time-series, GIN for JSONB and arrays,                │
│                    materialized views at 100k scale                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```