/**
 * InputValidator — V8.0
 * Centralised input sanitisation and validation helpers.
 * Used across forms to prevent XSS, injection, and malformed data.
 */

// ─── Sanitisation ─────────────────────────────────────────────────────────────

/**
 * Strip HTML tags and escape special characters.
 * Use for all user-supplied text before storing or displaying.
 */
export function sanitizeText(value: unknown): string {
  const str = String(value ?? '').trim();
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;');
}

/**
 * Strip all HTML tags (for display in plain-text contexts).
 */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Truncate a string to a maximum length, appending an ellipsis if needed.
 */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 1) + '…';
}

/**
 * Normalise whitespace: trim and collapse multiple spaces/newlines.
 */
export function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/** Require a non-empty string after trimming. */
export function requireNonEmpty(value: string, fieldName = 'Field'): ValidationResult {
  if (!value.trim()) return { ok: false, error: `${fieldName} is required.` };
  return { ok: true };
}

/** Validate an email address format. */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: 'Email is required.' };
  // RFC-5321 simplified pattern
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(trimmed)) return { ok: false, error: 'Enter a valid email address.' };
  return { ok: true };
}

/** Validate a URL (http or https only). */
export function validateUrl(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: 'URL is required.' };
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { ok: false, error: 'URL must start with http:// or https://.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Enter a valid URL.' };
  }
}

/** Validate minimum and maximum string length. */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName = 'Field'
): ValidationResult {
  const len = value.trim().length;
  if (len < min) return { ok: false, error: `${fieldName} must be at least ${min} characters.` };
  if (len > max) return { ok: false, error: `${fieldName} must be at most ${max} characters.` };
  return { ok: true };
}

/** Validate a password (min 8 chars, at least one digit). */
export function validatePassword(value: string): ValidationResult {
  if (value.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!/\d/.test(value)) return { ok: false, error: 'Password must contain at least one number.' };
  return { ok: true };
}

/** Ensure two values match (e.g., password confirmation). */
export function validateMatch(a: string, b: string, fieldName = 'Passwords'): ValidationResult {
  if (a !== b) return { ok: false, error: `${fieldName} do not match.` };
  return { ok: true };
}

/**
 * Validate a localStorage key name — alphanumeric, hyphens, underscores only.
 * Prevents path traversal or injection via dynamic storage keys.
 */
export function validateStorageKey(key: string): ValidationResult {
  if (!key) return { ok: false, error: 'Storage key is required.' };
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return { ok: false, error: 'Storage key must contain only letters, numbers, hyphens, or underscores.' };
  }
  if (key.length > 128) return { ok: false, error: 'Storage key is too long.' };
  return { ok: true };
}

/**
 * Validate JSON size before parsing (prevents memory exhaustion).
 */
export function validateJsonSize(
  raw: string,
  maxBytes = 5 * 1024 * 1024 // 5 MB default
): ValidationResult {
  const size = new Blob([raw]).size;
  if (size > maxBytes) {
    return { ok: false, error: `Data is too large (${(size / 1024).toFixed(0)} KB, max ${(maxBytes / 1024).toFixed(0)} KB).` };
  }
  return { ok: true };
}

// ─── Batch validation ─────────────────────────────────────────────────────────

/**
 * Run multiple validations in order and return the first failure,
 * or { ok: true } if all pass.
 */
export function validate(...results: ValidationResult[]): ValidationResult {
  for (const r of results) {
    if (!r.ok) return r;
  }
  return { ok: true };
}
