import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RateLimiter } from './rate-limiter';
import { withSecurity } from './security';
import { withErrorHandler, APIError, ValidationError } from '../errors/api-errors';
import { ensureUserExists } from '../database/auto-sync';

// API route configuration options
interface APIRouteOptions {
  // Validation
  schema?: z.ZodSchema<unknown>;
  
  // Rate limiting
  rateLimit?: {
    type: 'general' | 'ai' | 'upload';
    identifier?: string;
  };
  
  // Security
  requireAuth?: boolean;
  maxRequestSize?: number;
  logRequests?: boolean;
  
  // Error handling
  customErrorHandler?: (error: Error) => NextResponse;
}

// API route wrapper that combines all middleware
export function createAPIRoute<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: APIRouteOptions = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = RateLimiter.middleware({
          type: options.rateLimit.type,
          identifier: options.rateLimit.identifier,
        })(request);
        
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // Apply security middleware
      const securedHandler = withSecurity(handler, {
        requireAuth: options.requireAuth,
        maxRequestSize: options.maxRequestSize,
        logRequests: process.env.NODE_ENV !== 'production' && !!options.logRequests,
      });

      // Apply error handling
      const errorHandledHandler = withErrorHandler(securedHandler);

      // Execute the handler
      return await errorHandledHandler(...args);

    } catch (error: unknown) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          'Validation failed',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        );
        return NextResponse.json(
          {
            success: false,
            error: validationError.message,
            code: validationError.code,
            details: validationError.details,
            timestamp: new Date().toISOString(),
          },
          { status: validationError.statusCode }
        );
      }

      // Handle other errors
      if (error instanceof APIError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
            timestamp: new Date().toISOString(),
          },
          { status: error.statusCode }
        );
      }

      // Handle unknown errors
      console.error('Unhandled error in API route:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

// Helper function to validate request body
export async function validateRequestBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Request body validation failed',
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }
    throw new APIError('Invalid request body', 400, 'INVALID_BODY');
  }
}

// Helper function to get user ID from request
export function getUserIdFromRequest(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new APIError('Missing or invalid authorization header', 401, 'AUTHENTICATION_ERROR');
  }

  const token = authHeader.substring(7);
  
  // In a real implementation, you would validate the JWT token here
  // For now, we'll assume the token contains the user ID
  try {
    // This is a placeholder - implement proper JWT validation
    return token; // In reality, decode and validate the JWT
  } catch {
    throw new APIError('Invalid token', 401, 'AUTHENTICATION_ERROR');
  }
}

// Helper function to get user ID and ensure user exists in database
export async function getUserIdAndEnsureExists(request: NextRequest): Promise<string> {
  const userId = getUserIdFromRequest(request);
  
  // Ensure user exists in database (auto-sync if needed)
  await ensureUserExists(userId);
  
  return userId;
}

// Helper function to create success response
export function createSuccessResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Helper function to create error response
export function createErrorResponse(
  error: string,
  code: string = 'ERROR',
  status: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Common API route configurations
export const commonAPIConfigs = {
  // General API route (no special requirements)
  general: {
    rateLimit: { type: 'general' as const },
    logRequests: process.env.NODE_ENV !== 'production',
  },
  
  // AI API route (requires auth, AI rate limiting)
  ai: {
    requireAuth: true,
    rateLimit: { type: 'ai' as const },
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    logRequests: process.env.NODE_ENV !== 'production',
  },
  
  // Upload API route (requires auth, upload rate limiting)
  upload: {
    requireAuth: true,
    rateLimit: { type: 'upload' as const },
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    logRequests: process.env.NODE_ENV !== 'production',
  },
  
  // Public API route (no auth required)
  public: {
    rateLimit: { type: 'general' as const },
    logRequests: process.env.NODE_ENV !== 'production',
  },
} as const;

export default createAPIRoute;
