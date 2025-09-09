import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ClerkUser {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}

export interface SyncResult {
  success: boolean;
  userId: string;
  profileId?: string;
  error?: string;
}

/**
 * Sync a single Clerk user to Supabase
 */
export async function syncClerkUser(user: ClerkUser): Promise<SyncResult> {
  try {
    // Build a display name to store in full_name
    let displayName = user.username;
    if (!displayName) {
      if (user.firstName && user.lastName) {
        displayName = `${user.firstName} ${user.lastName}`.trim();
      } else if (user.firstName) {
        displayName = user.firstName;
      } else if (user.lastName) {
        displayName = user.lastName;
      }
    }

    const { data, error } = await supabase.rpc('sync_clerk_user', {
      p_user_id: user.id,
      p_email: user.email || null,
      p_full_name: displayName || null,
      p_avatar_url: user.imageUrl || null,
      p_subscription_tier: user.subscriptionTier || 'free'
    });

    if (error) {
      console.error(`Error syncing user ${user.id}:`, error);
      return {
        success: false,
        userId: user.id,
        error: error.message
      };
    }

    return {
      success: true,
      userId: user.id,
      profileId: data
    };
  } catch (error) {
    console.error(`Error processing user ${user.id}:`, error);
    return {
      success: false,
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Sync multiple Clerk users to Supabase
 */
export async function syncMultipleClerkUsers(users: ClerkUser[]): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  
  for (const user of users) {
    const result = await syncClerkUser(user);
    results.push(result);
    
    // Add a small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Get user usage statistics
 */
export async function getUserUsageStats(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_user_usage_today', {
      p_user_id: userId
    });

    if (error) {
      console.error(`Error getting usage stats for user ${userId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error processing usage stats for user ${userId}:`, error);
    return null;
  }
}

/**
 * Check if a user exists in the database
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await SupabaseService.selectWithServiceRole(
      'profiles',
      'id',
      { user_id: userId }
    );

    if (error) {
      console.error(`Error checking user existence ${userId}:`, error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error(`Error processing user existence check ${userId}:`, error);
    return false;
  }
}

/**
 * Get all users from the database
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, subscription_tier, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error processing get all users:', error);
    return [];
  }
}

/**
 * Update user subscription tier
 */
export async function updateUserSubscription(
  userId: string, 
  subscriptionTier: 'free' | 'pro' | 'enterprise'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_tier: subscriptionTier,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error(`Error updating subscription for user ${userId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error processing subscription update for user ${userId}:`, error);
    return false;
  }
}

/**
 * Delete user and all associated data
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // Delete user usage records
    await supabase
      .from('user_usage')
      .delete()
      .eq('user_id', userId);

    // Delete AI generations
    await supabase
      .from('ai_generations')
      .delete()
      .eq('user_id', userId);

    // Delete community posts
    await supabase
      .from('community_posts')
      .delete()
      .eq('user_id', userId);

    // Delete likes
    await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId);

    // Delete user sessions
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    // Delete API analytics
    await supabase
      .from('api_analytics')
      .delete()
      .eq('user_id', userId);

    // Finally, delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error processing user deletion ${userId}:`, error);
    return false;
  }
}
