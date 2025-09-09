import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Security headers middleware
export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.clipdrop.co https://api.cloudinary.com https://*.supabase.co;"
  );

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}

// File validation
export const fileValidationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().regex(/^[a-zA-Z0-9\/\-\.]+$/, 'Invalid file type'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

export function validateFile(file: File): { valid: boolean; error?: string } {
  try {
    fileValidationSchema.parse({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Check file extension
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'File MIME type not allowed' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'File validation failed' };
  }
}

// Request size validation
export function validateRequestSize(request: NextRequest, maxSize: number = 10 * 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSize) {
    return false;
  }
  return true;
}

// CORS configuration
export function withCORS(response: NextResponse): NextResponse {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = response.headers.get('origin') || '';

  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

// API key validation
export function validateAPIKey(request: NextRequest, requiredKey: string): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  return apiKey === requiredKey;
}

// User authentication validation
export function validateUserAuth(request: NextRequest): { valid: boolean; userId?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  
  // For Clerk integration, we'll validate that the token is a valid user ID format
  // Clerk user IDs typically start with 'user_' and are 25+ characters long
  try {
    // Basic validation for Clerk user ID format
    if (token.startsWith('user_') && token.length >= 25) {
      return { valid: true, userId: token };
    }
    
    // Also allow other valid user ID formats
    if (token.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(token)) {
      return { valid: true, userId: token };
    }
    
    return { valid: false, error: 'Invalid user ID format' };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

// Request logging
export function logRequest(): void {
  // Disabled website request logging
}

// Security middleware wrapper
export function withSecurity<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    maxRequestSize?: number;
    logRequests?: boolean;
  } = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    
    // Validate request size
    if (options.maxRequestSize && !validateRequestSize(request, options.maxRequestSize)) {
      return NextResponse.json(
        { success: false, error: 'Request too large' },
        { status: 413 }
      );
    }

    // Validate authentication if required
    if (options.requireAuth) {
      const authResult = validateUserAuth(request);
      if (!authResult.valid) {
        return NextResponse.json(
          { success: false, error: authResult.error },
          { status: 401 }
        );
      }
    }

    // Execute the handler
    const response = await handler(...args);

    // Apply security headers
    withSecurityHeaders(response);
    withCORS(response);

    // Log request if enabled
    if (options.logRequests) {
      logRequest();
    }

    return response;
  };
}
