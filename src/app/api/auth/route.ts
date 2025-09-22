import { NextRequest, NextResponse } from "next/server";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs } from "@/lib/middleware/api-wrapper";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { SupabaseUsageRecord } from "@/lib/types/supabase";
import { getUsageLimitsFromEnv, getTestMaxFlag } from "@/lib/config/usage-limits";
import { UsageTracker } from "@/lib/usage-tracker";

// Free usage limits per day
const FREE_USAGE_LIMITS = getUsageLimitsFromEnv().free;

type AIActionType = keyof typeof FREE_USAGE_LIMITS;

interface UsageCheckRequest {
  userId: string;
  action: AIActionType;
}

interface UsageCheckResponse {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime?: string;
}

// Check if user can perform an AI action (with test mode support)
async function handleUsageCheck(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UsageCheckRequest = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      );
    }

    if (!(action in FREE_USAGE_LIMITS)) {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    // Use UsageTracker which includes test mode support
    const usageCheck = await UsageTracker.checkUsage(userId, action as any);

    const response: UsageCheckResponse = {
      allowed: usageCheck.allowed,
      remaining: usageCheck.remaining,
      limit: usageCheck.limit,
      resetTime: usageCheck.resetTime
    };

    return createSuccessResponse(response);

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Record usage after an AI action is performed (with test mode support)
async function handleUsageRecord(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UsageCheckRequest = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      );
    }

    if (!(action in FREE_USAGE_LIMITS)) {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    // Skip recording usage in test mode
    if (getTestMaxFlag()) {
      return createSuccessResponse({ success: true });
    }

    // Use UsageTracker for recording usage
    await UsageTracker.recordUsage(userId, action as any);

    return createSuccessResponse({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user's current usage stats (with test mode support)
async function handleGetUsageStats(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Return unlimited usage in test mode
    if (getTestMaxFlag()) {
      const usageStats = Object.keys(FREE_USAGE_LIMITS).map(action => {
        const actionType = action as AIActionType;
        return {
          action: actionType,
          used: 0,
          limit: 1000000000,
          remaining: 1000000000
        };
      });

      return createSuccessResponse({
        usage: usageStats,
        resetTime: new Date().toISOString()
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: usageData, error } = await SupabaseService.selectWithServiceRole(
      'user_usage',
      'action_type, usage_count',
      { user_id: userId, date: today }
    );

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const usageStats = Object.keys(FREE_USAGE_LIMITS).map(action => {
      const actionType = action as AIActionType;
      const limit = FREE_USAGE_LIMITS[actionType];
      const currentUsage = (usageData as unknown as SupabaseUsageRecord[])?.find((u: SupabaseUsageRecord) => u.action_type === actionType)?.usage_count || 0;
    
      return {
        action: actionType,
        used: currentUsage,
        limit,
        remaining: Math.max(0, limit - currentUsage)
      };
    });

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const resetTime = tomorrow.toISOString();

    return createSuccessResponse({
      usage: usageStats,
      resetTime
    });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = createAPIRoute(handleUsageCheck, { ...commonAPIConfigs.general, logRequests: false });
export const PUT = createAPIRoute(handleUsageRecord, { ...commonAPIConfigs.general, logRequests: false });
export const GET = createAPIRoute(handleGetUsageStats, { ...commonAPIConfigs.general, logRequests: false });
