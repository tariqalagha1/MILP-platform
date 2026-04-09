/**
 * MILP V1 Auth API - Login Endpoint
 * POST /api/v1/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `login-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    const body = await request.json().catch(() => ({}));
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
        code: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Check if using Clerk (production) or demo mode
    const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const isClerkConfigured = clerkPubKey && 
      !clerkPubKey.includes('placeholder') &&
      clerkSecretKey && 
      !clerkSecretKey.includes('placeholder');

    if (isClerkConfigured) {
      // Production: Clerk handles auth via frontend SDK
      // This endpoint is for API-only authentication
      return NextResponse.json({
        success: false,
        error: 'Use Clerk frontend SDK for authentication',
        code: 'USE_CLERK_SDK',
        signInUrl: '/sign-in',
      }, { status: 400 });
    }

    // Demo mode: Accept any credentials
    const mockUser = {
      id: 'demo-user',
      email,
      name: 'Demo User',
      role: 'admin' as const,
      organizationId: 'demo-org',
    };

    const mockToken = Buffer.from(JSON.stringify({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      exp: Math.floor(Date.now() / 1000) + 3600,
    })).toString('base64');

    const mockRefreshToken = Buffer.from(JSON.stringify({
      sub: mockUser.id,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 604800,
    })).toString('base64');

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken,
      expiresIn: 3600,
    }, { status: 200 });

  } catch (error) {
    console.error(`[${requestId}] Login error:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
}
