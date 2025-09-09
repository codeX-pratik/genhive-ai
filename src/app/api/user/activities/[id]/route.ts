import { NextRequest, NextResponse } from 'next/server';
import { createAPIRoute, createSuccessResponse, getUserIdAndEnsureExists } from '@/lib/middleware/api-wrapper';
import { SupabaseService } from '@/lib/database/supabase-utils';
import { APIError, handleDatabaseError } from '@/lib/errors/api-errors';

async function handleDeleteActivity(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const userId = await getUserIdAndEnsureExists(request);
  const { id: activityId } = await context.params;

  if (!activityId) {
    throw new APIError('Activity ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    // First, verify the activity belongs to the user
    const { data: activity, error: fetchError } = await SupabaseService.selectWithServiceRole(
      'ai_generations',
      'id, user_id, action_type',
      { id: activityId, user_id: userId }
    );

    if (fetchError) {
      throw handleDatabaseError(fetchError);
    }

    if (!activity || activity.length === 0) {
      throw new APIError('Activity not found or access denied', 404, 'NOT_FOUND');
    }

    // Soft delete by setting is_deleted to true
    const { error: deleteError } = await SupabaseService.updateWithServiceRole(
      'ai_generations',
      { is_deleted: true, updated_at: new Date().toISOString() },
      { id: activityId, user_id: userId }
    );

    if (deleteError) {
      throw handleDatabaseError(deleteError);
    }

    const act = (activity as unknown[])[0] as { action_type: string };
    return createSuccessResponse({
      message: 'Activity deleted successfully',
      activityId: activityId,
      actionType: act.action_type
    });

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to delete activity', 500, 'DATABASE_ERROR');
  }
}

export const DELETE = createAPIRoute(handleDeleteActivity, {
  requireAuth: true,
  logRequests: false, // Disable request logging to hide userId parameters
  rateLimit: { type: 'general', identifier: 'userId' }
});
