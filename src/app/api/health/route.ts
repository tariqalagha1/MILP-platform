import { GET_health, GET_readiness } from '@/lib/health';
import { NextRequest } from 'next/server';

// GET /api/health - Liveness probe
export async function GET(request: NextRequest) {
  return GET_health();
}
