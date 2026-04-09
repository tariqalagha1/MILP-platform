import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if Clerk is configured
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const isClerkConfigured = clerkPubKey && 
  !clerkPubKey.includes('placeholder') &&
  clerkSecretKey && 
  !clerkSecretKey.includes('placeholder');

// Production check
const isProduction = process.env.NODE_ENV === 'production';

// Security headers to add to all responses
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Add HSTS in production
if (isProduction) {
  securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// HTTPS redirect in production
function enforceHttps(request: NextRequest): NextResponse | null {
  const isHttps = request.headers.get('x-forwarded-proto') === 'https';
  
  if (isProduction && !isHttps && request.headers.get('host') !== 'localhost') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`, 301);
  }
  
  return null;
}

// Main middleware
export default isClerkConfigured 
  ? clerkMiddleware()
  : function middleware(request: NextRequest) {
      // In demo mode, just add security headers
      const httpsRedirect = enforceHttps(request);
      if (httpsRedirect) return httpsRedirect;
      
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
