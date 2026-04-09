/**
 * MILP V1 Release Info Endpoint
 * GET /api/v1/release
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '0.1.0',
    releaseTag: 'v0.1.0-rc.1',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      auth: {
        v1: true,
        clerk: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder')),
      },
      backup: true,
      rbac: true,
      rateLimit: {
        enabled: true,
        backend: (process.env.UPSTASH_REDIS_REST_URL ? 'redis' : 'memory'),
      },
      observability: {
        enabled: !!(process.env.NEXT_PUBLIC_SENTRY_DSN),
      },
    },
    rollbackArtifact: {
      available: true,
      previousTag: 'v0.0.9',
    },
  }, { status: 200 });
}
