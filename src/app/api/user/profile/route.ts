import { NextRequest, NextResponse } from 'next/server';
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdFromRequest } from '@/lib/middleware/api-wrapper';
import { APIError } from '@/lib/errors/api-errors';
import { getServerUserData, getUserUsageInfo } from '@/lib/services/user-service-server';

async function handleGetProfile(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from request (using existing auth system)
    const userId = getUserIdFromRequest(request);

    // Get complete user data using centralized service
    const userData = await getServerUserData(userId);
    const usageInfo = await getUserUsageInfo(userId);

    if (!userData) {
      return createSuccessResponse({
        message: 'User profile not found',
        userId: userId,
        synced: false
      });
    }

    return createSuccessResponse({
      user: userData,
      usageInfo: usageInfo,
      synced: true
    });

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to get user profile', 500, 'DATABASE_ERROR');
  }
}

// Create the secure API route
export const GET = createAPIRoute(handleGetProfile, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  logRequests: false // Disable request logging to hide userId parameters
});
