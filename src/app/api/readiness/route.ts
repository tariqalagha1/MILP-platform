import { NextRequest } from 'next/server';
import { GET_readiness } from '@/lib/health';

// GET /api/readiness - Readiness probe with dependency checks
export async function GET(request: NextRequest) {
  return GET_readiness();
}
