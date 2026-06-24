Senior Backend Architect & OpenAPI Specialist Documentation
PART 1: API DESIGN STANDARDS
1.1 Core Conventions
text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API DESIGN STANDARDS — IMPOSIFY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE URL:          https://api.imposify.io
CURRENT VERSION:   v1
VERSIONED BASE:    https://api.imposify.io/v1
DOCS URL:          https://api.imposify.io/v1/docs
REDOC URL:         https://api.imposify.io/v1/redoc

VERSIONING STRATEGY:
  ┌─────────────────────────────────────────────────────────┐
  │  URL Path Versioning (primary)                          │
  │  /v1/users  /v2/users                                   │
  │                                                          │
  │  Header Versioning (secondary, for breaking changes)    │
  │  X-API-Version: 2024-01-15                              │
  │                                                          │
  │  Deprecation Policy:                                     │
  │  - Sunset header added 6 months before removal          │
  │  - Deprecation-Notice header on old versions            │
  │  - 12-month backward compatibility window               │
  └─────────────────────────────────────────────────────────┘

PAGINATION:
  Strategy: Cursor-based (default) + Offset (admin)
  
  Request params:
    cursor=<base64_encoded_id>   -- next page cursor
    limit=20                     -- items per page (max: 100)
    page=1                       -- offset mode (admin only)
    per_page=20                  -- offset mode
  
  Response envelope:
    {
      "data": [...],
      "pagination": {
        "total": 1250,
        "limit": 20,
        "has_next": true,
        "has_prev": false,
        "next_cursor": "eyJ1c2VyX2lkIjoiY...",
        "prev_cursor": null,
        "current_page": 1,
        "total_pages": 63
      }
    }

FILTERING:
  ?filter[status]=active
  ?filter[created_at][gte]=2024-01-01
  ?filter[created_at][lte]=2024-12-31
  ?filter[pages_per_sheet]=4
  ?search=notes+pdf

SORTING:
  ?sort=created_at              -- ascending
  ?sort=-created_at             -- descending (prefix -)
  ?sort=-created_at,+name       -- multi-field

STANDARD HTTP STATUS CODES:
  200 OK                   -- Success with body
  201 Created              -- Resource created
  202 Accepted             -- Async job submitted
  204 No Content           -- Success without body
  206 Partial Content      -- File streaming/range
  400 Bad Request          -- Validation error
  401 Unauthorized         -- Missing/invalid token
  403 Forbidden            -- Valid token, no permission
  404 Not Found            -- Resource not found
  409 Conflict             -- Duplicate resource
  413 Payload Too Large    -- File too big
  422 Unprocessable Entity -- Business logic error
  429 Too Many Requests    -- Rate limit exceeded
  500 Internal Server Error
  503 Service Unavailable  -- Maintenance/overload
1.2 Standard Error Response Format
JSON

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address."
      }
    ],
    "request_id": "req_01HX7K2M3N4P5Q6R7S8T9",
    "timestamp": "2024-07-15T10:30:00Z",
    "documentation_url": "https://docs.imposify.io/errors/VALIDATION_ERROR"
  }
}
1.3 Standard Success Response Format
JSON

{
  "data": { },
  "meta": {
    "request_id": "req_01HX7K2M3N4P5Q6R7S8T9",
    "version": "1.0.0",
    "timestamp": "2024-07-15T10:30:00Z"
  }
}
PART 2: OPENAPI 3.1 SPECIFICATION
YAML

openapi: 3.1.0

info:
  title: Imposify API
  version: 1.0.0
  description: |
    # Imposify — PDF Imposition & Print Optimization API
    
    Enterprise-grade API for PDF layout imposition, print optimization,
    and document management.
    
    ## Authentication
    
    All endpoints (except public auth endpoints) require a valid JWT
    Bearer token in the Authorization header.
    
    ```
    Authorization: Bearer <access_token>
    ```
    
    ### Token Lifecycle
    - Access Token: 15 minutes expiry
    - Refresh Token: 7 days expiry (30 days with remember_me)
    - Tokens are RS256 signed
    
    ## Rate Limiting
    
    Rate limit information is returned in response headers:
    
    ```
    X-RateLimit-Limit: 100
    X-RateLimit-Remaining: 95
    X-RateLimit-Reset: 1720000000
    X-RateLimit-Window: 60
    ```
    
    ## Versioning
    
    Current stable version: `v1`
    
    Breaking changes are introduced in new versions with 12-month
    backward compatibility.
    
  contact:
    name: Imposify API Support
    email: api-support@imposify.io
    url: https://docs.imposify.io
  
  license:
    name: Proprietary
    url: https://imposify.io/terms

servers:
  - url: https://api.imposify.io/v1
    description: Production
  - url: https://staging-api.imposify.io/v1
    description: Staging
  - url: http://localhost:8000/v1
    description: Local Development

tags:
  - name: Authentication
    description: JWT auth, OAuth, token management
  - name: Users
    description: User profile and account management
  - name: PDF Upload
    description: File upload and management
  - name: PDF Preview
    description: Thumbnail and preview generation
  - name: PDF Processing
    description: Imposition job submission and tracking
  - name: Layout Presets
    description: Preset CRUD and management
  - name: Generated PDFs
    description: Output file management and downloads
  - name: Analytics
    description: Usage statistics and event tracking
  - name: Admin
    description: Administrative operations (admin only)
  - name: Webhooks
    description: Webhook registration and management

# ============================================================
# SECURITY SCHEMES
# ============================================================

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: RS256 signed JWT access token (15 min expiry)
    
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: Long-lived API key for server-to-server (Pro+ plans)
    
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://api.imposify.io/v1/auth/oauth/authorize
          tokenUrl: https://api.imposify.io/v1/auth/oauth/token
          refreshUrl: https://api.imposify.io/v1/auth/token/refresh
          scopes:
            read:profile: Read user profile
            write:profile: Update user profile
            read:pdfs: Read uploaded PDFs
            write:pdfs: Upload and manage PDFs
            read:analytics: Read analytics data
            admin: Full admin access

# ============================================================
# REUSABLE COMPONENTS
# ============================================================

  parameters:
    # Path parameters
    UserId:
      name: user_id
      in: path
      required: true
      schema:
        type: string
        format: uuid
      example: "550e8400-e29b-41d4-a716-446655440000"
    
    UploadId:
      name: upload_id
      in: path
      required: true
      schema:
        type: string
        format: uuid
    
    JobId:
      name: job_id
      in: path
      required: true
      schema:
        type: string
        format: uuid
    
    PresetId:
      name: preset_id
      in: path
      required: true
      schema:
        type: string
        format: uuid
    
    GeneratedPdfId:
      name: generated_pdf_id
      in: path
      required: true
      schema:
        type: string
        format: uuid
    
    # Query parameters
    Limit:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: Number of items per page
    
    Cursor:
      name: cursor
      in: query
      schema:
        type: string
      description: Base64-encoded pagination cursor
    
    Sort:
      name: sort
      in: query
      schema:
        type: string
      example: "-created_at"
      description: |
        Sort field. Prefix with `-` for descending order.
        Supports multi-field: `-created_at,+name`
    
    Search:
      name: search
      in: query
      schema:
        type: string
        maxLength: 200
      description: Full-text search query

  # ============================================================
  # REUSABLE SCHEMAS
  # ============================================================

  schemas:
    # ── Meta & Pagination ──────────────────────────────────────
    
    ResponseMeta:
      type: object
      properties:
        request_id:
          type: string
          example: "req_01HX7K2M3N4P5Q6R7S8T9"
        version:
          type: string
          example: "1.0.0"
        timestamp:
          type: string
          format: date-time
    
    Pagination:
      type: object
      properties:
        total:
          type: integer
          example: 1250
        limit:
          type: integer
          example: 20
        has_next:
          type: boolean
        has_prev:
          type: boolean
        next_cursor:
          type: string
          nullable: true
        prev_cursor:
          type: string
          nullable: true
        current_page:
          type: integer
        total_pages:
          type: integer
    
    ErrorDetail:
      type: object
      properties:
        field:
          type: string
          example: "email"
        code:
          type: string
          example: "INVALID_FORMAT"
        message:
          type: string
          example: "Must be a valid email address"
    
    ErrorResponse:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message, request_id, timestamp]
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
              example: "The request contains invalid data"
            details:
              type: array
              items:
                $ref: '#/components/schemas/ErrorDetail'
            request_id:
              type: string
            timestamp:
              type: string
              format: date-time
            documentation_url:
              type: string
              format: uri

    # ── Auth Schemas ───────────────────────────────────────────

    RegisterRequest:
      type: object
      required: [email, username, password]
      properties:
        email:
          type: string
          format: email
          maxLength: 320
          example: "student@makaut.edu.in"
        username:
          type: string
          minLength: 3
          maxLength: 50
          pattern: '^[a-zA-Z0-9_-]+$'
          example: "raju_sharma"
        password:
          type: string
          format: password
          minLength: 8
          maxLength: 128
          description: |
            Must contain: 1 uppercase, 1 lowercase,
            1 number, 1 special character
        full_name:
          type: string
          maxLength: 255
          example: "Raju Sharma"
        country_code:
          type: string
          pattern: '^[A-Z]{2}$'
          example: "IN"
        referral_source:
          type: string
          maxLength: 100
        accept_terms:
          type: boolean
          description: Must be true
    
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
        remember_me:
          type: boolean
          default: false
          description: Extends refresh token to 30 days
        mfa_code:
          type: string
          minLength: 6
          maxLength: 6
          pattern: '^\d{6}$'
          description: TOTP code if MFA enabled
    
    TokenResponse:
      type: object
      properties:
        access_token:
          type: string
          description: JWT access token (15 min expiry)
        refresh_token:
          type: string
          description: Refresh token (7 or 30 days)
        token_type:
          type: string
          example: "Bearer"
        expires_in:
          type: integer
          example: 900
          description: Access token TTL in seconds
        refresh_expires_in:
          type: integer
          example: 604800
        scope:
          type: string
          example: "read:profile write:pdfs"
    
    RefreshTokenRequest:
      type: object
      required: [refresh_token]
      properties:
        refresh_token:
          type: string
    
    ForgotPasswordRequest:
      type: object
      required: [email]
      properties:
        email:
          type: string
          format: email
    
    ResetPasswordRequest:
      type: object
      required: [token, new_password]
      properties:
        token:
          type: string
          description: Reset token from email
        new_password:
          type: string
          format: password
          minLength: 8
    
    ChangePasswordRequest:
      type: object
      required: [current_password, new_password]
      properties:
        current_password:
          type: string
          format: password
        new_password:
          type: string
          format: password
          minLength: 8
    
    MFASetupResponse:
      type: object
      properties:
        secret:
          type: string
          description: Base32 TOTP secret
        qr_code_url:
          type: string
          format: uri
          description: QR code data URL for authenticator app
        backup_codes:
          type: array
          items:
            type: string
          description: One-time recovery codes
    
    MFAVerifyRequest:
      type: object
      required: [code]
      properties:
        code:
          type: string
          minLength: 6
          maxLength: 6
          pattern: '^\d{6}$'

    # ── User Schemas ───────────────────────────────────────────
    
    UserProfile:
      type: object
      properties:
        user_id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        username:
          type: string
        full_name:
          type: string
          nullable: true
        avatar_url:
          type: string
          format: uri
          nullable: true
        phone_number:
          type: string
          nullable: true
        country_code:
          type: string
          nullable: true
        timezone:
          type: string
          example: "Asia/Kolkata"
        locale:
          type: string
          example: "en-IN"
        email_verified:
          type: boolean
        mfa_enabled:
          type: boolean
        status:
          type: string
          enum: [active, inactive, suspended, pending_verification]
        role:
          type: object
          properties:
            role_name:
              type: string
            role_slug:
              type: string
        subscription:
          $ref: '#/components/schemas/SubscriptionSummary'
        created_at:
          type: string
          format: date-time
    
    UpdateProfileRequest:
      type: object
      properties:
        full_name:
          type: string
          maxLength: 255
        phone_number:
          type: string
          maxLength: 20
        timezone:
          type: string
        locale:
          type: string
        country_code:
          type: string
          pattern: '^[A-Z]{2}$'
    
    UserDashboardStats:
      type: object
      properties:
        total_uploads:
          type: integer
        total_generated_pdfs:
          type: integer
        total_pages_processed:
          type: integer
        total_paper_saved:
          type: integer
          description: Sheets of paper saved
        total_cost_saved:
          type: number
          format: float
          description: Estimated cost saved in USD
        avg_size_reduction:
          type: number
          format: float
          description: Average file size reduction percentage
        favourite_preset:
          type: string
          nullable: true
        storage_used_mb:
          type: number
          format: float
        period_days:
          type: integer
          example: 30

    # ── PDF Schemas ────────────────────────────────────────────
    
    UploadInitiateRequest:
      type: object
      required: [filename, file_size, mime_type]
      properties:
        filename:
          type: string
          maxLength: 500
          example: "GATE-CSE-2024-Notes.pdf"
        file_size:
          type: integer
          format: int64
          description: File size in bytes
          example: 5242880
        mime_type:
          type: string
          enum: [application/pdf]
        checksum_sha256:
          type: string
          pattern: '^[a-f0-9]{64}$'
          description: Client-side computed SHA256 hash
    
    UploadInitiateResponse:
      type: object
      properties:
        upload_id:
          type: string
          format: uuid
        upload_url:
          type: string
          format: uri
          description: Pre-signed S3 URL for direct upload
        upload_headers:
          type: object
          additionalProperties:
            type: string
          description: Headers to include in the PUT request to upload_url
        expires_at:
          type: string
          format: date-time
          description: Pre-signed URL expiry
        chunk_size:
          type: integer
          description: Recommended chunk size for multipart upload
    
    PdfUpload:
      type: object
      properties:
        upload_id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        original_filename:
          type: string
        file_size_bytes:
          type: integer
          format: int64
        file_size_mb:
          type: number
          format: float
        upload_status:
          type: string
          enum: [pending, uploading, processing, completed, failed, quarantined]
        virus_scan_status:
          type: string
          enum: [pending, scanning, clean, infected, skipped, error]
        storage_provider:
          type: string
          enum: [local, s3, gcs, azure_blob]
        metadata:
          $ref: '#/components/schemas/PdfMetadata'
        created_at:
          type: string
          format: date-time
        expires_at:
          type: string
          format: date-time
          nullable: true
    
    PdfMetadata:
      type: object
      properties:
        title:
          type: string
          nullable: true
        author:
          type: string
          nullable: true
        total_pages:
          type: integer
        page_width_mm:
          type: number
          format: float
        page_height_mm:
          type: number
          format: float
        page_orientation:
          type: string
          enum: [portrait, landscape, mixed]
        detected_paper_size:
          type: string
          enum: [A3, A4, A5, B4, B5, Letter, Legal, Custom]
        color_space:
          type: string
          enum: [rgb, cmyk, grayscale, mixed, unknown]
        is_encrypted:
          type: boolean
        has_forms:
          type: boolean
        language_detected:
          type: string
          nullable: true
        estimated_print_pages:
          type: integer
        pdf_version:
          type: string
          example: "1.7"
    
    # ── Preset Schemas ─────────────────────────────────────────
    
    LayoutPreset:
      type: object
      properties:
        preset_id:
          type: string
          format: uuid
        preset_name:
          type: string
        preset_slug:
          type: string
        preset_type:
          type: string
          enum: [system, user_custom, organization, shared]
        description:
          type: string
          nullable: true
        pages_per_sheet:
          type: integer
          enum: [1, 2, 4, 6, 8, 9, 16]
        layout_columns:
          type: integer
        layout_rows:
          type: integer
        duplex_mode:
          type: string
          enum: [none, long_edge, short_edge]
        binding_edge:
          type: string
          enum: [left, right, top, bottom]
        page_order:
          type: string
          enum: [horizontal, horizontal_rtl, vertical, booklet, booklet_rtl, custom]
        margins:
          type: object
          properties:
            top_mm:
              type: number
            bottom_mm:
              type: number
            left_mm:
              type: number
            right_mm:
              type: number
            gutter_mm:
              type: number
        paper_size:
          type: string
          enum: [A3, A4, A5, B4, B5, Letter, Legal, Tabloid, Custom]
        show_border:
          type: boolean
        show_page_numbers:
          type: boolean
        is_booklet_mode:
          type: boolean
        watermark:
          type: object
          nullable: true
          properties:
            text:
              type: string
            opacity:
              type: number
            angle:
              type: integer
        usage_count:
          type: integer
        is_featured:
          type: boolean
        created_at:
          type: string
          format: date-time
    
    CreatePresetRequest:
      type: object
      required: [preset_name, pages_per_sheet, layout_columns, layout_rows]
      properties:
        preset_name:
          type: string
          minLength: 3
          maxLength: 200
        description:
          type: string
          maxLength: 1000
        pages_per_sheet:
          type: integer
          enum: [1, 2, 4, 6, 8, 9, 16]
        layout_columns:
          type: integer
          minimum: 1
          maximum: 8
        layout_rows:
          type: integer
          minimum: 1
          maximum: 8
        duplex_mode:
          type: string
          enum: [none, long_edge, short_edge]
          default: none
        binding_edge:
          type: string
          enum: [left, right, top, bottom]
          default: left
        page_order:
          type: string
          enum: [horizontal, horizontal_rtl, vertical, booklet, booklet_rtl, custom]
          default: horizontal
        margin_top_mm:
          type: number
          minimum: 0
          maximum: 50
          default: 5
        margin_bottom_mm:
          type: number
          minimum: 0
          maximum: 50
          default: 5
        margin_left_mm:
          type: number
          minimum: 0
          maximum: 50
          default: 5
        margin_right_mm:
          type: number
          minimum: 0
          maximum: 50
          default: 5
        gutter_mm:
          type: number
          minimum: 0
          maximum: 20
          default: 2
        rotation_degrees:
          type: integer
          enum: [0, 90, 180, 270]
          default: 0
        scale_factor:
          type: number
          minimum: 0.1
          maximum: 2.0
          default: 1.0
        paper_size:
          type: string
          enum: [A3, A4, A5, B4, B5, Letter, Legal, Tabloid, Custom]
          default: A4
        custom_width_mm:
          type: number
          nullable: true
        custom_height_mm:
          type: number
          nullable: true
        show_border:
          type: boolean
          default: false
        show_page_numbers:
          type: boolean
          default: false
        page_number_position:
          type: string
          enum: [top_left, top_center, top_right, bottom_left, bottom_center, bottom_right]
        watermark_text:
          type: string
          maxLength: 200
          nullable: true
        watermark_opacity:
          type: number
          minimum: 0
          maximum: 1
          default: 0.1
        is_booklet_mode:
          type: boolean
          default: false
        front_page_arrangement:
          type: array
          nullable: true
          items:
            type: object
            properties:
              slot:
                type: integer
              page_number:
                type: integer
              rotation:
                type: integer

    # ── Job Schemas ────────────────────────────────────────────
    
    SubmitJobRequest:
      type: object
      required: [upload_id]
      properties:
        upload_id:
          type: string
          format: uuid
        preset_id:
          type: string
          format: uuid
          nullable: true
          description: If null, uses inline_config
        inline_config:
          $ref: '#/components/schemas/CreatePresetRequest'
          description: Ad-hoc config without saving preset
        priority:
          type: integer
          minimum: 1
          maximum: 10
          default: 5
        output_filename:
          type: string
          maxLength: 500
        page_range:
          type: object
          nullable: true
          properties:
            from:
              type: integer
              minimum: 1
            to:
              type: integer
        notify_on_complete:
          type: boolean
          default: false
    
    ProcessingJob:
      type: object
      properties:
        job_id:
          type: string
          format: uuid
        upload_id:
          type: string
          format: uuid
        preset_id:
          type: string
          format: uuid
          nullable: true
        job_type:
          type: string
          enum: [imposition, compression, merge, split, rotate, watermark]
        job_status:
          type: string
          enum: [queued, running, completed, failed, cancelled, retrying, timeout]
        priority:
          type: integer
        progress_percentage:
          type: number
          format: float
        progress_message:
          type: string
          nullable: true
        attempt_number:
          type: integer
        queue_position:
          type: integer
          nullable: true
          description: Position in queue (if status=queued)
        estimated_completion:
          type: string
          format: date-time
          nullable: true
        generated_pdf_id:
          type: string
          format: uuid
          nullable: true
        error_code:
          type: string
          nullable: true
        error_message:
          type: string
          nullable: true
        processing_duration_ms:
          type: integer
          nullable: true
        created_at:
          type: string
          format: date-time
        started_at:
          type: string
          format: date-time
          nullable: true
        completed_at:
          type: string
          format: date-time
          nullable: true
    
    # ── Generated PDF Schemas ──────────────────────────────────
    
    GeneratedPdf:
      type: object
      properties:
        generated_pdf_id:
          type: string
          format: uuid
        upload_id:
          type: string
          format: uuid
        preset_id:
          type: string
          format: uuid
          nullable: true
        output_filename:
          type: string
        file_size_bytes:
          type: integer
          format: int64
        file_size_mb:
          type: number
          format: float
        total_pages_original:
          type: integer
        total_pages_output:
          type: integer
        pages_per_sheet:
          type: integer
        size_reduction_percent:
          type: number
          format: float
        estimated_paper_saved:
          type: integer
        estimated_cost_saved:
          type: number
          format: float
        download_count:
          type: integer
        download_url:
          type: string
          format: uri
          description: Pre-signed URL for download
        download_url_expires_at:
          type: string
          format: date-time
        expires_at:
          type: string
          format: date-time
          nullable: true
        created_at:
          type: string
          format: date-time
    
    # ── Analytics Schemas ──────────────────────────────────────
    
    AnalyticsEventRequest:
      type: object
      required: [event_type, event_category]
      properties:
        event_type:
          type: string
          maxLength: 100
        event_category:
          type: string
          enum: [upload, process, download, auth, subscription, ui, api, error]
        event_action:
          type: string
        event_label:
          type: string
        event_value:
          type: number
        upload_id:
          type: string
          format: uuid
          nullable: true
        job_id:
          type: string
          format: uuid
          nullable: true
        preset_id:
          type: string
          format: uuid
          nullable: true
        page_url:
          type: string
          format: uri
        properties:
          type: object
          additionalProperties: true
    
    UsageReport:
      type: object
      properties:
        period:
          type: object
          properties:
            from:
              type: string
              format: date
            to:
              type: string
              format: date
            days:
              type: integer
        uploads:
          type: object
          properties:
            total:
              type: integer
            by_day:
              type: array
              items:
                type: object
                properties:
                  date:
                    type: string
                    format: date
                  count:
                    type: integer
        processing:
          type: object
          properties:
            total_jobs:
              type: integer
            completed:
              type: integer
            failed:
              type: integer
            avg_duration_ms:
              type: integer
        savings:
          type: object
          properties:
            total_pages_saved:
              type: integer
            total_paper_sheets_saved:
              type: integer
            estimated_cost_saved_usd:
              type: number
            carbon_saved_grams:
              type: number
        popular_presets:
          type: array
          items:
            type: object
            properties:
              preset_name:
                type: string
              usage_count:
                type: integer
    
    # ── Subscription Schemas ───────────────────────────────────
    
    SubscriptionSummary:
      type: object
      properties:
        plan_name:
          type: string
        plan_tier:
          type: string
          enum: [free, student, pro, team, enterprise]
        status:
          type: string
        current_period_end:
          type: string
          format: date
        uploads_used:
          type: integer
        uploads_limit:
          type: integer
        storage_used_mb:
          type: number
        storage_limit_gb:
          type: number
    
    # ── Admin Schemas ──────────────────────────────────────────
    
    AdminUserUpdate:
      type: object
      properties:
        status:
          type: string
          enum: [active, inactive, suspended]
        role_slug:
          type: string
        email_verified:
          type: boolean
        reason:
          type: string
          description: Reason for status change (required for suspend)
    
    SystemHealthResponse:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        checks:
          type: object
          properties:
            database:
              type: object
              properties:
                status:
                  type: string
                latency_ms:
                  type: integer
            redis:
              type: object
              properties:
                status:
                  type: string
                latency_ms:
                  type: integer
            storage:
              type: object
              properties:
                status:
                  type: string
                available_gb:
                  type: number
            job_queue:
              type: object
              properties:
                status:
                  type: string
                queued_jobs:
                  type: integer
                running_jobs:
                  type: integer
        uptime_seconds:
          type: integer
        version:
          type: string

# ============================================================
# PATHS — ALL 50+ ENDPOINTS
# ============================================================

paths:

  # ────────────────────────────────────────────────────────────
  # MODULE 1: AUTHENTICATION (8 endpoints)
  # ────────────────────────────────────────────────────────────

  /auth/register:
    post:
      tags: [Authentication]
      operationId: registerUser
      summary: Register a new user account
      description: |
        Creates a new user account and sends a verification email.
        Automatically creates a free subscription with 14-day trial.
        
        **Rate Limit:** 5 requests per IP per hour
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
            example:
              email: "raju.sharma@makaut.edu.in"
              username: "raju_sharma"
              password: "SecurePass@123"
              full_name: "Raju Sharma"
              country_code: "IN"
              accept_terms: true
      responses:
        '201':
          description: Account created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      user_id:
                        type: string
                        format: uuid
                      email:
                        type: string
                      username:
                        type: string
                      message:
                        type: string
                        example: "Verification email sent"
                  meta:
                    $ref: '#/components/schemas/ResponseMeta'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: "VALIDATION_ERROR"
                  message: "Password must contain uppercase, lowercase, number and special character"
        '409':
          description: Email or username already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: "EMAIL_ALREADY_EXISTS"
                  message: "An account with this email already exists"
        '429':
          description: Rate limit exceeded
          headers:
            Retry-After:
              schema:
                type: integer
              description: Seconds until rate limit resets

  /auth/login:
    post:
      tags: [Authentication]
      operationId: loginUser
      summary: Authenticate user and obtain JWT tokens
      description: |
        Validates credentials and returns access + refresh tokens.
        
        **Security:** After 5 failed attempts, account is locked for 15 minutes.
        **Rate Limit:** 10 requests per IP per minute
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
            examples:
              standard_login:
                summary: Standard login
                value:
                  email: "raju.sharma@makaut.edu.in"
                  password: "SecurePass@123"
                  remember_me: false
              login_with_mfa:
                summary: Login with MFA code
                value:
                  email: "raju.sharma@makaut.edu.in"
                  password: "SecurePass@123"
                  mfa_code: "123456"
      responses:
        '200':
          description: Login successful
          headers:
            Set-Cookie:
              description: HttpOnly refresh token cookie (alternative to body)
              schema:
                type: string
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/TokenResponse'
                  meta:
                    $ref: '#/components/schemas/ResponseMeta'
              example:
                data:
                  access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                  refresh_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                  token_type: "Bearer"
                  expires_in: 900
                  refresh_expires_in: 604800
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: "INVALID_CREDENTIALS"
                  message: "Email or password is incorrect"
        '423':
          description: Account locked
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: "ACCOUNT_LOCKED"
                  message: "Account locked due to failed attempts. Try again in 15 minutes"

  /auth/token/refresh:
    post:
      tags: [Authentication]
      operationId: refreshToken
      summary: Obtain a new access token using refresh token
      description: |
        Implements token rotation. The old refresh token is invalidated
        and a new pair is issued.
        
        **Rate Limit:** 20 requests per token per hour
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RefreshTokenRequest'
      responses:
        '200':
          description: New tokens issued
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/TokenResponse'
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/logout:
    post:
      tags: [Authentication]
      operationId: logoutUser
      summary: Revoke current session tokens
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                refresh_token:
                  type: string
                logout_all_devices:
                  type: boolean
                  default: false
                  description: Revoke all active sessions
      responses:
        '204':
          description: Logged out successfully

  /auth/forgot-password:
    post:
      tags: [Authentication]
      operationId: forgotPassword
      summary: Request password reset email
      description: |
        Always returns 200 to prevent email enumeration.
        **Rate Limit:** 3 requests per email per hour
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ForgotPasswordRequest'
      responses:
        '200':
          description: Reset email sent (if account exists)
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      message:
                        type: string
                        example: "If an account exists, a reset email has been sent"

  /auth/reset-password:
    post:
      tags: [Authentication]
      operationId: resetPassword
      summary: Reset password using token from email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ResetPasswordRequest'
      responses:
        '200':
          description: Password reset successful
        '400':
          description: Invalid or expired token

  /auth/verify-email/{token}:
    get:
      tags: [Authentication]
      operationId: verifyEmail
      summary: Verify email address using token from email
      parameters:
        - name: token
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Email verified successfully
        '400':
          description: Invalid or expired verification token
        '409':
          description: Email already verified

  /auth/mfa/setup:
    post:
      tags: [Authentication]
      operationId: setupMFA
      summary: Initialize MFA setup — returns TOTP secret and QR code
      security:
        - BearerAuth: []
      responses:
        '200':
          description: MFA setup initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/MFASetupResponse'

  /auth/mfa/verify:
    post:
      tags: [Authentication]
      operationId: verifyMFA
      summary: Verify TOTP code to complete MFA activation
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MFAVerifyRequest'
      responses:
        '200':
          description: MFA enabled successfully
        '400':
          description: Invalid TOTP code

  /auth/mfa/disable:
    delete:
      tags: [Authentication]
      operationId: disableMFA
      summary: Disable MFA for current user
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [password, mfa_code]
              properties:
                password:
                  type: string
                mfa_code:
                  type: string
      responses:
        '204':
          description: MFA disabled

  /auth/sessions:
    get:
      tags: [Authentication]
      operationId: listActiveSessions
      summary: List all active sessions for current user
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Active sessions list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        session_id:
                          type: string
                          format: uuid
                        ip_address:
                          type: string
                        device_type:
                          type: string
                        browser_name:
                          type: string
                        last_activity_at:
                          type: string
                          format: date-time
                        is_current:
                          type: boolean

  # ────────────────────────────────────────────────────────────
  # MODULE 2: USERS (6 endpoints)
  # ────────────────────────────────────────────────────────────

  /users/me:
    get:
      tags: [Users]
      operationId: getMyProfile
      summary: Get authenticated user's profile
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/UserProfile'
                  meta:
                    $ref: '#/components/schemas/ResponseMeta'
    
    patch:
      tags: [Users]
      operationId: updateMyProfile
      summary: Update authenticated user's profile
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateProfileRequest'
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/UserProfile'
    
    delete:
      tags: [Users]
      operationId: deleteMyAccount
      summary: Request account deletion (GDPR compliant)
      description: |
        Schedules account for deletion in 30 days.
        User can cancel within this window.
        All data will be permanently erased after 30 days.
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [password, confirmation]
              properties:
                password:
                  type: string
                confirmation:
                  type: string
                  enum: ["DELETE MY ACCOUNT"]
                reason:
                  type: string
      responses:
        '200':
          description: Account deletion scheduled

  /users/me/avatar:
    post:
      tags: [Users]
      operationId: uploadAvatar
      summary: Upload user avatar image
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                avatar:
                  type: string
                  format: binary
                  description: Image file (JPEG, PNG, WebP) max 5MB
      responses:
        '200':
          description: Avatar uploaded
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      avatar_url:
                        type: string
                        format: uri

  /users/me/password:
    put:
      tags: [Users]
      operationId: changePassword
      summary: Change account password
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChangePasswordRequest'
      responses:
        '200':
          description: Password changed. All other sessions invalidated.
        '401':
          description: Current password incorrect

  /users/me/dashboard:
    get:
      tags: [Users]
      operationId: getUserDashboard
      summary: Get user dashboard statistics
      security:
        - BearerAuth: []
      parameters:
        - name: period_days
          in: query
          schema:
            type: integer
            enum: [7, 30, 90, 365]
            default: 30
          description: Statistics time window
      responses:
        '200':
          description: Dashboard statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/UserDashboardStats'

  /users/me/notifications/preferences:
    get:
      tags: [Users]
      operationId: getNotificationPreferences
      summary: Get notification preferences
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Notification preferences
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      email_on_job_complete:
                        type: boolean
                      email_on_job_failure:
                        type: boolean
                      email_marketing:
                        type: boolean
                      email_product_updates:
                        type: boolean
    
    put:
      tags: [Users]
      operationId: updateNotificationPreferences
      summary: Update notification preferences
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email_on_job_complete:
                  type: boolean
                email_on_job_failure:
                  type: boolean
                email_marketing:
                  type: boolean
                email_product_updates:
                  type: boolean
      responses:
        '200':
          description: Preferences updated

  # ────────────────────────────────────────────────────────────
  # MODULE 3: PDF UPLOAD (7 endpoints)
  # ────────────────────────────────────────────────────────────

  /uploads:
    post:
      tags: [PDF Upload]
      operationId: initiateUpload
      summary: Initiate a new PDF upload (Step 1 of 2-step upload)
      description: |
        **Two-Step Upload Flow:**
        
        1. POST /uploads → Get pre-signed URL + upload_id
        2. PUT <presigned_url> → Upload file directly to S3
        3. POST /uploads/{upload_id}/complete → Confirm upload
        
        **Deduplication:** If SHA256 hash matches an existing file
        owned by the same user, returns the existing upload without
        storing a duplicate.
        
        **Rate Limit:** Per plan limits apply
        **Permissions:** Authenticated users
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UploadInitiateRequest'
            example:
              filename: "GATE-CSE-2024-Notes.pdf"
              file_size: 5242880
              mime_type: "application/pdf"
              checksum_sha256: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
      responses:
        '200':
          description: Duplicate detected — returns existing upload
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/PdfUpload'
                  meta:
                    type: object
                    properties:
                      is_duplicate:
                        type: boolean
                        example: true
        '201':
          description: Upload initiated — proceed to upload file
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/UploadInitiateResponse'
        '402':
          description: Plan limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: "QUOTA_UPLOAD_LIMIT"
                  message: "Monthly upload limit of 5 reached. Upgrade to continue."
        '413':
          description: File too large for current plan
    
    get:
      tags: [PDF Upload]
      operationId: listUploads
      summary: List user's uploaded PDFs
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Sort'
        - $ref: '#/components/parameters/Search'
        - name: filter[status]
          in: query
          schema:
            type: string
            enum: [pending, uploading, processing, completed, failed, quarantined]
        - name: filter[created_at][gte]
          in: query
          schema:
            type: string
            format: date
        - name: filter[created_at][lte]
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Paginated list of uploads
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/PdfUpload'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                  meta:
                    $ref: '#/components/schemas/ResponseMeta'

  /uploads/{upload_id}:
    get:
      tags: [PDF Upload]
      operationId: getUpload
      summary: Get details of a specific upload
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
      responses:
        '200':
          description: Upload details
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/PdfUpload'
        '404':
          description: Upload not found
    
    delete:
      tags: [PDF Upload]
      operationId: deleteUpload
      summary: Delete an upload and all associated files
      description: |
        Soft-deletes the upload record. Physical file deletion is
        handled asynchronously by a background job.
        Any associated generated PDFs are also marked for deletion.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
      responses:
        '204':
          description: Upload deleted
        '409':
          description: Upload has a running processing job

  /uploads/{upload_id}/complete:
    post:
      tags: [PDF Upload]
      operationId: completeUpload
      summary: Confirm file upload completion (Step 2 of upload flow)
      description: |
        Call this after successfully uploading the file to the pre-signed URL.
        Triggers virus scan and metadata extraction asynchronously.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                etag:
                  type: string
                  description: ETag returned by S3 after upload (for verification)
                checksum_sha256:
                  type: string
                  pattern: '^[a-f0-9]{64}$'
      responses:
        '200':
          description: Upload confirmed and processing started
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/PdfUpload'

  /uploads/direct:
    post:
      tags: [PDF Upload]
      operationId: directUpload
      summary: Direct multipart file upload (for small files < 10MB)
      description: |
        Single-step upload for small files. Not recommended for large files.
        Use the two-step presigned URL flow for better reliability.
        
        **Rate Limit:** 10 requests per minute per user
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file]
              properties:
                file:
                  type: string
                  format: binary
                output_filename:
                  type: string
      responses:
        '201':
          description: File uploaded
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/PdfUpload'

  /uploads/{upload_id}/metadata:
    get:
      tags: [PDF Upload]
      operationId: getUploadMetadata
      summary: Get extracted PDF metadata for an upload
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
      responses:
        '200':
          description: PDF metadata
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/PdfMetadata'
        '404':
          description: Metadata not yet extracted or upload not found

  # ────────────────────────────────────────────────────────────
  # MODULE 4: PDF PREVIEW (3 endpoints)
  # ────────────────────────────────────────────────────────────

  /uploads/{upload_id}/preview:
    get:
      tags: [PDF Preview]
      operationId: getUploadPreview
      summary: Get thumbnail previews for PDF pages
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
        - name: pages
          in: query
          schema:
            type: string
          example: "1,2,3"
          description: Comma-separated page numbers (default: 1-5)
        - name: width
          in: query
          schema:
            type: integer
            minimum: 50
            maximum: 1000
            default: 300
          description: Thumbnail width in pixels
        - name: format
          in: query
          schema:
            type: string
            enum: [jpeg, png, webp]
            default: jpeg
      responses:
        '200':
          description: Page thumbnails
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      upload_id:
                        type: string
                        format: uuid
                      total_pages:
                        type: integer
                      thumbnails:
                        type: array
                        items:
                          type: object
                          properties:
                            page_number:
                              type: integer
                            url:
                              type: string
                              format: uri
                            width:
                              type: integer
                            height:
                              type: integer
                            expires_at:
                              type: string
                              format: date-time
        '202':
          description: Thumbnails being generated — poll again shortly
        '404':
          description: Upload not found

  /uploads/{upload_id}/preview/layout:
    post:
      tags: [PDF Preview]
      operationId: previewImposedLayout
      summary: Generate a preview of how the imposed layout will look
      description: |
        Returns a preview image/PDF of the first imposed sheet
        without actually processing the entire document.
        
        Useful for the user to verify layout before submitting full job.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                preset_id:
                  type: string
                  format: uuid
                  nullable: true
                inline_config:
                  $ref: '#/components/schemas/CreatePresetRequest'
                preview_pages:
                  type: integer
                  minimum: 1
                  maximum: 4
                  default: 1
                  description: How many output sheets to preview
                output_format:
                  type: string
                  enum: [jpeg, png, pdf]
                  default: jpeg
      responses:
        '200':
          description: Layout preview generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      preview_url:
                        type: string
                        format: uri
                      expires_at:
                        type: string
                        format: date-time
                      sheet_count:
                        type: integer
                      output_page_count:
                        type: integer

  /uploads/{upload_id}/print-cost-estimate:
    post:
      tags: [PDF Preview]
      operationId: estimatePrintCost
      summary: Estimate printing cost and paper savings for a layout
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UploadId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                preset_id:
                  type: string
                  format: uuid
                  nullable: true
                pages_per_sheet:
                  type: integer
                  enum: [1, 2, 4, 6, 8, 9, 16]
                cost_per_page_usd:
                  type: number
                  default: 0.05
                  description: Local printing cost per page
                duplex:
                  type: boolean
                  default: true
      responses:
        '200':
          description: Print cost estimate
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      original_pages:
                        type: integer
                      output_sheets:
                        type: integer
                      pages_per_sheet:
                        type: integer
                      duplex:
                        type: boolean
                      original_cost_usd:
                        type: number
                      imposed_cost_usd:
                        type: number
                      cost_savings_usd:
                        type: number
                      cost_savings_percent:
                        type: number
                      paper_sheets_saved:
                        type: integer
                      carbon_saved_grams:
                        type: number

  # ────────────────────────────────────────────────────────────
  # MODULE 5: PDF PROCESSING (7 endpoints)
  # ────────────────────────────────────────────────────────────

  /jobs/track:
    post:
      tags: [PDF Processing]
      operationId: trackImpositionJob
      summary: Track a client-side PDF imposition job
      description: |
        Records an imposition job that was processed client-side (in the browser).
        Returns 201 Created with the tracking job_id.
        
        **Processing Flow:**
        1. Browser processes PDF locally using pdf-lib
        2. Client sends metadata to this endpoint to record the job
        3. Server logs the job for analytics and usage tracking
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SubmitJobRequest'
            example:
              upload_id: "550e8400-e29b-41d4-a716-446655440000"
              preset_id: "660e8400-e29b-41d4-a716-446655440001"
              priority: 5
              notify_on_complete: true
      responses:
        '201':
          description: Job tracked successfully
          headers:
            Location:
              description: URL to poll job status
              schema:
                type: string
                example: "/v1/jobs/770e8400-e29b-41d4-a716-446655440002"
            X-Job-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/ProcessingJob'
                  meta:
                    $ref: '#/components/schemas/ResponseMeta'
        '402':
          description: Subscription limit reached
        '422':
          description: Upload not ready or preset invalid
    
    get:
      tags: [PDF Processing]
      operationId: listJobs
      summary: List user's processing jobs
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Sort'
        - name: filter[status]
          in: query
          schema:
            type: string
            enum: [queued, running, completed, failed, cancelled, retrying]
        - name: filter[job_type]
          in: query
          schema:
            type: string
            enum: [imposition, compression, merge, split]
        - name: filter[upload_id]
          in: query
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Paginated jobs list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ProcessingJob'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /jobs/{job_id}:
    get:
      tags: [PDF Processing]
      operationId: getJob
      summary: Get processing job status and details
      description: |
        Poll this endpoint to check job progress.
        **Recommended polling interval:** 2 seconds while running.
        **Better alternative:** Use webhooks or SSE.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        '200':
          description: Job details
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/ProcessingJob'

  /jobs/{job_id}/cancel:
    post:
      tags: [PDF Processing]
      operationId: cancelJob
      summary: Cancel a queued or running processing job
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        '200':
          description: Job cancellation requested
        '409':
          description: Job already completed or cannot be cancelled

  /jobs/{job_id}/retry:
    post:
      tags: [PDF Processing]
      operationId: retryJob
      summary: Retry a failed processing job
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        '202':
          description: Job requeued
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/ProcessingJob'
        '409':
          description: Job is not in failed state

  /jobs/{job_id}/stream:
    get:
      tags: [PDF Processing]
      operationId: streamJobProgress
      summary: Server-Sent Events stream for real-time job progress
      description: |
        Subscribe to job progress updates via SSE.
        
        **Event types:**
        - `progress` — progress update with percentage
        - `completed` — job finished, includes generated_pdf_id
        - `failed` — job failed, includes error details
        - `heartbeat` — keep-alive every 15 seconds
        
        ```
        event: progress
        data: {"job_id": "...", "progress": 45, "message": "Processing page 45 of 100"}
        
        event: completed
        data: {"job_id": "...", "generated_pdf_id": "...", "download_url": "..."}
        ```
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/JobId'
      responses:
        '200':
          description: SSE stream
          content:
            text/event-stream:
              schema:
                type: string

  /jobs/batch:
    post:
      tags: [PDF Processing]
      operationId: submitBatchJobs
      summary: Submit multiple imposition jobs in one request (Pro+ plans)
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [jobs]
              properties:
                jobs:
                  type: array
                  minItems: 1
                  maxItems: 50
                  items:
                    $ref: '#/components/schemas/SubmitJobRequest'
                batch_name:
                  type: string
                  maxLength: 200
      responses:
        '202':
          description: Batch submitted
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      batch_id:
                        type: string
                        format: uuid
                      jobs:
                        type: array
                        items:
                          $ref: '#/components/schemas/ProcessingJob'
                      total_jobs:
                        type: integer
        '403':
          description: Batch processing not available on current plan

  # ────────────────────────────────────────────────────────────
  # MODULE 6: LAYOUT PRESETS (7 endpoints)
  # ────────────────────────────────────────────────────────────

  /presets:
    get:
      tags: [Layout Presets]
      operationId: listPresets
      summary: List available layout presets
      description: |
        Returns system presets and user's custom presets.
        System presets are always included.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Sort'
        - $ref: '#/components/parameters/Search'
        - name: filter[type]
          in: query
          schema:
            type: string
            enum: [system, user_custom, organization, shared]
        - name: filter[pages_per_sheet]
          in: query
          schema:
            type: integer
            enum: [1, 2, 4, 6, 8, 9, 16]
        - name: filter[duplex_mode]
          in: query
          schema:
            type: string
            enum: [none, long_edge, short_edge]
        - name: filter[is_booklet]
          in: query
          schema:
            type: boolean
        - name: include_system
          in: query
          schema:
            type: boolean
            default: true
      responses:
        '200':
          description: Presets list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/LayoutPreset'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
    
    post:
      tags: [Layout Presets]
      operationId: createPreset
      summary: Create a new custom layout preset
      description: |
        Creates a user-owned custom preset.
        **Requires:** Plan with `allows_custom_presets = true`
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePresetRequest'
            example:
              preset_name: "My MAKAUT 4-Up"
              description: "Optimized for MAKAUT question papers"
              pages_per_sheet: 4
              layout_columns: 2
              layout_rows: 2
              duplex_mode: "long_edge"
              binding_edge: "left"
              page_order: "horizontal"
              margin_top_mm: 5
              margin_bottom_mm: 5
              margin_left_mm: 8
              margin_right_mm: 5
              gutter_mm: 2
              paper_size: "A4"
              show_border: true
              show_page_numbers: true
      responses:
        '201':
          description: Preset created
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/LayoutPreset'
        '402':
          description: Custom presets not available on current plan
        '409':
          description: Preset name already exists

  /presets/{preset_id}:
    get:
      tags: [Layout Presets]
      operationId: getPreset
      summary: Get preset details
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PresetId'
      responses:
        '200':
          description: Preset details
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/LayoutPreset'
        '404':
          description: Preset not found
    
    put:
      tags: [Layout Presets]
      operationId: updatePreset
      summary: Update a custom preset (user's own presets only)
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PresetId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePresetRequest'
      responses:
        '200':
          description: Preset updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/LayoutPreset'
        '403':
          description: Cannot modify system presets
    
    delete:
      tags: [Layout Presets]
      operationId: deletePreset
      summary: Delete a custom preset
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PresetId'
      responses:
        '204':
          description: Preset deleted
        '403':
          description: Cannot delete system presets
        '409':
          description: Preset is used by active jobs

  /presets/{preset_id}/duplicate:
    post:
      tags: [Layout Presets]
      operationId: duplicatePreset
      summary: Duplicate an existing preset (system or own)
      description: Creates a user-owned copy of any accessible preset
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PresetId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                new_name:
                  type: string
                  maxLength: 200
      responses:
        '201':
          description: Preset duplicated
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/LayoutPreset'

  /presets/featured:
    get:
      tags: [Layout Presets]
      operationId: getFeaturedPresets
      summary: Get featured/recommended presets (public endpoint)
      description: No authentication required. Returns system featured presets.
      responses:
        '200':
          description: Featured presets
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/LayoutPreset'

  # ────────────────────────────────────────────────────────────
  # MODULE 7: GENERATED PDFs / DOWNLOADS (6 endpoints)
  # ────────────────────────────────────────────────────────────

  /generated-pdfs:
    get:
      tags: [Generated PDFs]
      operationId: listGeneratedPdfs
      summary: List user's generated/imposed PDFs
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Sort'
        - name: filter[upload_id]
          in: query
          schema:
            type: string
            format: uuid
        - name: filter[preset_id]
          in: query
          schema:
            type: string
            format: uuid
        - name: filter[pages_per_sheet]
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Generated PDFs list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/GeneratedPdf'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /generated-pdfs/{generated_pdf_id}:
    get:
      tags: [Generated PDFs]
      operationId: getGeneratedPdf
      summary: Get generated PDF details and download URL
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/GeneratedPdfId'
      responses:
        '200':
          description: Generated PDF details with fresh download URL
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/GeneratedPdf'
    
    delete:
      tags: [Generated PDFs]
      operationId: deleteGeneratedPdf
      summary: Delete a generated PDF file
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/GeneratedPdfId'
      responses:
        '204':
          description: Generated PDF deleted

  /generated-pdfs/{generated_pdf_id}/download:
    get:
      tags: [Generated PDFs]
      operationId: downloadGeneratedPdf
      summary: Get a fresh pre-signed download URL (valid 1 hour)
      description: |
        Returns a time-limited URL for direct file download.
        Download tracking is recorded server-side.
        
        The URL points directly to S3/storage, not through the API.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/GeneratedPdfId'
        - name: disposition
          in: query
          schema:
            type: string
            enum: [attachment, inline]
            default: attachment
          description: Content-Disposition for the download
      responses:
        '200':
          description: Download URL generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      download_url:
                        type: string
                        format: uri
                      expires_at:
                        type: string
                        format: date-time
                      filename:
                        type: string
                      file_size_bytes:
                        type: integer
          headers:
            X-Download-Count:
              schema:
                type: integer
              description: Total download count for this file
        '404':
          description: Generated PDF not found or expired

  /generated-pdfs/{generated_pdf_id}/stream:
    get:
      tags: [Generated PDFs]
      operationId: streamGeneratedPdf
      summary: Stream generated PDF file directly (small files)
      description: |
        Streams the PDF file directly through the API.
        Use for files < 25MB or in-browser preview.
        For larger files, use the presigned download URL.
        
        Supports HTTP Range requests for partial content.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/GeneratedPdfId'
        - name: Range
          in: header
          schema:
            type: string
          example: "bytes=0-1048575"
      responses:
        '200':
          description: Full PDF file
          content:
            application/pdf:
              schema:
                type: string
                format: binary
          headers:
            Content-Disposition:
              schema:
                type: string
            Content-Length:
              schema:
                type: integer
        '206':
          description: Partial content (Range request)
          content:
            application/pdf:
              schema:
                type: string
                format: binary
          headers:
            Content-Range:
              schema:
                type: string

  /generated-pdfs/bulk-delete:
    post:
      tags: [Generated PDFs]
      operationId: bulkDeleteGeneratedPdfs
      summary: Delete multiple generated PDFs in one request
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [generated_pdf_ids]
              properties:
                generated_pdf_ids:
                  type: array
                  items:
                    type: string
                    format: uuid
                  minItems: 1
                  maxItems: 100
      responses:
        '200':
          description: Bulk deletion results
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      deleted:
                        type: integer
                      failed:
                        type: array
                        items:
                          type: object
                          properties:
                            id:
                              type: string
                            reason:
                              type: string

  # ────────────────────────────────────────────────────────────
  # MODULE 8: ANALYTICS (5 endpoints)
  # ────────────────────────────────────────────────────────────

  /analytics/events:
    post:
      tags: [Analytics]
      operationId: trackEvent
      summary: Track a client-side analytics event
      description: |
        Accepts client-side events for behavioral analytics.
        
        **Rate Limit:** 100 events per minute per user
        **Note:** Server-side events are tracked automatically.
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                events:
                  type: array
                  items:
                    $ref: '#/components/schemas/AnalyticsEventRequest'
                  minItems: 1
                  maxItems: 50
                  description: Batch up to 50 events per request
      responses:
        '202':
          description: Events queued for processing
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      accepted:
                        type: integer
                      rejected:
                        type: integer

  /analytics/usage:
    get:
      tags: [Analytics]
      operationId: getUsageReport
      summary: Get detailed usage report for the authenticated user
      security:
        - BearerAuth: []
      parameters:
        - name: from
          in: query
          required: true
          schema:
            type: string
            format: date
          example: "2024-07-01"
        - name: to
          in: query
          required: true
          schema:
            type: string
            format: date
          example: "2024-07-31"
        - name: group_by
          in: query
          schema:
            type: string
            enum: [day, week, month]
            default: day
      responses:
        '200':
          description: Usage report
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/UsageReport'

  /analytics/usage/export:
    get:
      tags: [Analytics]
      operationId: exportUsageData
      summary: Export usage data as CSV (Pro+ plans)
      security:
        - BearerAuth: []
      parameters:
        - name: from
          in: query
          required: true
          schema:
            type: string
            format: date
        - name: to
          in: query
          required: true
          schema:
            type: string
            format: date
        - name: format
          in: query
          schema:
            type: string
            enum: [csv, json]
            default: csv
      responses:
        '200':
          description: Usage data file
          content:
            text/csv:
              schema:
                type: string
            application/json:
              schema:
                type: object
        '403':
          description: Analytics export not available on current plan

  /analytics/savings-summary:
    get:
      tags: [Analytics]
      operationId: getSavingsSummary
      summary: Get environmental and cost savings summary
      security:
        - BearerAuth: []
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [all_time, year, month, week]
            default: all_time
      responses:
        '200':
          description: Savings summary
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      period:
                        type: string
                      total_pages_processed:
                        type: integer
                      total_paper_sheets_saved:
                        type: integer
                      total_cost_saved_usd:
                        type: number
                      trees_equivalent:
                        type: number
                        description: Approximate trees saved
                      carbon_grams_saved:
                        type: number
                      water_liters_saved:
                        type: number
                      rank_among_users:
                        type: integer
                        description: User's rank by savings

  /analytics/system/metrics:
    get:
      tags: [Analytics]
      operationId: getSystemMetrics
      summary: Public platform metrics (aggregated, no PII)
      responses:
        '200':
          description: Platform-wide aggregated metrics
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      total_pdfs_processed:
                        type: integer
                      total_pages_saved:
                        type: integer
                      total_users:
                        type: integer
                      total_cost_saved_usd:
                        type: number
                      active_users_today:
                        type: integer

  # ────────────────────────────────────────────────────────────
  # MODULE 9: ADMIN (11 endpoints)
  # ────────────────────────────────────────────────────────────

  /admin/users:
    get:
      tags: [Admin]
      operationId: adminListUsers
      summary: List all users with advanced filters (Admin only)
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 200
            default: 50
        - $ref: '#/components/parameters/Sort'
        - $ref: '#/components/parameters/Search'
        - name: filter[status]
          in: query
          schema:
            type: string
        - name: filter[role_slug]
          in: query
          schema:
            type: string
        - name: filter[plan_tier]
          in: query
          schema:
            type: string
        - name: filter[country_code]
          in: query
          schema:
            type: string
        - name: filter[email_verified]
          in: query
          schema:
            type: boolean
        - name: filter[created_at][gte]
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Users list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/UserProfile'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '403':
          description: Admin access required

  /admin/users/{user_id}:
    get:
      tags: [Admin]
      operationId: adminGetUser
      summary: Get full user details (Admin only)
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserId'
      responses:
        '200':
          description: Full user profile with admin details
    
    patch:
      tags: [Admin]
      operationId: adminUpdateUser
      summary: Update user status, role, or flags (Admin only)
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AdminUserUpdate'
      responses:
        '200':
          description: User updated
        '400':
          description: Cannot suspend own account

  /admin/users/{user_id}/impersonate:
    post:
      tags: [Admin]
      operationId: impersonateUser
      summary: Generate impersonation token to act as user (Super Admin only)
      description: |
        Creates a short-lived (15 min) impersonation token.
        All actions taken are logged as impersonation in audit trail.
        Cannot impersonate other admins.
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  minLength: 20
                  description: Mandatory reason for audit trail
      responses:
        '200':
          description: Impersonation token issued
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      impersonation_token:
                        type: string
                      expires_in:
                        type: integer
                        example: 900
        '403':
          description: Super admin only

  /admin/jobs:
    get:
      tags: [Admin]
      operationId: adminListJobs
      summary: View all processing jobs across all users (Admin)
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 50
        - name: filter[status]
          in: query
          schema:
            type: string
        - name: filter[worker_id]
          in: query
          schema:
            type: string
        - name: filter[queue_name]
          in: query
          schema:
            type: string
      responses:
        '200':
          description: All jobs

  /admin/jobs/{job_id}/force-cancel:
    post:
      tags: [Admin]
      operationId: adminForceCancelJob
      summary: Force cancel any job regardless of status (Admin)
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/JobId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
      responses:
        '200':
          description: Job force cancelled

  /admin/presets:
    post:
      tags: [Admin]
      operationId: adminCreateSystemPreset
      summary: Create a new system-level preset (Admin only)
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/CreatePresetRequest'
                - type: object
                  properties:
                    is_featured:
                      type: boolean
                    sort_order:
                      type: integer
      responses:
        '201':
          description: System preset created

  /admin/presets/{preset_id}:
    put:
      tags: [Admin]
      operationId: adminUpdatePreset
      summary: Update any preset including system presets (Admin)
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PresetId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePresetRequest'
      responses:
        '200':
          description: Preset updated
    
    delete:
      tags: [Admin]
      operationId: adminDeletePreset
      summary: Delete any preset (Admin)
      security:
        - BearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PresetId'
      responses:
        '204':
          description: Preset deleted

  /admin/analytics/overview:
    get:
      tags: [Admin]
      operationId: adminAnalyticsOverview
      summary: Platform-wide analytics overview (Admin)
      security:
        - BearerAuth: []
      parameters:
        - name: from
          in: query
          schema:
            type: string
            format: date
        - name: to
          in: query
          schema:
            type: string
            format: date
        - name: group_by
          in: query
          schema:
            type: string
            enum: [day, week, month]
            default: day
      responses:
        '200':
          description: Admin analytics
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      new_users:
                        type: array
                        items:
                          type: object
                          properties:
                            date:
                              type: string
                            count:
                              type: integer
                      total_uploads:
                        type: integer
                      total_jobs:
                        type: integer
                      job_success_rate:
                        type: number
                      revenue_usd:
                        type: number
                      active_subscriptions:
                        type: object
                        additionalProperties:
                          type: integer
                      avg_processing_ms:
                        type: integer

  /admin/audit-logs:
    get:
      tags: [Admin]
      operationId: getAuditLogs
      summary: Query audit logs (Admin only)
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 100
        - name: filter[user_id]
          in: query
          schema:
            type: string
            format: uuid
        - name: filter[action_type]
          in: query
          schema:
            type: string
        - name: filter[severity]
          in: query
          schema:
            type: string
            enum: [info, warning, error, critical]
        - name: filter[is_suspicious]
          in: query
          schema:
            type: boolean
        - name: filter[ip_address]
          in: query
          schema:
            type: string
        - name: filter[from]
          in: query
          schema:
            type: string
            format: date-time
        - name: filter[to]
          in: query
          schema:
            type: string
            format: date-time
      responses:
        '200':
          description: Audit logs

  /admin/system/health:
    get:
      tags: [Admin]
      operationId: systemHealth
      summary: System health check (used by load balancers + admin)
      responses:
        '200':
          description: System healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SystemHealthResponse'
        '503':
          description: System degraded or unhealthy

  /admin/system/stats:
    get:
      tags: [Admin]
      operationId: systemStats
      summary: Real-time system statistics (Admin only)
      security:
        - BearerAuth: []
      responses:
        '200':
          description: System statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      database:
                        type: object
                        properties:
                          connections_active:
                            type: integer
                          connections_idle:
                            type: integer
                          cache_hit_ratio:
                            type: number
                          slow_queries_count:
                            type: integer
                      queue:
                        type: object
                        properties:
                          total_queued:
                            type: integer
                          total_running:
                            type: integer
                          avg_wait_time_ms:
                            type: integer
                          workers_online:
                            type: integer
                      storage:
                        type: object
                        properties:
                          total_files:
                            type: integer
                          total_size_gb:
                            type: number
                          s3_usage_gb:
                            type: number
                      users:
                        type: object
                        properties:
                          total:
                            type: integer
                          active_sessions:
                            type: integer
                          new_today:
                            type: integer

  # ────────────────────────────────────────────────────────────
  # MODULE 10: WEBHOOKS (4 endpoints)
  # ────────────────────────────────────────────────────────────

  /webhooks:
    post:
      tags: [Webhooks]
      operationId: registerWebhook
      summary: Register a webhook endpoint
      description: |
        Register an HTTPS endpoint to receive event notifications.
        
        **Available events:**
        - `job.completed` — Job finished successfully
        - `job.failed` — Job failed with error
        - `upload.completed` — Upload processing done
        - `subscription.renewed` — Subscription renewed
        - `subscription.cancelled` — Subscription cancelled
        
        **Security:** Each delivery includes an HMAC-SHA256 signature
        in `X-Imposify-Signature` header.
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [url, events]
              properties:
                url:
                  type: string
                  format: uri
                  description: Must be HTTPS
                events:
                  type: array
                  items:
                    type: string
                    enum:
                      - job.completed
                      - job.failed
                      - upload.completed
                      - upload.failed
                      - subscription.renewed
                      - subscription.cancelled
                      - payment.succeeded
                      - payment.failed
                description:
                  type: string
                  maxLength: 200
                secret:
                  type: string
                  minLength: 16
                  description: Your secret for HMAC verification
                is_active:
                  type: boolean
                  default: true
      responses:
        '201':
          description: Webhook registered
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      webhook_id:
                        type: string
                        format: uuid
                      url:
                        type: string
                      events:
                        type: array
                        items:
                          type: string
                      signing_secret:
                        type: string
                        description: Use this to verify webhook signatures
    
    get:
      tags: [Webhooks]
      operationId: listWebhooks
      summary: List registered webhooks
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Webhooks list

  /webhooks/{webhook_id}:
    delete:
      tags: [Webhooks]
      operationId: deleteWebhook
      summary: Delete a webhook registration
      security:
        - BearerAuth: []
      parameters:
        - name: webhook_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Webhook deleted

  /webhooks/{webhook_id}/test:
    post:
      tags: [Webhooks]
      operationId: testWebhook
      summary: Send a test event to webhook endpoint
      security:
        - BearerAuth: []
      parameters:
        - name: webhook_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                event_type:
                  type: string
                  enum: [job.completed, job.failed, upload.completed]
                  default: job.completed
      responses:
        '200':
          description: Test event sent
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      delivery_id:
                        type: string
                      status_code:
                        type: integer
                      response_time_ms:
                        type: integer
                      success:
                        type: boolean

# Global security requirement
security:
  - BearerAuth: []
PART 3: RATE LIMIT TABLE
text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RATE LIMITS BY ENDPOINT AND PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoint                    Free      Student    Pro       Enterprise
─────────────────────────── ──────── ────────── ───────── ──────────
POST /auth/register         5/hr IP  5/hr IP   5/hr IP   5/hr IP
POST /auth/login            10/min   10/min    20/min    50/min
POST /auth/token/refresh    20/hr    50/hr     200/hr    Unlimited
POST /uploads               5/day    30/day    200/day   Unlimited
POST /uploads/direct        2/min    5/min     20/min    50/min
POST /jobs                  5/day    30/day    200/day   Unlimited
POST /jobs/batch            ✗        ✗         5/hr      50/hr
GET /uploads/{id}/preview   10/hr    30/hr     200/hr    Unlimited
POST /analytics/events      20/min   50/min    100/min   500/min
GET /admin/*                ✗        ✗         ✗         Admin only

Global API Rate Limit (per user):
  Free:         100 requests/15 minutes
  Student:      300 requests/15 minutes
  Pro:          1000 requests/15 minutes
  Enterprise:   Custom (negotiated)
  API Key:      Based on plan

Rate Limit Headers Returned:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1720000000    (Unix timestamp)
  X-RateLimit-Window: 900          (seconds)
  Retry-After: 45                  (on 429 only)
PART 4: RBAC PERMISSION MATRIX
text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE-BASED ACCESS CONTROL MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Permission                      Guest  User  Support  Admin  SuperAdmin
──────────────────────────────  ─────  ────  ───────  ─────  ──────────
auth:register                   ✓      ✗     ✗        ✗      ✗
auth:login                      ✓      ✗     ✗        ✗      ✗
auth:refresh                    ✓      ✓     ✓        ✓      ✓

users:read:self                 ✗      ✓     ✗        ✗      ✗
users:update:self               ✗      ✓     ✗        ✗      ✗
users:delete:self               ✗      ✓     ✗        ✗      ✗
users:read:any                  ✗      ✗     ✓        ✓      ✓
users:update:any                ✗      ✗     ✗        ✓      ✓
users:impersonate               ✗      ✗     ✗        ✗      ✓

uploads:create                  ✗      ✓     ✗        ✓      ✓
uploads:read:own                ✗      ✓     ✗        ✓      ✓
uploads:read:any                ✗      ✗     ✓        ✓      ✓
uploads:delete:own              ✗      ✓     ✗        ✓      ✓
uploads:delete:any              ✗      ✗     ✗        ✓      ✓

jobs:create                     ✗      ✓     ✗        ✓      ✓
jobs:read:own                   ✗      ✓     ✗        ✓      ✓
jobs:read:any                   ✗      ✗     ✓        ✓      ✓
jobs:cancel:own                 ✗      ✓     ✗        ✓      ✓
jobs:cancel:any                 ✗      ✗     ✗        ✓      ✓
jobs:batch                      ✗      ✗(Pro+)✗        ✓      ✓

presets:read:system             ✓      ✓     ✓        ✓      ✓
presets:create:custom           ✗      ✓(Pro+)✗        ✓      ✓
presets:update:own              ✗      ✓     ✗        ✓      ✓
presets:delete:own              ✗      ✓     ✗        ✓      ✓
presets:manage:system           ✗      ✗     ✗        ✓      ✓

analytics:read:own              ✗      ✓     ✗        ✓      ✓
analytics:export                ✗      ✗(Pro+)✗        ✓      ✓
analytics:read:all              ✗      ✗     ✗        ✓      ✓

admin:users:manage              ✗      ✗     ✗        ✓      ✓
admin:audit:read                ✗      ✗     ✗        ✓      ✓
admin:system:read               ✗      ✗     ✗        ✓      ✓
admin:system:modify             ✗      ✗     ✗        ✗      ✓
PART 5: AUTHENTICATION FLOW DIAGRAMS
text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTHENTICATION FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENT                    API                      DATABASE / CACHE
  │                        │                              │
  │── POST /auth/login ───►│                              │
  │   {email, password}    │                              │
  │                        │── SELECT user ──────────────►│
  │                        │◄── user record ──────────────│
  │                        │                              │
  │                        │── verify bcrypt hash         │
  │                        │                              │
  │                        │── generate RS256 tokens      │
  │                        │   access_token (15 min)      │
  │                        │   refresh_token (7 days)     │
  │                        │                              │
  │                        │── store session hash ───────►│
  │                        │── log auth event ───────────►│
  │                        │                              │
  │◄── 200 {tokens} ───────│                              │
  │                        │                              │
  │                        │                              │
  │── GET /uploads ────────►│                              │
  │   Authorization: Bearer│                              │
  │                        │── verify RS256 signature     │
  │                        │── check token expiry         │
  │                        │── extract claims             │
  │                        │   {user_id, role, scope}     │
  │                        │                              │
  │                        │── check RBAC permission      │
  │                        │                              │
  │◄── 200 {uploads} ──────│                              │
  │                        │                              │

TOKEN REFRESH FLOW:
  │                        │                              │
  │── POST /auth/token/    │                              │
  │       refresh ────────►│                              │
  │   {refresh_token}      │                              │
  │                        │── hash refresh token         │
  │                        │── lookup session ───────────►│
  │                        │◄── session valid ────────────│
  │                        │                              │
  │                        │── invalidate old session ───►│
  │                        │── generate NEW token pair    │
  │                        │── store NEW session ────────►│
  │                        │                              │
  │◄── 200 {new_tokens} ───│                              │
  │                        │                              │

JWT TOKEN STRUCTURE:
  Header: {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "2024-01"    // Key ID for rotation
  }
  
  Payload: {
    "sub": "550e8400-e29b-41d4-a716-446655440000",  // user_id
    "email": "user@example.com",
    "username": "raju_sharma",
    "role": "user",
    "role_priority": 10,
    "plan_tier": "pro",
    "session_id": "770e8400-...",
    "iat": 1720000000,
    "exp": 1720000900,
    "iss": "https://api.imposify.io",
    "aud": "imposify-app",
    "jti": "unique-token-id"
  }
PART 6: SAMPLE cURL COMMANDS
Bash

# ============================================================
# AUTHENTICATION
# ============================================================

# Register new user
curl -X POST https://api.imposify.io/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: $(uuidgen)" \
  -d '{
    "email": "raju.sharma@makaut.edu.in",
    "username": "raju_sharma",
    "password": "SecurePass@123",
    "full_name": "Raju Sharma",
    "country_code": "IN",
    "accept_terms": true
  }'

# Login
curl -X POST https://api.imposify.io/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raju.sharma@makaut.edu.in",
    "password": "SecurePass@123",
    "remember_me": false
  }' | jq '.data.access_token'

# Store token
export TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# Refresh token
curl -X POST https://api.imposify.io/v1/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}'

# Logout
curl -X POST https://api.imposify.io/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"logout_all_devices": false}'

# ============================================================
# USER PROFILE
# ============================================================

# Get my profile
curl -X GET https://api.imposify.io/v1/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: 