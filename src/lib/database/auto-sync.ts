import { syncClerkUser, userExists, ClerkUser } from './user-sync';

/**
 * Automatically sync user to database if they don't exist
 * This runs on first API call to ensure user profile is created
 */
export async function ensureUserExists(userId: string): Promise<boolean> {
  try {
    // Check if user already exists in database
    const exists = await userExists(userId);
    
    if (exists) {
      return true; // User already exists, no need to sync
    }

    // For auto-sync in API routes, we only have the userId from the token
    // Full user data will be synced via webhooks or manual sync
    const userData: ClerkUser = {
      id: userId,
      email: undefined,
      username: undefined,
      firstName: undefined,
      lastName: undefined,
      imageUrl: undefined,
      subscriptionTier: 'free'
    };

    // Sync user to database
    const result = await syncClerkUser(userData);
    
    return result.success;

  } catch (error) {
    console.error(`Error in auto-sync for user ${userId}:`, error);
    return false;
  }
}

/**
 * Middleware function to ensure user exists before API operations
 */
export async function withUserSync<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  // Ensure user exists in database
  await ensureUserExists(userId);
  
  // Execute the operation
  return await operation();
}
