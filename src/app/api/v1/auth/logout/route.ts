/**
 * MILP V1 Auth API - Logout Endpoint
 * POST /api/v1/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // In production with Clerk, sessions are managed by Clerk
  // In demo mode, we just return success
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  }, { status: 200 });
}
