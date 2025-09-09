import { NextResponse } from 'next/server';

// Custom error classes
export class APIError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends APIError {
  constructor(service: string, message: string = 'External service error') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', { service });
    this.name = 'ExternalServiceError';
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database error') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Error response formatter
export function formatErrorResponse(error: Error): NextResponse {
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

  // Handle known error types
  if (error.name === 'ZodError') {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  console.error('Unhandled error:', error);
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

// Error handler wrapper for API routes
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  };
}

// Validation error helper
export function createValidationError(field: string, message: string): ValidationError {
  return new ValidationError(`Validation failed for field '${field}': ${message}`, {
    field,
    message,
  });
}

// Database error helper
export function handleDatabaseError(error: unknown): DatabaseError {
  console.error('Database error:', error);
  
  const dbError = error as { code?: string; message?: string };
  
  if (dbError.code === 'PGRST116') {
    return new NotFoundError('Resource not found');
  }
  
  if (dbError.code === '23505') {
    return new ConflictError('Resource already exists');
  }
  
  if (dbError.code === '23503') {
    return new ValidationError('Referenced resource does not exist');
  }
  
  return new DatabaseError(dbError.message || 'Database operation failed');
}

// External service error helper
export function handleExternalServiceError(service: string, error: unknown): ExternalServiceError {
  console.error(`${service} service error:`, error);
  
  const serviceError = error as { status?: number; message?: string };
  
  if (serviceError.status === 401) {
    return new ExternalServiceError(service, 'Invalid API key or authentication failed');
  }
  
  if (serviceError.status === 429) {
    return new ExternalServiceError(service, 'Rate limit exceeded for external service');
  }
  
  if (serviceError.status && serviceError.status >= 500) {
    return new ExternalServiceError(service, 'External service is temporarily unavailable');
  }
  
  return new ExternalServiceError(service, serviceError.message || 'External service request failed');
}
