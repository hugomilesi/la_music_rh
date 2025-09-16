// Security configuration for the application

// Content Security Policy
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://api.resend.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 10,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false
};

// Password policy
export const PASSWORD_POLICY = {
  MIN_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  FORBIDDEN_PATTERNS: [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i
  ]
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// Sanitization configuration
export const SANITIZATION_CONFIG = {
  ALLOWED_HTML_TAGS: [],
  REMOVE_SCRIPTS: true,
  ESCAPE_HTML: true
};

// Session configuration
export const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  SECURE: process.env.NODE_ENV === 'production',
  HTTP_ONLY: true,
  SAME_SITE: 'strict' as const
};

// CORS configuration
export const CORS_CONFIG = {
  PRODUCTION_ORIGINS: [
    'https://your-production-domain.com',
    'https://www.your-production-domain.com'
  ],
  DEVELOPMENT_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:8085/'
  ],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'apikey',
    'x-client-info'
  ],
  CREDENTIALS: true,
  MAX_AGE: 86400 // 24 hours
};

// Logging configuration
export const LOGGING_CONFIG = {
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  LOG_SENSITIVE_DATA: false,
  MAX_LOG_SIZE: '10MB',
  MAX_FILES: 5
};