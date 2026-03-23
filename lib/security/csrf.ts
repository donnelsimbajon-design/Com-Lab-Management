// ── CSRF Token Simulation ──

let csrfToken: string | null = null;

function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/** Generate a new CSRF token */
export function generateCsrfToken(): string {
  csrfToken = `csrf_${randomHex(32)}`;
  return csrfToken;
}

/** Validate a CSRF token against the stored one */
export function validateCsrfToken(token: string): boolean {
  if (!csrfToken) return false;
  return token === csrfToken;
}

/** Get the current CSRF token */
export function getCsrfToken(): string {
  if (!csrfToken) return generateCsrfToken();
  return csrfToken;
}

/** Clear the CSRF token (on logout) */
export function clearCsrfToken(): void {
  csrfToken = null;
}
