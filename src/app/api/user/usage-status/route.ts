import { NextRequest, NextResponse } from "next/server";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdFromRequest } from '@/lib/middleware/api-wrapper';
import { APIError } from '@/lib/errors/api-errors';
import { getUserUsageInfo } from '@/lib/services/user-service-server';
import { UsageTracker } from "@/lib/usage-tracker";

async function handleGetUsageStatus(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from request (using existing auth system)
    const userId = getUserIdFromRequest(request);

    // Get user's usage information using centralized service
    const usageInfo = await getUserUsageInfo(userId);

    // Get current usage stats
    const usageStats = await UsageTracker.getUserUsageStats(userId);

    return createSuccessResponse({
      usageInfo,
      currentUsage: usageStats.usage,
      resetTime: usageStats.resetTime
    });

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to get usage status', 500, 'DATABASE_ERROR');
  }
}

// Create the secure API route
export const GET = createAPIRoute(handleGetUsageStatus, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  logRequests: false
});

