import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  // General API rate limits (per IP)
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
  },
  // AI-specific rate limits (per user)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 AI requests per minute
  },
  // File upload rate limits (per IP)
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 uploads per minute
  },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

interface RateLimitOptions {
  type: RateLimitType;
  identifier?: string; // Custom identifier (e.g., user ID)
  skipSuccessfulRequests?: boolean;
}

export class RateLimiter {
  private static getIdentifier(request: NextRequest, options: RateLimitOptions): string {
    if (options.identifier) {
      return `${options.type}:${options.identifier}`;
    }
    
    // Get IP address from request
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `${options.type}:${ip}`;
  }

  private static isWindowExpired(resetTime: number): boolean {
    return Date.now() > resetTime;
  }

  private static getWindowResetTime(windowMs: number): number {
    return Date.now() + windowMs;
  }

  static checkRateLimit(request: NextRequest, options: RateLimitOptions): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    limit: number;
  } {
    const identifier = this.getIdentifier(request, options);
    const config = RATE_LIMITS[options.type];
    // const now = Date.now(); // Not used in current implementation

    // Get current rate limit data
    const current = rateLimitStore.get(identifier);

    if (!current || this.isWindowExpired(current.resetTime)) {
      // First request or window expired, create new entry
      const newEntry = {
        count: 1,
        resetTime: this.getWindowResetTime(config.windowMs),
      };
      rateLimitStore.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime,
        limit: config.maxRequests,
      };
    }

    // Check if limit exceeded
    if (current.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        limit: config.maxRequests,
      };
    }

    // Increment count
    current.count++;
    rateLimitStore.set(identifier, current);

    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
      limit: config.maxRequests,
    };
  }

  static middleware(options: RateLimitOptions) {
    return (request: NextRequest): NextResponse | null => {
      const rateLimit = this.checkRateLimit(request, options);

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            details: {
              limit: rateLimit.limit,
              remaining: rateLimit.remaining,
              resetTime: new Date(rateLimit.resetTime).toISOString(),
            },
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimit.limit.toString(),
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

      return null; // Allow request to continue
    };
  }

  // Clean up expired entries periodically
  static cleanup(): void {
    // const now = Date.now(); // Not used in current implementation
    for (const [key, value] of rateLimitStore.entries()) {
      if (this.isWindowExpired(value.resetTime)) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  RateLimiter.cleanup();
}, 5 * 60 * 1000);

// Helper functions for common rate limiting scenarios
export const withGeneralRateLimit = RateLimiter.middleware({ type: 'general' });
export const withAIRateLimit = (userId: string) => 
  RateLimiter.middleware({ type: 'ai', identifier: userId });
export const withUploadRateLimit = RateLimiter.middleware({ type: 'upload' });

export default RateLimiter;
