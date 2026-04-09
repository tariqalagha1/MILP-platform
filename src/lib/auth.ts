/**
 * MILP Authentication Utilities
 * Provides auth helpers for API route protection
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// User roles for RBAC
export type UserRole = 'admin' | 'manager' | 'standard_user' | 'guest';

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  manager: 75,
  standard_user: 50,
  guest: 25,
};

// Check if Clerk is properly configured
export function isAuthConfigured(): boolean {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  return !!(
    clerkPubKey && 
    !clerkPubKey.includes('placeholder') &&
    clerkSecretKey &&
    !clerkSecretKey.includes('placeholder')
  );
}

// Get current authenticated user or return null
export async function getAuthUser() {
  if (!isAuthConfigured()) {
    // Demo mode - return mock user
    return {
      id: 'demo-user',
      role: 'admin' as UserRole,
      organizationId: 'demo-org',
      email: 'demo@milp.local',
      name: 'Demo User',
    };
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    // Get role from user metadata or default to standard_user
    const role = (user.publicMetadata?.role as UserRole) || 'standard_user';
    
    return {
      id: userId,
      role,
      organizationId: (user.publicMetadata?.organizationId as string) || null,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Require authentication - throws if not authenticated
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { user };
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Require specific role - returns error if insufficient permissions
export async function requireRole(requiredRole: UserRole) {
  const authResult = await requireAuth();
  if ('error' in authResult) return authResult;

  if (!hasRole(authResult.user.role, requiredRole)) {
    return { 
      error: `Forbidden: Requires ${requiredRole} role`, 
      status: 403 
    };
  }

  return { user: authResult.user };
}

// Middleware wrapper for API routes
export function withAuth(
  handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    return handler(req, user);
  };
}

// Middleware wrapper for role-protected routes
export function withRole(
  requiredRole: UserRole,
  handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    if (!hasRole(user.role, requiredRole)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    return handler(req, user);
  };
}

// Demo mode check - for development without auth
export function isDemoMode(): boolean {
  return !isAuthConfigured();
}
