import { SECURITY_HEADERS, CSP_DIRECTIVES } from '@/config/security';

// Generate Content Security Policy string
function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Apply security headers to response
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Add Content Security Policy
  headers.set('Content-Security-Policy', generateCSP());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Security middleware for Edge functions
export function securityMiddleware(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      const response = await handler(req);
      return applySecurityHeaders(response);
    } catch (error) {
      // Log desabilitado: Security middleware error
      
      // Return secure error response
      const errorResponse = new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...SECURITY_HEADERS,
            'Content-Security-Policy': generateCSP()
          }
        }
      );
      
      return errorResponse;
    }
  };
}

// Input sanitization utility
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Rate limiting utility
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute