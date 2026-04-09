/**
 * MILP Rate Limiting Middleware
 * Prevents DoS attacks and abuse
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // General API rate limit
  api: { windowMs: 60 * 1000, maxRequests: 100 },      // 100 req/min
  
  // Write operations - stricter limit
  write: { windowMs: 60 * 1000, maxRequests: 30 },     // 30 req/min
  
  // Authentication endpoints - very strict
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 req/15min
  
  // Seed endpoint - very limited
  seed: { windowMs: 60 * 60 * 1000, maxRequests: 5 },  // 5 req/hour
} as const;

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

// Default key generator - uses IP + User-Agent
function defaultKeyGenerator(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.slice(0, 50)}`;
}

// Check rate limit for a request
export function checkRateLimit(
  req: NextRequest, 
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = (config.keyGenerator || defaultKeyGenerator)(req);
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + config.windowMs };
    rateLimitStore.set(key, entry);
  }
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  // Increment count
  entry.count++;
  
  return { allowed: true, remaining: remaining - 1, resetTime: entry.resetTime };
}

// Rate limit middleware wrapper
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const result = checkRateLimit(req, config);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000)),
          }
        }
      );
    }
    
    const response = await handler(req);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));
    
    return response;
  };
}

// Combined rate limit + auth middleware
export function withProtectedRoute(
  config: RateLimitConfig,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // First check rate limit
    const rateResult = checkRateLimit(req, config);
    
    if (!rateResult.allowed) {
      const retryAfter = Math.ceil((rateResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED', retryAfter },
        { 
          status: 429,
          headers: { 'Retry-After': String(retryAfter) }
        }
      );
    }
    
    // Then check auth (import dynamically to avoid circular deps)
    const { getAuthUser } = await import('./auth');
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const response = await handler(req, user);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(rateResult.remaining));
    
    return response;
  };
}
