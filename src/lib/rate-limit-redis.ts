/**
 * MILP Redis Rate Limiting
 * Production-ready distributed rate limiting with Upstash Redis
 */

import { NextRequest, NextResponse } from 'next/server';

// Check if Redis is configured
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const isRedisConfigured = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN;

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
  prefix?: string;
}

export const RATE_LIMITS = {
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  write: { windowMs: 60 * 1000, maxRequests: 30 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  seed: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
} as const;

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up memory store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}, 60 * 1000);

// Default key generator
function defaultKeyGenerator(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             req.headers.get('cf-connecting-ip') ||
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.slice(0, 50)}`;
}

// Redis rate limit check using REST API
async function redisRateLimit(
  key: string, 
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const resetTime = now + config.windowMs;
  const window = Math.floor(now / config.windowMs);
  const redisKey = `${config.prefix || 'ratelimit'}:${key}:${window}`;

  try {
    // Use Upstash Redis REST API
    const response = await fetch(`${UPSTASH_REDIS_REST_URL}/incr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: redisKey }),
    });

    if (!response.ok) {
      console.error('Redis rate limit error:', response.status);
      // Fallback to allowing request on Redis failure
      return { allowed: true, remaining: config.maxRequests, resetTime };
    }

    const data = await response.json();
    const count = parseInt(data.result, 10);

    // Set expiry on first request
    if (count === 1) {
      await fetch(`${UPSTASH_REDIS_REST_URL}/expire`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key: redisKey, 
          seconds: Math.ceil(config.windowMs / 1000) 
        }),
      });
    }

    const remaining = Math.max(0, config.maxRequests - count);

    return {
      allowed: count <= config.maxRequests,
      remaining,
      resetTime,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // On error, allow request to avoid blocking all traffic
    return { allowed: true, remaining: config.maxRequests, resetTime };
  }
}

// Memory-based rate limit (development fallback)
function memoryRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + config.windowMs };
    memoryStore.set(key, entry);
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;

  return { allowed: true, remaining: remaining - 1, resetTime: entry.resetTime };
}

// Main rate limit check function
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = (config.keyGenerator || defaultKeyGenerator)(req);

  if (isRedisConfigured) {
    return redisRateLimit(key, config);
  }

  return memoryRateLimit(key, config);
}

// Rate limit middleware wrapper
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const result = await checkRateLimit(req, config);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000)),
            'X-RateLimit-Backend': isRedisConfigured ? 'redis' : 'memory',
          },
        }
      );
    }

    const response = await handler(req);

    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));
    response.headers.set('X-RateLimit-Backend', isRedisConfigured ? 'redis' : 'memory');

    return response;
  };
}

// Combined rate limit + auth middleware
export function withProtectedRoute(
  config: RateLimitConfig,
  handler: (req: NextRequest, user: unknown) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const rateResult = await checkRateLimit(req, config);

    if (!rateResult.allowed) {
      const retryAfter = Math.ceil((rateResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED', retryAfter },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }

    const { getAuthUser } = await import('./auth');
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const response = await handler(req, user);

    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(rateResult.remaining));
    response.headers.set('X-RateLimit-Backend', isRedisConfigured ? 'redis' : 'memory');

    return response;
  };
}

// Export backend status for health check
export function getRateLimitBackend(): 'redis' | 'memory' {
  return isRedisConfigured ? 'redis' : 'memory';
}
