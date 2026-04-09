/**
 * MILP V1 Auth API - Token Refresh Endpoint
 * POST /api/v1/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Refresh schema
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `refresh-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    const body = await request.json().catch(() => ({}));
    const validation = refreshSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Refresh token required',
        code: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    const { refreshToken } = validation.data;

    // Check if using Clerk (production) or demo mode
    const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const isClerkConfigured = clerkPubKey && 
      !clerkPubKey.includes('placeholder') &&
      clerkSecretKey && 
      !clerkSecretKey.includes('placeholder');

    if (isClerkConfigured) {
      // Production: Use Clerk session API
      return NextResponse.json({
        success: false,
        error: 'Use Clerk SDK for session management',
        code: 'USE_CLERK_SDK',
      }, { status: 400 });
    }

    // Demo mode: Validate and refresh mock token
    try {
      const decoded = JSON.parse(Buffer.from(refreshToken, 'base64').toString());
      
      if (decoded.type !== 'refresh') {
        return NextResponse.json({
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_TOKEN',
        }, { status: 401 });
      }

      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({
          success: false,
          error: 'Refresh token expired',
          code: 'TOKEN_EXPIRED',
        }, { status: 401 });
      }

      // Generate new access token
      const newToken = Buffer.from(JSON.stringify({
        sub: decoded.sub,
        email: 'demo@milp.local',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })).toString('base64');

      // Generate new refresh token
      const newRefreshToken = Buffer.from(JSON.stringify({
        sub: decoded.sub,
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 604800,
      })).toString('base64');

      return NextResponse.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
      }, { status: 200 });

    } catch (decodeError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN',
      }, { status: 401 });
    }

  } catch (error) {
    console.error(`[${requestId}] Refresh error:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
}
