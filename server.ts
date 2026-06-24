/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Imposify — Express + Prisma Backend
 * PRD-compliant implementation with:
 *  - Password complexity enforcement (FR-AUTH-001)
 *  - bcrypt cost factor 12 (FR-AUTH-003)
 *  - Account lockout after 5 failed attempts (FR-AUTH-002)
 *  - Password reset via token (FR-AUTH-003)
 *  - Profile management (FR-AUTH-004)
 *  - GDPR account deletion (FR-AUTH-004)
 *  - Data export (FR-AUTH-004)
 *  - File size enforcement 25MB (FR-UPLOAD-001)
 *  - Custom preset limit per plan (FR-PRESET-002)
 *  - Admin user suspend/unsuspend (FR-ADMIN-001)
 *  - Rate limit 500 dev / 100 prod (NFR-SEC-09)
 */

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// ── Security Headers ────────────────────────────────────────────────────────
app.use(express.json({ limit: '30mb' })); // allow body up to 30MB for metadata
app.use(cors());
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
})); // CSP disabled for Vite HMR compat, COOP allows Google Auth popups

// ── Rate Limiting ───────────────────────────────────────────────────────────
// In development/test, use a higher limit so automated tests don't get throttled
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use('/api/', apiLimiter);

// ── JWT + Google OAuth ──────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'super-secret-key-change-in-production') {
  console.error('⚠️  FATAL: JWT_SECRET environment variable not set in production! Exiting.');
  process.exit(1);
}

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || 'dummy_client_id';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ── Gemini AI ───────────────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
} else {
  console.warn("GEMINI_API_KEY not defined. AI panel will operate in offline mode.");
}

function getGemini(): GoogleGenAI {
  if (!ai) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return ai;
}

// ── Password Complexity Validation (FR-AUTH-001) ────────────────────────────
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || password.length < 8)
    return { valid: false, message: "Password must be at least 8 characters." };
  if (!/[A-Z]/.test(password))
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  if (!/[0-9]/.test(password))
    return { valid: false, message: "Password must contain at least one number." };
  if (!/[^A-Za-z0-9]/.test(password))
    return { valid: false, message: "Password must contain at least one special character (!@#$%^&* etc.)." };
  return { valid: true, message: "OK" };
}

// ── In-Memory Account Lockout Tracker (FR-AUTH-002) ────────────────────────
// Key: email, Value: { attempts, lockedUntil }
const loginAttemptTracker = new Map<string, { attempts: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkLockout(email: string): { locked: boolean; message: string } {
  const record = loginAttemptTracker.get(email);
  if (!record) return { locked: false, message: '' };
  if (record.lockedUntil > Date.now()) {
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { locked: true, message: `Account locked. Try again in ${remaining} minute(s).` };
  }
  return { locked: false, message: '' };
}

function recordFailedLogin(email: string): void {
  const record = loginAttemptTracker.get(email) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;
  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    console.warn(`[SECURITY] Account locked for ${email} after ${record.attempts} failed attempts.`);
  }
  loginAttemptTracker.set(email, record);
}

function clearLoginAttempts(email: string): void {
  loginAttemptTracker.delete(email);
}

// ── In-Memory Password Reset Token Store (FR-AUTH-003) ─────────────────────
// Key: token, Value: { email, expires }
const passwordResetTokens = new Map<string, { email: string; expires: number }>();

// ── Auth Middleware ─────────────────────────────────────────────────────────
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: "Unauthorized: Missing Token" });
  jwt.verify(token, JWT_SECRET, async (err: any, decodedUser: any) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid or Expired Token" });
    
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: decodedUser.id },
        select: { user_id: true, email: true, status: true, role_id: true }
      });
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }
      
      if (user.status === 'suspended' || user.status === 'banned') {
        return res.status(403).json({ error: "Account suspended. Please contact support." });
      }
      
      req.user = decodedUser;
      next();
    } catch (dbErr) {
      console.error("Token DB Check Error:", dbErr);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

// ── RBAC Middleware ─────────────────────────────────────────────────────────
const requireRole = (requiredRoleSlug: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: req.user.id },
        include: { role: true }
      });
      if (!user || user.status !== 'active') {
        return res.status(403).json({ error: "Account inactive or not found" });
      }
      const userRoleSlug = user.role?.role_slug || 'user';
      if (userRoleSlug === requiredRoleSlug || userRoleSlug === 'admin' || userRoleSlug === 'superadmin') {
        req.fullUser = user;
        next();
      } else {
        return res.status(403).json({ error: `Forbidden: Requires ${requiredRoleSlug} privileges` });
      }
    } catch (error) {
      console.error("RBAC Check Error:", error);
      res.status(500).json({ error: "Server error during permission check" });
    }
  };
};

// ── Audit Log Writer ─────────────────────────────────────────────────────────
async function writeAuditLog(opts: {
  user_id?: string;
  action_type: string;
  action_category: string;
  table_name?: string;
  record_id?: string;
  old_values?: object;
  new_values?: object;
  severity: 'info' | 'warning' | 'critical';
  ip?: string;
  api_endpoint?: string;
  http_method?: string;
  notes?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: opts.user_id,
        action_type: opts.action_type,
        action_category: opts.action_category,
        table_name: opts.table_name,
        record_id: opts.record_id,
        old_values: opts.old_values ? JSON.stringify(opts.old_values) : undefined,
        new_values: opts.new_values ? JSON.stringify(opts.new_values) : undefined,
        severity: opts.severity,
        ip_address: opts.ip,
        api_endpoint: opts.api_endpoint,
        http_method: opts.http_method,
        notes: opts.notes,
      }
    });
  } catch (err) {
    // Never let audit log failure break the primary action
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION ROUTES
// ════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register — FR-AUTH-001
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // Password complexity validation (FR-AUTH-001)
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) return res.status(400).json({ error: pwCheck.message });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // bcrypt cost factor 12 (FR-AUTH-003)
    const hashedPassword = await bcrypt.hash(password, 12);
    // Assign default 'student' role on registration
    const studentRole = await prisma.role.findFirst({ where: { role_slug: 'student' } });
    const newUser = await prisma.user.create({
      data: {
        full_name: name,
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        password_hash: hashedPassword,
        status: "active",
        role_id: studentRole?.role_id,
      },
      include: { role: true }
    });

    const token = jwt.sign({ id: newUser.user_id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = newUser;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login — FR-AUTH-002 with lockout
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    // Check account lockout (FR-AUTH-002)
    const lockStatus = checkLockout(email);
    if (lockStatus.locked) {
      return res.status(429).json({ error: lockStatus.message });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    if (!user || !user.password_hash) {
      recordFailedLogin(email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if user is suspended or banned
    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({ error: "Account suspended. Please contact support." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      recordFailedLogin(email);
      const record = loginAttemptTracker.get(email);
      const remaining = MAX_LOGIN_ATTEMPTS - (record?.attempts || 0);
      return res.status(400).json({
        error: `Invalid credentials. ${remaining > 0 ? `${remaining} attempt(s) remaining before lockout.` : 'Account locked for 15 minutes.'}`
      });
    }

    // Successful login — clear lockout
    clearLoginAttempts(email);

    // Update last login
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { last_login_at: new Date(), failed_login_attempts: 0 }
    });

    // Audit log for admin logins
    if (user.role?.role_slug === 'admin' || user.role?.role_slug === 'superadmin') {
      await writeAuditLog({
        user_id: user.user_id,
        action_type: 'admin_login',
        action_category: 'authentication',
        table_name: 'User',
        record_id: user.user_id,
        severity: 'info',
        api_endpoint: '/api/auth/login',
        http_method: 'POST',
        notes: `Admin login for ${email}`,
      });
    }

    const token = jwt.sign({ id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/google — Google OAuth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Missing Google credential" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google payload" });
    }

    const { email, name, sub, picture } = payload;
    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      const userRole = await prisma.role.findFirst({ where: { role_slug: 'student' } });
      const roleId = userRole ? userRole.role_id : undefined;

      user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6),
          full_name: name,
          avatar_url: picture,
          auth_provider: 'google',
          oauth_provider_id: sub,
          email_verified: true,
          status: 'active',
          role_id: roleId as string
        },
        include: { role: true }
      }) as any;
    }

    if (user!.status === 'suspended' || user!.status === 'banned') {
      return res.status(403).json({ error: "Account suspended. Please contact support." });
    }

    const token = jwt.sign({ id: user!.user_id, email: user!.email }, JWT_SECRET, { expiresIn: '7d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = user!;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// GET /api/auth/me — get profile
app.get('/api/auth/me', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.id },
      include: { role: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user is suspended or banned
    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({ error: "Account suspended. Please contact support." });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/me — update profile (FR-AUTH-004)
app.put('/api/users/me', authenticateToken, async (req: any, res: any) => {
  try {
    const { full_name, phone_number, country_code, timezone, locale } = req.body;
    const updated = await prisma.user.update({
      where: { user_id: req.user.id },
      data: {
        ...(full_name !== undefined && { full_name }),
        ...(phone_number !== undefined && { phone_number }),
        ...(country_code !== undefined && { country_code }),
        ...(timezone !== undefined && { timezone }),
        ...(locale !== undefined && { locale }),
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/users/me — GDPR soft-delete (FR-AUTH-004)
app.delete('/api/users/me', authenticateToken, async (req: any, res: any) => {
  try {
    await prisma.user.update({
      where: { user_id: req.user.id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        status: 'deleted',
        email: `deleted_${Date.now()}_${req.user.email}`, // anonymize email
        full_name: '[Deleted User]',
        password_hash: null,
      }
    });
    res.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/me/export — GDPR data export (FR-AUTH-004)
app.get('/api/users/me/export', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.id },
      include: {
        pdf_uploads: { where: { is_deleted: false } },
        generated_pdfs: { where: { is_deleted: false } },
        layout_presets: { where: { is_deleted: false } },
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...safeUser } = user;
    res.json({
      exported_at: new Date().toISOString(),
      user: safeUser,
      uploads_count: user.pdf_uploads.length,
      generated_pdfs_count: user.generated_pdfs.length,
      custom_presets_count: user.layout_presets.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/me/password — change password
app.put('/api/users/me/password', authenticateToken, async (req: any, res: any) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Missing current_password or new_password" });
    }

    const pwCheck = validatePassword(new_password);
    if (!pwCheck.valid) return res.status(400).json({ error: pwCheck.message });

    const user = await prisma.user.findUnique({ where: { user_id: req.user.id } });
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: "No password set (OAuth account)" });
    }

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const newHash = await bcrypt.hash(new_password, 12);
    await prisma.user.update({
      where: { user_id: req.user.id },
      data: { password_hash: newHash }
    });
    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/forgot-password — FR-AUTH-003
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return 200 to prevent email enumeration
    if (!user || !user.password_hash) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    passwordResetTokens.set(token, { email, expires });

    // In production, send email. In dev, log to console.
    console.log(`\n[PASSWORD RESET] Token for ${email}:`);
    console.log(`  → POST /api/auth/reset-password  { token: "${token}", new_password: "..." }\n`);

    res.json({
      message: "If that email is registered, a reset link has been sent.",
      // In dev mode, expose token for testing
      ...(process.env.NODE_ENV !== 'production' && { dev_reset_token: token })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset-password — FR-AUTH-003
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: "Missing token or new_password" });
    }

    const pwCheck = validatePassword(new_password);
    if (!pwCheck.valid) return res.status(400).json({ error: pwCheck.message });

    const record = passwordResetTokens.get(token);
    if (!record) return res.status(400).json({ error: "Invalid or expired reset token" });
    if (record.expires < Date.now()) {
      passwordResetTokens.delete(token);
      return res.status(400).json({ error: "Reset token has expired. Request a new one." });
    }

    const user = await prisma.user.findUnique({ where: { email: record.email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newHash = await bcrypt.hash(new_password, 12);
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password_hash: newHash }
    });

    passwordResetTokens.delete(token);
    clearLoginAttempts(record.email); // clear any lockout
    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════════════════════

// GET /api/admin/users — list all users
app.get('/api/admin/users', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select: { user_id: true, email: true, username: true, full_name: true, status: true, created_at: true, role: true }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/stats — aggregate stats
app.get('/api/admin/stats', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.processingJob.count();
    const sumStats = await prisma.generatedPdf.aggregate({
      where: { is_deleted: false },
      _sum: { estimated_paper_saved: true }
    });
    res.json({
      total_users: totalUsers,
      total_jobs_processed: totalJobs,
      global_paper_sheets_saved: sumStats._sum.estimated_paper_saved || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/users/:id/status — suspend or activate a user (FR-ADMIN-001)
app.patch('/api/admin/users/:id/status', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'active', 'suspended', or 'banned'." });
    }

    const user = await prisma.user.findUnique({ where: { user_id: id }, include: { role: true } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent self-suspension
    if (user.user_id === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own account status." });
    }

    const oldStatus = user.status;
    const updated = await prisma.user.update({
      where: { user_id: id },
      data: { status },
      select: { user_id: true, email: true, status: true, full_name: true, role: true }
    });

    // If suspending or banning, clear any active lockout
    if (status !== 'active') {
      clearLoginAttempts(user.email);
    }

    // Write audit log
    await writeAuditLog({
      user_id: req.user.id,
      action_type: `user_status_${status}`,
      action_category: 'user_management',
      table_name: 'User',
      record_id: id,
      old_values: { status: oldStatus },
      new_values: { status },
      severity: status === 'banned' ? 'critical' : 'warning',
      api_endpoint: `/api/admin/users/${id}/status`,
      http_method: 'PATCH',
      notes: `Admin changed user ${user.email} status from '${oldStatus}' to '${status}'`,
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



// ════════════════════════════════════════════════════════════════════════════
// JOB PROCESSING ROUTES
// ════════════════════════════════════════════════════════════════════════════

// POST /api/jobs/track — track job processing and deduct credits
app.post('/api/jobs/track', authenticateToken, async (req: any, res: any) => {
  try {
    const { pages_processed, preset, is_unwatermarked, is_ai_requested } = req.body;
    
    if (typeof pages_processed !== 'number') {
      return res.status(400).json({ error: "pages_processed is required and must be a number" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: req.user.id }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Calculate cost: 1 page = 1 credit. Unwatermarked = +50 credits. AI = +100 credits.
    let cost = pages_processed;
    if (is_unwatermarked) cost += 50;
    if (is_ai_requested) cost += 100;

    if (user.credit_balance < cost) {
      return res.status(402).json({ error: `Insufficient credits. Job requires ${cost} credits, but you only have ${user.credit_balance}.` });
    }

    // Deduct credits and update
    const updatedUser = await prisma.user.update({
      where: { user_id: req.user.id },
      data: { credit_balance: { decrement: cost } },
      select: { credit_balance: true }
    });

    res.json({ success: true, remaining_credits: updatedUser.credit_balance, cost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// COMMERCE & CREDITS ROUTES
// ════════════════════════════════════════════════════════════════════════════

// GET /api/commerce/balance — get current credit balance
app.get('/api/commerce/balance', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.id },
      select: { credit_balance: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ credit_balance: user.credit_balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/commerce/buy-credits — mock endpoint for purchasing credits
app.post('/api/commerce/buy-credits', authenticateToken, async (req: any, res: any) => {
  try {
    const { amount } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: req.user.id },
      data: { credit_balance: { increment: amount } },
      select: { credit_balance: true }
    });

    // Write audit log
    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'buy_credits',
      action_category: 'commerce',
      table_name: 'User',
      record_id: req.user.id,
      new_values: { credit_purchased: amount, new_balance: updatedUser.credit_balance },
      severity: 'info',
      api_endpoint: `/api/commerce/buy-credits`,
      http_method: 'POST',
      notes: `User purchased ${amount} credits`,
    });

    res.json({ success: true, new_balance: updatedUser.credit_balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/users/:id/role — promote or demote a user's role
app.patch('/api/admin/users/:id/role', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role_slug } = req.body;

    if (!role_slug) return res.status(400).json({ error: "role_slug is required" });

    // Validate allowed role slugs
    const allowedSlugs = ['student', 'educator', 'admin', 'superadmin'];
    if (!allowedSlugs.includes(role_slug)) {
      return res.status(400).json({ error: `Invalid role_slug. Must be one of: ${allowedSlugs.join(', ')}` });
    }

    // Prevent self-demotion
    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role." });
    }

    const targetUser = await prisma.user.findUnique({
      where: { user_id: id },
      include: { role: true }
    });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const newRole = await prisma.role.findFirst({ where: { role_slug } });
    if (!newRole) return res.status(404).json({ error: `Role '${role_slug}' not found in database. Ensure seed has been run.` });

    const oldRoleSlug = targetUser.role?.role_slug || 'none';
    const updated = await prisma.user.update({
      where: { user_id: id },
      data: { role_id: newRole.role_id },
      select: { user_id: true, email: true, full_name: true, role: true, status: true }
    });

    // Write audit log
    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'user_role_change',
      action_category: 'user_management',
      table_name: 'User',
      record_id: id,
      old_values: { role_slug: oldRoleSlug },
      new_values: { role_slug },
      severity: role_slug === 'admin' || role_slug === 'superadmin' ? 'critical' : 'warning',
      api_endpoint: `/api/admin/users/${id}/role`,
      http_method: 'PATCH',
      notes: `Admin promoted/demoted ${targetUser.email} from '${oldRoleSlug}' to '${role_slug}'`,
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/users/:id — get a specific user's full profile
app.get('/api/admin/users/:id', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true, email: true, username: true, full_name: true,
        avatar_url: true, status: true, auth_provider: true,
        email_verified: true, created_at: true, last_login_at: true,
        failed_login_attempts: true, locked_until: true,
        subscription_id: true, is_deleted: true, deleted_at: true,
        role: true,
        _count: { select: { pdf_uploads: true, generated_pdfs: true, processing_jobs: true } }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/audit-logs — paginated audit log viewer
app.get('/api/admin/audit-logs', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const skip = (page - 1) * limit;
    const action_category = req.query.action_category as string | undefined;
    const severity = req.query.severity as string | undefined;

    const where: any = {};
    if (action_category) where.action_category = action_category;
    if (severity) where.severity = severity;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { email: true, full_name: true, role: true } }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/users/:id/subscription — override a user's subscription plan
app.patch('/api/admin/users/:id/subscription', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { subscription_id } = req.body;
    if (!subscription_id) return res.status(400).json({ error: "subscription_id is required" });

    const user = await prisma.user.findUnique({ where: { user_id: id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const oldSubscription = user.subscription_id;
    const updated = await prisma.user.update({
      where: { user_id: id },
      data: { subscription_id },
      select: { user_id: true, email: true, full_name: true, subscription_id: true }
    });

    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'user_subscription_change',
      action_category: 'commerce',
      table_name: 'User',
      record_id: id,
      old_values: { subscription_id: oldSubscription },
      new_values: { subscription_id },
      severity: 'info',
      api_endpoint: `/api/admin/users/${id}/subscription`,
      http_method: 'PATCH',
      notes: `Admin changed subscription for ${user.email} from '${oldSubscription}' to '${subscription_id}'`,
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/users/:id/send-coupon — send a coupon voucher to a user
app.patch('/api/admin/users/:id/send-coupon', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { coupon_code, is_custom, discount_type, discount_value, free_credits, description } = req.body;

    const user = await prisma.user.findUnique({ where: { user_id: id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("RECEIVED PAYLOAD:", req.body);
    console.log("is_custom is:", is_custom, "type:", typeof is_custom);

    let newCoupon;
    if (is_custom) {
      const firstName = (user.name || 'GIFT').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
      const creditsStr = free_credits ? free_credits.toString() : (discount_value ? `${discount_value}OFF` : 'VIP');
      let baseCode = `${firstName}${creditsStr}`;
      
      let uniqueCode = baseCode;
      let counter = 1;
      while (await prisma.coupon.findUnique({ where: { code: uniqueCode } })) {
        uniqueCode = `${baseCode}V${counter}`;
        counter++;
      }

      newCoupon = await prisma.coupon.create({
        data: {
          code: uniqueCode,
          discount_type: discount_type || 'none',
          discount_value: discount_value || 0,
          free_credits: free_credits || 0,
          description: description || `Custom Admin Voucher`,
          usage_limit: 1,
          assigned_user_id: user.user_id,
          is_active: true
        }
      });
    } else {
      if (!coupon_code) return res.status(400).json({ error: "coupon_code is required" });
      const coupon = await prisma.coupon.findUnique({ where: { code: coupon_code } });
      if (!coupon) return res.status(404).json({ error: "Coupon not found" });

      const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const uniqueCode = `${coupon.code}-${uniqueSuffix}`;

      newCoupon = await prisma.coupon.create({
        data: {
          code: uniqueCode,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          free_credits: coupon.free_credits,
          description: `Gift: ${coupon.description || 'Admin Voucher'}`,
          usage_limit: 1,
          assigned_user_id: user.user_id,
          is_active: true
        }
      });
    }

    // Create a notification so the user sees the coupon in their inbox
    await prisma.notification.create({
      data: {
        user_id: id,
        title: "🎟️ You received a new personal printing voucher!",
        message: `Admin sent you the voucher code: **${newCoupon.code}**. This code is strictly for your account and can be used once. Apply it at the Cost Estimator checkout.`,
        coupon_code: newCoupon.code,
      }
    });

    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'user_send_coupon',
      action_category: 'commerce',
      table_name: 'User',
      record_id: id,
      new_values: { coupon_code: newCoupon.code },
      severity: 'info',
      api_endpoint: `/api/admin/users/${id}/send-coupon`,
      http_method: 'PATCH',
      notes: `Admin generated and sent unique coupon '${newCoupon.code}' to ${user.email}`,
    });

    res.json({ success: true, message: `Unique coupon ${newCoupon.code} sent to ${user.email}` });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});


// POST /api/admin/users/:id/impersonate — generate a JWT for another user
app.post('/api/admin/users/:id/impersonate', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Admin cannot impersonate another admin/superadmin unless they are superadmin
    const targetUser = await prisma.user.findUnique({ where: { user_id: id }, include: { role: true } });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (targetUser.role?.role_slug === 'superadmin' && req.fullUser?.role?.role_slug !== 'superadmin') {
      return res.status(403).json({ error: "Cannot impersonate a superadmin." });
    }

    const token = jwt.sign({ id: targetUser.user_id, email: targetUser.email, impersonator: req.user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'user_impersonate',
      action_category: 'authentication',
      table_name: 'User',
      record_id: targetUser.user_id,
      severity: 'warning',
      api_endpoint: `/api/admin/users/${id}/impersonate`,
      http_method: 'POST',
      notes: `Admin impersonated user ${targetUser.email}`,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...userWithoutPassword } = targetUser;
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/jobs — view global jobs
app.get('/api/admin/jobs', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.processingJob.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { email: true, full_name: true } },
          preset: { select: { preset_name: true } }
        }
      }),
      prisma.processingJob.count()
    ]);

    res.json({
      jobs,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/jobs/:job_id/force-cancel — cancel a stuck job
app.post('/api/admin/jobs/:job_id/force-cancel', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { job_id } = req.params;
    const job = await prisma.processingJob.findUnique({ where: { job_id } });
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (['completed', 'cancelled', 'failed'].includes(job.job_status)) {
      return res.status(400).json({ error: `Job is already ${job.job_status}` });
    }

    const updated = await prisma.processingJob.update({
      where: { job_id },
      data: {
        job_status: 'cancelled',
        error_message: 'Forcefully cancelled by system administrator',
        completed_at: new Date()
      }
    });

    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'job_force_cancel',
      action_category: 'system',
      table_name: 'ProcessingJob',
      record_id: job_id,
      severity: 'warning',
      api_endpoint: `/api/admin/jobs/${job_id}/force-cancel`,
      http_method: 'POST',
      notes: `Admin force cancelled job ${job_id}`,
    });

    res.json({ success: true, job: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/system/health — deep system health check
app.get('/api/admin/system/health', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`; // Test DB connection
    const dbLatency = Date.now() - start;

    const memory = process.memoryUsage();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "connected",
        latency_ms: dbLatency
      },
      memory: {
        rss_mb: Math.round(memory.rss / 1024 / 1024),
        heap_total_mb: Math.round(memory.heapTotal / 1024 / 1024),
        heap_used_mb: Math.round(memory.heapUsed / 1024 / 1024)
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});


// ════════════════════════════════════════════════════════════════════════════
// LAYOUT PRESETS
// ════════════════════════════════════════════════════════════════════════════

// Free plan preset limit
const FREE_PLAN_PRESET_LIMIT = 3;

app.get('/api/presets', authenticateToken, async (req: any, res: any) => {
  try {
    const presets = await prisma.layoutPreset.findMany({
      where: {
        is_active: true,
        is_deleted: false,
        OR: [
          { preset_type: 'system' },
          { preset_type: 'shared' },
          { created_by: req.user.id }
        ]
      }
    });
    res.json(presets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/presets', authenticateToken, async (req: any, res: any) => {
  try {
    const { preset_name, preset_slug, pages_per_sheet, description } = req.body;
    if (!preset_name || !preset_slug || !pages_per_sheet) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Enforce free-plan preset limit (FR-PRESET-002)
    const existingCount = await prisma.layoutPreset.count({
      where: {
        created_by: req.user.id,
        preset_type: 'user_custom',
        is_deleted: false,
        is_active: true,
      }
    });

    // Get user subscription to check plan
    const user = await prisma.user.findUnique({ where: { user_id: req.user.id } });
    const isPro = user?.subscription_id && user.subscription_id !== 'plan-free';

    if (!isPro && existingCount >= FREE_PLAN_PRESET_LIMIT) {
      return res.status(403).json({
        error: `Free plan allows up to ${FREE_PLAN_PRESET_LIMIT} custom presets. Upgrade to Pro for unlimited presets.`
      });
    }

    const preset = await prisma.layoutPreset.create({
      data: {
        preset_name,
        preset_slug,
        pages_per_sheet,
        description,
        preset_type: 'user_custom',
        created_by: req.user.id
      }
    });
    res.status(201).json(preset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/presets/count', authenticateToken, async (req: any, res: any) => {
  try {
    const count = await prisma.layoutPreset.count({
      where: { created_by: req.user.id, preset_type: 'user_custom', is_deleted: false }
    });
    res.json({ count, limit: FREE_PLAN_PRESET_LIMIT });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/presets/:preset_id', authenticateToken, async (req: any, res: any) => {
  try {
    const preset = await prisma.layoutPreset.findUnique({
      where: { preset_id: req.params.preset_id }
    });
    if (!preset) return res.status(404).json({ error: "Preset not found" });
    if (preset.preset_type === 'user_custom' && preset.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(preset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put('/api/presets/:preset_id', authenticateToken, async (req: any, res: any) => {
  try {
    const preset_id = req.params.preset_id;
    const existing = await prisma.layoutPreset.findUnique({ where: { preset_id } });
    if (!existing) return res.status(404).json({ error: "Preset not found" });
    if (existing.preset_type === 'system' || existing.created_by !== req.user.id) {
      return res.status(403).json({ error: "Cannot modify this preset" });
    }
    const updated = await prisma.layoutPreset.update({ where: { preset_id }, data: req.body });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete('/api/presets/:preset_id', authenticateToken, async (req: any, res: any) => {
  try {
    const preset_id = req.params.preset_id;
    const existing = await prisma.layoutPreset.findUnique({ where: { preset_id } });
    if (!existing) return res.status(404).json({ error: "Preset not found" });
    if (existing.preset_type === 'system' || existing.created_by !== req.user.id) {
      return res.status(403).json({ error: "Cannot delete this preset" });
    }
    await prisma.layoutPreset.update({
      where: { preset_id },
      data: { is_deleted: true, is_active: false }
    });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PDF UPLOADS
// ════════════════════════════════════════════════════════════════════════════

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB — FR-UPLOAD-001

app.get('/api/uploads', authenticateToken, async (req: any, res: any) => {
  try {
    const uploads = await prisma.pdfUpload.findMany({
      where: { user_id: req.user.id, is_deleted: false },
      orderBy: { created_at: 'desc' },
      take: 10, // last 10 uploads
    });
    res.json(uploads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/uploads/initiate', authenticateToken, async (req: any, res: any) => {
  try {
    const { filename, file_size, mime_type, checksum_sha256 } = req.body;
    if (!filename || !file_size) return res.status(400).json({ error: "Missing filename or file_size" });

    // Server-side file size enforcement (FR-UPLOAD-001)
    if (file_size > MAX_FILE_SIZE_BYTES) {
      return res.status(413).json({
        error: `File too large. Maximum allowed size is 25MB. Your file is ${(file_size / 1024 / 1024).toFixed(1)}MB.`
      });
    }

    // MIME type check
    if (mime_type && mime_type !== 'application/pdf') {
      return res.status(400).json({ error: "Only PDF files are allowed." });
    }

    const storage_path = `uploads/${req.user.id}/${Date.now()}_${filename}`;

    const upload = await prisma.pdfUpload.create({
      data: {
        user_id: req.user.id,
        original_filename: filename,
        stored_filename: filename,
        storage_path,
        storage_provider: 's3',
        file_size_bytes: file_size,
        file_hash_sha256: checksum_sha256 || 'pending',
        mime_type: mime_type || 'application/pdf',
        upload_status: 'pending'
      }
    });

    res.json({
      upload_id: upload.upload_id,
      upload_url: `https://mock-s3-bucket.s3.amazonaws.com/${storage_path}?signature=mock`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/uploads/:upload_id', authenticateToken, async (req: any, res: any) => {
  try {
    const upload = await prisma.pdfUpload.findUnique({
      where: { upload_id: req.params.upload_id },
      include: { metadata: true }
    });
    if (!upload) return res.status(404).json({ error: "Upload not found" });
    if (upload.user_id !== req.user.id) return res.status(403).json({ error: "Access denied" });
    res.json(upload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// JOB LIMITS AND TRACKING
// ════════════════════════════════════════════════════════════════════════════

function calculateJobCost(pageCount: number, isAiRequested: boolean, isUnwatermarked: boolean): number {
  return Math.ceil(pageCount / 10) + (isAiRequested ? 5 : 0) + (isUnwatermarked ? 2 : 0);
}

app.post('/api/jobs/track', authenticateToken, async (req: any, res: any) => {
  try {
    const { pages_processed, is_ai_requested, is_unwatermarked, preset } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { user_id: req.user.id },
      include: { 
        subscriptions: {
          include: { plan: true },
          where: { status: 'active' },
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Fallback limit checking
    const activePlan = user.subscriptions[0]?.plan;
    const backendLimit = activePlan ? activePlan.max_pages_per_file : 40;

    // 0 means unlimited in the new tiers for Revision Elite
    if (backendLimit > 0 && pages_processed > backendLimit) {
      return res.status(403).json({
        error: `Limit Exceeded. Your plan allows ${backendLimit} pages, but you requested ${pages_processed}.`
      });
    }

    // Cost Deduction Logic
    const cost = calculateJobCost(pages_processed || 0, !!is_ai_requested, !!is_unwatermarked);
    
    if (user.credit_balance < cost) {
      return res.status(403).json({
        error: `Insufficient Credits. This job costs ${cost} credits, but you only have ${user.credit_balance} remaining.`
      });
    }

    // Deduct credits
    const updatedUser = await prisma.user.update({
      where: { user_id: user.user_id },
      data: { credit_balance: { decrement: cost } }
    });

    res.json({
      success: true,
      cost,
      remaining_credits: updatedUser.credit_balance,
      job: {
        id: "mock_job_id",
        user_id: user.user_id,
        pages_processed,
        preset,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// COMMERCE & SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════════════════

app.post('/api/commerce/buy-credits', authenticateToken, async (req: any, res: any) => {
  try {
    return res.status(501).json({ error: "Online payments are currently disabled. Please contact your administrator." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/subscriptions/plans', async (req: any, res: any) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' }
    });
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

app.post('/api/subscriptions/select', authenticateToken, async (req: any, res: any) => {
  try {
    const { plan_id, coupon_code } = req.body;
    if (!plan_id) return res.status(400).json({ error: "plan_id is required" });

    const plan = await prisma.subscriptionPlan.findUnique({ where: { plan_id } });
    if (!plan || !plan.is_active) {
      return res.status(404).json({ error: "Subscription plan not found or inactive" });
    }

    let discountApplied = false;

    if (coupon_code) {
      const coupon = await prisma.coupon.findUnique({ where: { code: coupon_code } });
      if (!coupon || !coupon.is_active || (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)) {
        return res.status(404).json({ error: "Invalid or expired coupon code" });
      }
      if (coupon.assigned_user_id && coupon.assigned_user_id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: This voucher belongs to a different user" });
      }
      
      const existingRedemption = await prisma.userCouponRedemption.findUnique({
        where: {
          user_id_coupon_code: { user_id: req.user.id, coupon_code: coupon.code }
        }
      });
      if (existingRedemption) {
        return res.status(403).json({ error: "Forbidden: You have already redeemed this voucher." });
      }

      if (coupon.assigned_user_id) {
        await prisma.coupon.delete({ where: { coupon_id: coupon.coupon_id } });
      } else {
        await prisma.coupon.update({
          where: { coupon_id: coupon.coupon_id },
          data: { used_count: coupon.used_count + 1 }
        });
      }

      await prisma.userCouponRedemption.create({
        data: { user_id: req.user.id, coupon_code: coupon.code }
      });
      discountApplied = true;
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: req.user.id },
      data: { plan_id: plan.plan_id }
    });

    await writeAuditLog({
      user_id: req.user.id,
      action_type: 'subscription_upgrade',
      action_category: 'commerce',
      table_name: 'User',
      record_id: req.user.id,
      new_values: { plan_id: plan.plan_id, coupon_used: coupon_code || null },
      severity: 'info',
      api_endpoint: '/api/subscriptions/select',
      http_method: 'POST',
      notes: `User upgraded to plan '${plan.name}'${discountApplied ? ` using coupon '${coupon_code}'` : ''}`,
    });

    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Error selecting plan:", error);
    res.status(500).json({ error: error.message || "Failed to select plan" });
  }
});

app.post('/api/admin/plans', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const plan = await prisma.subscriptionPlan.create({
      data: req.body
    });
    await writeAuditLog({
      user_id: req.user.id, action_type: 'CREATE', action_category: 'PLAN', table_name: 'SubscriptionPlan',
      record_id: plan.plan_id, new_values: plan, severity: 'warning'
    });
    res.json(plan);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/plans/:id', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const plan = await prisma.subscriptionPlan.update({
      where: { plan_slug: req.params.id },
      data: req.body
    });
    res.json(plan);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/plans/:id', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    await prisma.subscriptionPlan.delete({ where: { plan_slug: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Coupons logic
app.get('/api/admin/coupons', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { created_at: 'desc' }});
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/coupons', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.json(coupon);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/coupons/:id', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { coupon_id: req.params.id },
      data: req.body
    });
    res.json(coupon);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:id', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    await prisma.coupon.delete({ where: { coupon_id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/coupons/:code', async (req: any, res: any) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: req.params.code } });
    if (!coupon || !coupon.is_active || (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)) {
      return res.status(404).json({ error: "Invalid or expired coupon code" });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        if (coupon.assigned_user_id && decoded.id !== coupon.assigned_user_id) {
          return res.status(403).json({ error: "Forbidden: This voucher belongs to a different user" });
        }

        const existingRedemption = await prisma.userCouponRedemption.findUnique({
          where: {
            user_id_coupon_code: { user_id: decoded.id, coupon_code: coupon.code }
          }
        });
        if (existingRedemption) {
          return res.status(403).json({ error: "Forbidden: You have already redeemed this voucher." });
        }
      } catch (err) {
        if (coupon.assigned_user_id) return res.status(403).json({ error: "Forbidden: Invalid token" });
      }
    } else if (coupon.assigned_user_id) {
      return res.status(401).json({ error: "Unauthorized: Please log in to use this personal voucher" });
    }

    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/:code/redeem', authenticateToken, async (req: any, res: any) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: req.params.code } });
    if (!coupon || !coupon.is_active || (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)) {
      return res.status(404).json({ error: "Invalid or expired coupon code" });
    }

    if (coupon.assigned_user_id && coupon.assigned_user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: This voucher belongs to a different user" });
    }

    const existingRedemption = await prisma.userCouponRedemption.findUnique({
      where: {
        user_id_coupon_code: { user_id: req.user.id, coupon_code: coupon.code }
      }
    });
    if (existingRedemption) {
      return res.status(403).json({ error: "Forbidden: You have already redeemed this voucher." });
    }

    if (coupon.free_credits > 0) {
      const updatedUser = await prisma.user.update({
        where: { user_id: req.user.id },
        data: { credit_balance: { increment: coupon.free_credits } },
        select: { credit_balance: true }
      });

      if (coupon.assigned_user_id) {
        await prisma.coupon.delete({ where: { coupon_id: coupon.coupon_id } });
      } else {
        await prisma.coupon.update({
          where: { coupon_id: coupon.coupon_id },
          data: { used_count: { increment: 1 } }
        });
      }

      await prisma.userCouponRedemption.create({
        data: { user_id: req.user.id, coupon_code: coupon.code }
      });

      await writeAuditLog({
        user_id: req.user.id,
        action_type: 'redeem_coupon',
        action_category: 'commerce',
        table_name: 'User',
        record_id: req.user.id,
        new_values: { coupon_code: coupon.code, free_credits: coupon.free_credits, new_balance: updatedUser.credit_balance },
        severity: 'info',
        api_endpoint: `/api/coupons/${coupon.code}/redeem`,
        http_method: 'POST',
        notes: `User redeemed coupon '${coupon.code}' for ${coupon.free_credits} credits.`,
      });

      return res.json({ success: true, message: `Successfully claimed ${coupon.free_credits} credits!`, new_balance: updatedUser.credit_balance });
    } else {
      return res.status(400).json({ error: "This coupon does not provide free credits. Apply it at checkout instead." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS & COUPONS (User facing & Admin assigning)
// ════════════════════════════════════════════════════════════════════════════

app.post('/api/admin/users/:userId/send-coupon', authenticateToken, requireRole('admin'), async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { coupon_code } = req.body;
    
    const coupon = await prisma.coupon.findUnique({ where: { code: coupon_code } });
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });

    const notif = await prisma.notification.create({
      data: {
        user_id: userId,
        title: "You received a new printing voucher!",
        message: `Admin sent you a voucher: ${coupon.description}. Apply it at checkout.`,
        coupon_code: coupon.code
      }
    });
    res.json({ success: true, notification: notif });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/me/notifications', authenticateToken, async (req: any, res: any) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/me/notifications/:id/read', authenticateToken, async (req: any, res: any) => {
  try {
    const notif = await prisma.notification.update({
      where: { notification_id: req.params.id },
      data: { is_read: true }
    });
    res.json(notif);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS (User facing)
// ════════════════════════════════════════════════════════════════════════════

app.post('/api/subscriptions/select', authenticateToken, async (req: any, res: any) => {
  try {
    const { plan_id } = req.body;
    
    const plan = await prisma.subscriptionPlan.findUnique({ where: { plan_slug: plan_id } });
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    // Cancel old subscriptions
    await prisma.subscription.updateMany({
      where: { user_id: req.user.id, status: 'active' },
      data: { status: 'cancelled', cancelled_at: new Date() }
    });

    // Create new subscription
    const sub = await prisma.subscription.create({
      data: {
        user_id: req.user.id,
        plan_id: plan.plan_id,
        status: 'active',
        billing_cycle: plan.price_monthly > 0 ? 'monthly' : 'lifetime',
        current_period_start: new Date(),
        current_period_end: plan.price_monthly > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
      }
    });

    await prisma.user.update({
      where: { user_id: req.user.id },
      data: { subscription_id: plan.plan_id }
    });

    res.json({ success: true, subscription: sub });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/webhooks/stripe', async (req: any, res: any) => {
  try {
    const event = req.body;
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Payment received for session: ${session.id}`);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS / USER STATS
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/users/me/stats', authenticateToken, async (req: any, res: any) => {
  try {
    const user_id = req.user.id;
    const generatedPdfs = await prisma.generatedPdf.aggregate({
      where: { user_id, is_deleted: false },
      _sum: { total_pages_original: true, estimated_paper_saved: true }
    });
    const totalUploads = await prisma.pdfUpload.count({
      where: { user_id, is_deleted: false }
    });
    res.json({
      total_uploads: totalUploads,
      total_pages_processed: generatedPdfs._sum.total_pages_original || 0,
      total_paper_saved: generatedPdfs._sum.estimated_paper_saved || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// AI ROUTE
// ════════════════════════════════════════════════════════════════════════════

app.post("/api/notes/analyze", async (req, res) => {
  try {
    const { filename, pageCount, category, topic, sampleText } = req.body;

    const notesSummaryPrompt = `
      You are an expert academic print optimizer and layout strategist.
      Analyze the following student uploaded note document metadata and sample concepts:
      - Document Name: ${filename || "Study_Notes.pdf"}
      - Total Page Count: ${pageCount || 20}
      - Study Subject Category: ${category || "General Academic / Revision notes"}
      - Detailed Topic details: ${topic || "University notes description"}
      - Sample topics or text snippet: "${sampleText || "No sample extracted"}"

      Recommend one of the printable Imposition Layout presets that would optimize printing:
      1. "booklet" (for reading like a dense physical brochure, fits 4 booklet pages on 1 folded sheet)
      2. "makaut" (for compact exam lecture slides, 4 pages per sheet 2x2 grid, high compact margins)
      3. "gate" (extremely dense layout, 9 pages per sheet 3x3 grid, zero margins, high density reference manuals)
      4. "exam" (moderate layout, 6 pages per sheet 2x3 grid, for quick mid-term scanning sheets)
      5. "jee" (6 pages per sheet for JEE/NEET numerical heavy MCQ content)
      6. "custom" (general standard prints)

      Provide the recommendation in structured JSON format with:
      - presetRecommended: one of the strings: "booklet", "makaut", "gate", "exam", "jee", "custom"
      - explanation: a student-friendly explanation of why this preset saves paper and helps their revision.
      - compressionRatioAdvice: how much notes spacing they save.
      - estimatedPagesReduction: short summary (e.g., "Saves 15 physical sheets of paper")
      - cheatSheetSummary: an ultra-dense markdown-formatted "Pocket Revision Summary".
    `;

    const client = getGemini();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: notesSummaryPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["presetRecommended", "explanation", "compressionRatioAdvice", "estimatedPagesReduction", "cheatSheetSummary"],
          properties: {
            presetRecommended: { type: Type.STRING },
            explanation: { type: Type.STRING },
            compressionRatioAdvice: { type: Type.STRING },
            estimatedPagesReduction: { type: Type.STRING },
            cheatSheetSummary: { type: Type.STRING },
          },
        },
      },
    });

    const jsonText = response.text || "{}";
    const parsedData = JSON.parse(jsonText.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini optimization error:", error);
    return res.status(500).json({
      error: true,
      message: error.message || "Failed to parse notes with Gemini.",
      presetRecommended: "makaut",
      explanation: "We estimated an optimized 4-in-1 layout to compress your slide decks safely for active revision.",
      compressionRatioAdvice: "Reduces physical notes foot-print by 75% on standard duplex systems.",
      estimatedPagesReduction: "Saves 3 physical sheets of paper for every 4 pages.",
      cheatSheetSummary: "### Fallback Study Tips\n\n* **Active Recall:** Cover specific segments of your 2x2 grid to self-test.\n* **Key Concepts:** Condense math formulas onto cell horizontal margins.",
    });
  }
});

// Removed duplicate /api/jobs/track
// ════════════════════════════════════════════════════════════════════════════
// TERMINAL STARTUP DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

// ANSI color helpers — no external dep needed
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  // foreground
  white:   '\x1b[97m',
  gray:    '\x1b[90m',
  green:   '\x1b[92m',
  yellow:  '\x1b[93m',
  red:     '\x1b[91m',
  blue:    '\x1b[94m',
  cyan:    '\x1b[96m',
  magenta: '\x1b[95m',
  // background
  bgBlue:  '\x1b[44m',
  bgBlack: '\x1b[40m',
};

const ok   = `${c.green}●${c.reset}`;
const warn = `${c.yellow}●${c.reset}`;
const fail = `${c.red}●${c.reset}`;
const line = `${c.gray}${'─'.repeat(54)}${c.reset}`;

function statusRow(icon: string, label: string, value: string, note = '') {
  const padLabel = label.padEnd(20);
  const noteStr = note ? `  ${c.dim}${c.gray}(${note})${c.reset}` : '';
  console.log(`  ${icon}  ${c.bold}${padLabel}${c.reset}  ${value}${noteStr}`);
}

async function printStartupDashboard(port: number, mode: string) {
  // ── DB health check ───────────────────────────────────────────────────────
  let dbStatus = { ok: false, label: '', note: '' };
  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbUrl = process.env.DATABASE_URL || '';
    const dbFile = dbUrl.includes('sqlite') ? dbUrl.split('/').pop()?.split('?')[0] || 'SQLite'
                 : dbUrl.split('@').pop()?.split('/').pop()?.split('?')[0] || 'Connected';
    dbStatus = { ok: true, label: `${c.green}Connected${c.reset}`, note: dbFile };
  } catch {
    dbStatus = { ok: false, label: `${c.red}DISCONNECTED${c.reset}`, note: 'Check DATABASE_URL' };
  }

  // ── Get LAN IP ────────────────────────────────────────────────────────────
  let lanIp = '0.0.0.0';
  try {
    const { networkInterfaces } = await import('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          lanIp = net.address;
          break;
        }
      }
      if (lanIp !== '0.0.0.0') break;
    }
  } catch { /* ignore */ }

  console.log();
  console.log(`  ${c.bold}${c.bgBlue}${c.white}  IMPOSIFY  ${c.reset}${c.bold}  Smart Notes Printer${c.reset}  ${c.gray}v2.1${c.reset}`);
  console.log(`  ${line}`);

  // ── Server + Frontend ────────────────────────────────────────────────────
  statusRow(ok, 'Frontend (App)',
    `${c.bold}${c.cyan}http://localhost:${port}${c.reset}`,
    mode === 'production' ? 'PROD build' : 'DEV / Vite HMR live reload');
  statusRow(ok, 'API Server',
    `${c.cyan}http://localhost:${port}/api${c.reset}`,
    'Express REST backend');
  statusRow(ok, 'Network (LAN)',
    `${c.cyan}http://${lanIp}:${port}${c.reset}`,
    'share with devices on same Wi-Fi');

  console.log(`  ${line}`);

  // ── Database ────────────────────────────────────────────────────────────────
  statusRow(
    dbStatus.ok ? ok : fail,
    'Database (Prisma)',
    dbStatus.label,
    dbStatus.note
  );

  console.log(`  ${line}`);

  // ── Third-party services ───────────────────────────────────────────────────
  const geminiKey  = process.env.GEMINI_API_KEY;
  const googleId   = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const stripeKey  = process.env.STRIPE_SECRET_KEY;
  const jwtDefault = process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === '';

  statusRow(
    geminiKey ? ok : warn,
    'Gemini AI',
    geminiKey ? `${c.green}Online${c.reset}` : `${c.yellow}Offline${c.reset}`,
    geminiKey ? `key •••${geminiKey.slice(-4)}` : 'GEMINI_API_KEY not set'
  );
  statusRow(
    googleId && googleId !== 'dummy_client_id' ? ok : warn,
    'Google OAuth',
    googleId && googleId !== 'dummy_client_id' ? `${c.green}Configured${c.reset}` : `${c.yellow}Disabled${c.reset}`,
    googleId && googleId !== 'dummy_client_id' ? `•••${googleId.slice(-6)}` : 'VITE_GOOGLE_CLIENT_ID not set'
  );
  statusRow(
    stripeKey ? ok : warn,
    'Stripe Webhooks',
    stripeKey ? `${c.green}Configured${c.reset}` : `${c.yellow}Offline${c.reset}`,
    stripeKey ? `key •••${stripeKey.slice(-4)}` : 'STRIPE_SECRET_KEY not set'
  );

  console.log(`  ${line}`);

  // ── Security & Config ──────────────────────────────────────────────────────
  statusRow(
    jwtDefault ? warn : ok,
    'JWT Secret',
    jwtDefault ? `${c.yellow}Default key${c.reset}` : `${c.green}Custom key set${c.reset}`,
    jwtDefault ? 'JWT_SECRET not set — change in production!' : 'from JWT_SECRET env'
  );
  const rateMax = mode === 'production' ? 100 : 500;
  statusRow(ok, 'Rate Limiter',
    `${c.green}Active${c.reset}`,
    `${rateMax} req / 15 min per IP`);
  statusRow(ok, 'Helmet (Security)',
    `${c.green}Active${c.reset}`,
    'CSP off for Vite HMR');
  statusRow(ok, 'CORS',
    `${c.green}Open${c.reset}`,
    mode === 'production' ? 'restrict origins in prod' : 'all origins allowed');

  console.log(`  ${line}`);

  // ── Environment ────────────────────────────────────────────────────────────
  statusRow(ok, 'Node Version',
    `${c.white}${process.version}${c.reset}`);
  statusRow(ok, 'Environment',
    mode === 'production'
      ? `${c.red}${c.bold}PRODUCTION${c.reset}`
      : `${c.yellow}${c.bold}DEVELOPMENT${c.reset}`,
    `NODE_ENV=${mode}`);
  statusRow(ok, 'PID',
    `${c.white}${process.pid}${c.reset}`,
    'use kill <PID> to stop');

  console.log(`  ${line}`);
  console.log(`  ${c.dim}${c.gray}Started at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST${c.reset}`);
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// VITE / STATIC SERVING
// ════════════════════════════════════════════════════════════════════════════

async function setupVite() {
  const mode = process.env.NODE_ENV || 'development';

  if (mode !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // Do not serve HTML fallback for API routes
      if (url.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }

      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        // Inject React Fast Refresh Preamble manually for custom server
        const reactPreamble = `
    <script type="module">
      import RefreshRuntime from '/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`;
        template = template.replace('</head>', `${reactPreamble}\n  </head>`);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    await printStartupDashboard(PORT, mode);
  });
}

setupVite().catch((err) => {
  console.error(`\n${c.red}✖  Fatal: Failed to start server${c.reset}`);
  console.error(err);
  process.exit(1);
});

