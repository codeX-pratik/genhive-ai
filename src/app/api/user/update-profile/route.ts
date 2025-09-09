import { NextRequest, NextResponse } from 'next/server';
import { syncClerkUser, ClerkUser } from '@/lib/database/user-sync';
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdFromRequest } from '@/lib/middleware/api-wrapper';
import { APIError } from '@/lib/errors/api-errors';
import { currentUser } from '@clerk/nextjs/server';

async function handleUpdateProfile(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from request
    const userId = getUserIdFromRequest(request);

    // Get real user data from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser || clerkUser.id !== userId) {
      throw new APIError('Failed to get user data from Clerk', 401, 'AUTH_ERROR');
    }

    // Create user data with real Clerk information
    const userData: ClerkUser = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || undefined,
      username: clerkUser.username || undefined,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      imageUrl: clerkUser.imageUrl || undefined,
      subscriptionTier: 'free'
    };

    // production: no verbose logs

    // Sync/update user in database
    const result = await syncClerkUser(userData);
    
    if (result.success) {
      return createSuccessResponse({
        message: 'User profile updated successfully',
        userId: userId,
        profileId: result.profileId,
        userData: {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.username || (userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`.trim() 
            : userData.firstName || userData.lastName || null),
          imageUrl: userData.imageUrl
        }
      });
    } else {
      throw new APIError(`Failed to update user profile: ${result.error}`, 500, 'SYNC_ERROR');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to update user profile', 500, 'INTERNAL_ERROR');
  }
}

export const POST = createAPIRoute(handleUpdateProfile, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  rateLimit: { type: 'general', identifier: 'userId' }
});

