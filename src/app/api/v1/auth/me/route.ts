/**
 * MILP V1 Auth API - Current User Endpoint
 * GET /api/v1/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authorization required',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Check if using Clerk (production) or demo mode
    const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const isClerkConfigured = clerkPubKey && 
      !clerkPubKey.includes('placeholder') &&
      clerkSecretKey && 
      !clerkSecretKey.includes('placeholder');

    if (isClerkConfigured) {
      // Production: Validate with Clerk
      const { auth, currentUser } = await import('@clerk/nextjs/server');
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: 'Invalid session',
          code: 'UNAUTHORIZED',
        }, { status: 401 });
      }

      const user = await currentUser();
      
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email: user?.emailAddresses[0]?.emailAddress,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          role: user?.publicMetadata?.role || 'standard_user',
          organizationId: user?.publicMetadata?.organizationId,
        },
      }, { status: 200 });
    }

    // Demo mode: Decode mock token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          organizationId: 'demo-org',
        },
      }, { status: 200 });

    } catch (decodeError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Auth me error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }, { status: 500 });
  }
}
