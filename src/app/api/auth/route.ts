import { NextRequest, NextResponse } from "next/server";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs } from "@/lib/middleware/api-wrapper";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { SupabaseUsageRecord } from "@/lib/types/supabase";
import { getUsageLimitsFromEnv } from "@/lib/config/usage-limits";

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

// Check if user can perform an AI action (free usage tracking)
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

    const limit = FREE_USAGE_LIMITS[action];
    const today = new Date().toISOString().split('T')[0];

    const { data: usageData, error: usageError } = await SupabaseService.selectWithServiceRole(
      'user_usage',
      'usage_count',
      { 
        user_id: userId, 
        action_type: action, 
        date: today 
      }
    );

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError;
    }

    const currentUsage = (usageData as unknown as SupabaseUsageRecord[])?.[0]?.usage_count || 0;
    const remaining = Math.max(0, limit - currentUsage);
    const allowed = remaining > 0;

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const resetTime = tomorrow.toISOString();

    const response: UsageCheckResponse = {
      allowed,
      remaining,
      limit,
      resetTime
    };

    return createSuccessResponse(response);

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Record usage after an AI action is performed
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

    const today = new Date().toISOString().split('T')[0];

    const { data: existingUsage, error: checkError } = await SupabaseService.selectWithServiceRole(
      'user_usage',
      'id, usage_count',
      { 
        user_id: userId, 
        action_type: action, 
        date: today 
      }
    );

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUsage && existingUsage.length > 0) {
      const { error: updateError } = await SupabaseService.updateWithServiceRole(
        'user_usage',
        { usage_count: (existingUsage as unknown as SupabaseUsageRecord[])[0].usage_count + 1 },
        { id: (existingUsage as unknown as SupabaseUsageRecord[])[0].id }
      );

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await SupabaseService.insertWithServiceRole('user_usage', {
        user_id: userId,
        action_type: action,
        date: today,
        usage_count: 1
      });

      if (insertError) throw insertError;
    }

    return createSuccessResponse({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user's current usage stats
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
