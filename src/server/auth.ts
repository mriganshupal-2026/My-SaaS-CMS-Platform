import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { dbQueries } from './db';
import type { User, UserRole } from '../types/cms';

const AUTH_SECRET = process.env.AUTH_SECRET || 'viralmuse_super_secret_auth_key_2026_x89f!';
const COOKIE_NAME = 'viralmuse_cms_session';

export interface SessionPayload {
  userId: string;
  username: string;
  role: UserRole;
  exp: number;
}

/**
 * Creates a signed session token
 */
export function createSessionToken(user: User): string {
  // 7-day expiration
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (_) {
    return null;
  }
}

/**
 * Express Middleware: requires authenticated CMS user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  const user = dbQueries.getUserById(session.userId);
  if (!user || !user.isActive) {
    res.status(403).json({ error: 'User account is inactive or not found.' });
    return;
  }

  // Attach authenticated user to request
  (req as any).user = user;
  next();
}

/**
 * Set HTTP-Only session cookie
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
