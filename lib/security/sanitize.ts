// ── Input Sanitization (XSS Prevention) ──

/** Escape HTML entities to prevent XSS */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char] || char);
}

/** Strip all HTML tags from input */
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Sanitize a form field value: strip tags + escape */
export function sanitizeInput(input: string): string {
  return sanitizeHtml(stripTags(input.trim()));
}

/** Detect potential script injection */
export function containsScriptInjection(input: string): boolean {
  const patterns = [
    /<script[\s>]/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\.\w/i,
    /window\.\w/i,
  ];
  return patterns.some((p) => p.test(input));
}
