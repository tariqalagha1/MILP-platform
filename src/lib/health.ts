/**
 * MILP Health and Observability Endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

// Health check - basic liveness probe
export async function GET_health() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
}

// Readiness check - includes dependency checks
export async function GET_readiness() {
  const checks: Record<string, { status: string; latency?: number; backend?: string }> = {};
  
  // Check database (mock Prisma)
  const dbStart = Date.now();
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.claim.count({ where: {} });
    checks.database = { 
      status: 'healthy', 
      latency: Date.now() - dbStart 
    };
  } catch (error) {
    checks.database = { status: 'unhealthy' };
  }
  
  // Check auth configuration
  const { isAuthConfigured, isDemoMode } = await import('@/lib/auth');
  const authConfigured = isAuthConfigured();
  checks.auth = { 
    status: authConfigured ? 'configured' : (isDemoMode() ? 'demo_mode' : 'unhealthy')
  };

  // Check rate limit backend
  try {
    const { getRateLimitBackend } = await import('@/lib/rate-limit-redis');
    const backend = getRateLimitBackend();
    checks.rateLimit = {
      status: 'healthy',
      backend,
    };
  } catch {
    checks.rateLimit = { status: 'healthy', backend: 'memory' };
  }

  // Check observability
  try {
    const { isSentryConfigured } = await import('@/lib/observability');
    checks.observability = {
      status: isSentryConfigured() ? 'configured' : 'console_only',
    };
  } catch {
    checks.observability = { status: 'console_only' };
  }
  
  // Overall status
  const allHealthy = Object.values(checks).every(c => c.status !== 'unhealthy');
  
  return NextResponse.json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  }, { 
    status: allHealthy ? 200 : 503 
  });
}
