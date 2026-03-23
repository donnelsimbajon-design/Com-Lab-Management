// ── JWT Simulation & Session Management ──
// Simulates JWT-based auth: token generation, verification, and auto-expiry.

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const TOKEN_PREFIX = 'clc_jwt_';

export interface JWTPayload {
  userId: string;
  role: string;
  schoolId: string;
  iat: number;  // issued at
  exp: number;  // expiration
}

// Simulate hashing (base64 encode, NOT real crypto — simulation only)
const encode = (data: string): string =>
  typeof btoa !== 'undefined' ? btoa(data) : Buffer.from(data).toString('base64');
const decode = (token: string): string =>
  typeof atob !== 'undefined' ? atob(token) : Buffer.from(token, 'base64').toString();

/** Generate a simulated JWT token */
export function generateToken(userId: string, role: string, schoolId: string): string {
  const now = Date.now();
  const payload: JWTPayload = {
    userId,
    role,
    schoolId,
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };
  return TOKEN_PREFIX + encode(JSON.stringify(payload));
}

/** Verify and decode a simulated JWT token */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!token.startsWith(TOKEN_PREFIX)) return null;
    const raw = token.slice(TOKEN_PREFIX.length);
    const payload: JWTPayload = JSON.parse(decode(raw));
    // Check expiration
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Refresh a token (extend session) */
export function refreshToken(token: string): string | null {
  const payload = verifyToken(token);
  if (!payload) return null;
  return generateToken(payload.userId, payload.role, payload.schoolId);
}

/** Check if a token is expired */
export function isTokenExpired(token: string): boolean {
  const payload = verifyToken(token);
  return payload === null;
}

/** Simulated password hashing (SHA-256 would be used in production) */
export function hashPassword(plain: string): string {
  // Simulate hash: reverse + base64
  return encode(plain.split('').reverse().join('') + '_hashed');
}

/** Validate password strength */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least 1 uppercase letter.' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least 1 number.' };
  return { valid: true, message: 'Password meets requirements.' };
}

/** Get remaining session time in minutes */
export function getSessionTimeRemaining(token: string): number {
  const payload = verifyToken(token);
  if (!payload) return 0;
  return Math.max(0, Math.round((payload.exp - Date.now()) / 60000));
}
