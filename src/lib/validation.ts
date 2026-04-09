/**
 * MILP Input Validation and Sanitization
 * Prevents injection attacks and validates input
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')           // Remove < and >
    .replace(/javascript:/gi, '')   // Remove javascript: protocol
    .replace(/on\w+=/gi, '')        // Remove event handlers
    .replace(/data:/gi, '')         // Remove data: protocol
    .trim();
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// Validate request body against schema
export async function validateBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: string; status: number }> {
  try {
    const body = await req.json();
    const sanitized = sanitizeObject(body);
    const result = schema.safeParse(sanitized);
    
    if (!result.success) {
      return {
        error: `Validation error: ${result.error.issues.map(e => e.message).join(', ')}`,
        status: 400,
      };
    }
    
    return { data: result.data };
  } catch {
    return { error: 'Invalid JSON body', status: 400 };
  }
}

// Common validation schemas
export const schemas = {
  // Claim ID validation
  claimId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  
  // Claim number validation
  claimNumber: z.string().min(1).max(50).regex(/^CLM-\d{4}-\d{3}$/),
  
  // Branch ID validation
  branchId: z.string().min(1).max(100),
  
  // Patient ID validation
  patientId: z.string().min(1).max(100),
  
  // Amount validation (positive number)
  amount: z.number().min(0).max(10000000),
  
  // Status validation
  claimStatus: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING_REVIEW', 'RECOVERED', 'PENDING']),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  
  // Claim action
  claimAction: z.enum(['review', 'resolve', 'send_back', 'mark_fixed']),
  
  // Rejection reason
  rejectionReason: z.string().min(1).max(500).optional(),
  
  // Missing fields
  missingFields: z.array(z.string().max(100)).max(20),
  
  // Risk score
  riskScore: z.number().min(0).max(100),
};

// Validate query parameters
export function validateQuery<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): { data: T } | { error: string; status: number } {
  const { searchParams } = new URL(req.url);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = sanitizeString(value);
  });
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    return {
      error: `Invalid query parameters: ${result.error.issues.map(e => e.message).join(', ')}`,
      status: 400,
    };
  }
  
  return { data: result.data };
}

// Middleware wrapper for body validation
export function withBodyValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, user: any) => {
    const validationResult = await validateBody(req, schema);
    
    if ('error' in validationResult) {
      return NextResponse.json(
        { error: validationResult.error, code: 'VALIDATION_ERROR' },
        { status: validationResult.status }
      );
    }
    
    return handler(req, validationResult.data, user);
  };
}

// CSRF token validation for state-changing operations
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCsrfToken(sessionId: string): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  csrfTokens.set(sessionId, { 
    token, 
    expires: Date.now() + 60 * 60 * 1000 // 1 hour
  });
  
  return token;
}

export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// Clean up expired CSRF tokens
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 60 * 1000);
