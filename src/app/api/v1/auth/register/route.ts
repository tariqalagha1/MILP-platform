/**
 * MILP V1 Auth API - Registration Endpoint
 * POST /api/v1/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Registration schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  organizationName: z.string().min(2, 'Organization name required').optional(),
});

// Response types
interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
    organizationId?: string;
  };
  token?: string;
  refreshToken?: string;
  error?: string;
  code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  const requestId = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      }, { status: 400 });
    }

    const { email, password, name, organizationName } = validation.data;

    // Check if using Clerk (production) or demo mode
    const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const isClerkConfigured = clerkPubKey && 
      !clerkPubKey.includes('placeholder') &&
      clerkSecretKey && 
      !clerkSecretKey.includes('placeholder');

    if (isClerkConfigured) {
      // Production mode: Use Clerk API
      try {
        const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: [email],
            password,
            first_name: name?.split(' ')[0],
            last_name: name?.split(' ').slice(1).join(' '),
            public_metadata: {
              role: 'standard_user',
            },
          }),
        });

        if (!clerkResponse.ok) {
          const error = await clerkResponse.json();
          if (error.errors?.[0]?.code === 'form_identifier_exists') {
            return NextResponse.json({
              success: false,
              error: 'Email already registered',
              code: 'EMAIL_EXISTS',
            }, { status: 409 });
          }
          throw new Error(error.errors?.[0]?.message || 'Clerk registration failed');
        }

        const user = await clerkResponse.json();

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email_addresses[0]?.email_address,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            role: 'standard_user',
          },
        }, { status: 201 });

      } catch (clerkError) {
        console.error(`[${requestId}] Clerk registration error:`, clerkError);
        return NextResponse.json({
          success: false,
          error: 'Registration service unavailable',
          code: 'AUTH_SERVICE_ERROR',
        }, { status: 503 });
      }
    }

    // Demo mode: Return mock successful registration
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: 'admin' as const,
      organizationId: 'demo-org',
    };

    // Generate mock tokens
    const mockToken = Buffer.from(JSON.stringify({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    })).toString('base64');

    const mockRefreshToken = Buffer.from(JSON.stringify({
      sub: mockUser.id,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
    })).toString('base64');

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken,
    }, { status: 201 });

  } catch (error) {
    console.error(`[${requestId}] Registration error:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
}
