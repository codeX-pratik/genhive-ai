import { NextRequest, NextResponse } from "next/server";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdAndEnsureExists } from "@/lib/middleware/api-wrapper";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { APIError, handleDatabaseError } from "@/lib/errors/api-errors";

interface UserActivity {
  id: string;
  action_type: string;
  input_params: Record<string, unknown>;
  content?: string;
  image_url?: string;
  created_at: string;
  status: string;
  model_used?: string;
  processing_time_ms?: number;
}

interface UserStats {
  totalCreations: number;
  articlesCount: number;
  blogTitlesCount: number;
  imagesCount: number;
  backgroundRemovalsCount: number;
  objectRemovalsCount: number;
  resumeReviewsCount: number;
}

interface DashboardResponse {
  stats: UserStats;
  recentActivities: UserActivity[];
}

async function handleGetUserActivities(request: NextRequest): Promise<NextResponse> {
  // Get authenticated user ID and ensure user exists in database
  const userId = await getUserIdAndEnsureExists(request);
  
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Max 1000 recent activities for testing

  try {
    // Get all user's AI generations (excluding soft-deleted ones)
    const { data: generations, error } = await SupabaseService.selectWithServiceRole(
      'ai_generations',
      '*',
      { 
        user_id: userId,
        status: 'completed',
        is_deleted: false
      }
    );

    if (error) {
      throw handleDatabaseError(error);
    }

    const allGenerations = (generations as unknown[]) || [];

    // Calculate stats
    const stats: UserStats = {
      totalCreations: allGenerations.length,
      articlesCount: allGenerations.filter((g: unknown) => (g as { action_type: string }).action_type === 'article').length,
      blogTitlesCount: allGenerations.filter((g: unknown) => (g as { action_type: string }).action_type === 'blog_title').length,
      imagesCount: allGenerations.filter((g: unknown) => (g as { action_type: string }).action_type === 'image').length,
      backgroundRemovalsCount: allGenerations.filter((g: unknown) => (g as { action_type: string }).action_type === 'background_removal').length,
      objectRemovalsCount: allGenerations.filter((g: unknown) => (g as { action_type: string }).action_type === 'object_removal').length,
      resumeReviewsCount: allGenerations.filter((g: unknown) => (g as { action_type: string }).action_type === 'resume_review').length,
    };

    // Get recent activities (sorted by created_at desc)
    const recentActivities = allGenerations
      .sort((a: unknown, b: unknown) => 
        new Date((b as { created_at: string }).created_at).getTime() - 
        new Date((a as { created_at: string }).created_at).getTime()
      )
      .slice(0, limit)
      .map((generation: unknown) => {
        const gen = generation as {
          id: string;
          action_type: string;
          input_params: Record<string, unknown>;
          content?: string;
          image_url?: string;
          created_at: string;
          status: string;
          model_used?: string;
          processing_time_ms?: number;
        };

        return {
          id: gen.id,
          action_type: gen.action_type,
          input_params: gen.input_params,
          content: gen.content,
          image_url: gen.image_url,
          created_at: gen.created_at,
          status: gen.status,
          model_used: gen.model_used,
          processing_time_ms: gen.processing_time_ms,
        };
      });

    const response: DashboardResponse = {
      stats,
      recentActivities,
    };

    return createSuccessResponse(response);

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to fetch user activities', 500, 'DATABASE_ERROR');
  }
}

// Create the secure API route
export const GET = createAPIRoute(handleGetUserActivities, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  rateLimit: { type: 'general', identifier: 'userId' },
  logRequests: false // Disable request logging to hide userId and limit parameters
});
