import { NextRequest, NextResponse } from 'next/server';
import { syncClerkUser, userExists, ClerkUser } from '@/lib/database/user-sync';
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdFromRequest } from '@/lib/middleware/api-wrapper';
import { APIError } from '@/lib/errors/api-errors';
import { currentUser } from '@clerk/nextjs/server';

async function handleUserSync(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = getUserIdFromRequest(request);

    const exists = await userExists(userId);
    if (exists) {
      return createSuccessResponse({ message: 'User already exists in database', userId, synced: false });
    }

    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.id !== userId) {
      throw new APIError('Failed to get user data from Clerk', 401, 'AUTH_ERROR');
    }

    const userData: ClerkUser = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || undefined,
      username: clerkUser.username || undefined,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      imageUrl: clerkUser.imageUrl || undefined,
      subscriptionTier: 'free'
    };

    const result = await syncClerkUser(userData);
    if (result.success) {
      return createSuccessResponse({ message: 'User synced successfully', userId, profileId: result.profileId, synced: true });
    } else {
      throw new APIError(`Failed to sync user: ${result.error}`, 500, 'SYNC_ERROR');
    }

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to sync user', 500, 'SYNC_ERROR');
  }
}

export const POST = createAPIRoute(handleUserSync, { ...commonAPIConfigs.general, requireAuth: true, logRequests: false });

async function handleSyncStatus(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = getUserIdFromRequest(request);
    const exists = await userExists(userId);
    return createSuccessResponse({ userId, synced: exists, message: exists ? 'User is synced' : 'User needs to be synced' });
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to check sync status', 500, 'SYNC_ERROR');
  }
}

export const GET = createAPIRoute(handleSyncStatus, { ...commonAPIConfigs.general, requireAuth: true, logRequests: false });
