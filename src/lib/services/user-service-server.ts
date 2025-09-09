import { currentUser } from '@clerk/nextjs/server';
import { SupabaseService } from '@/lib/database/supabase-utils';
import { getUserSubscription, SubscriptionTier } from '@/lib/database/subscription-manager';
import { getUsageLimitsFromEnv } from '@/lib/config/usage-limits';
import { UserProfile, UserUsageInfo } from './user-service';

function deriveTierFromClerkMeta(meta: Record<string, unknown> | undefined): SubscriptionTier | null {
  if (!meta) return null;
  const sub = String((meta as Record<string, unknown>).subscription ?? '').toLowerCase();
  if (sub === 'premium' || sub === 'pro') return 'pro';
  if (sub === 'free') return 'free';
  return null;
}

// Server-side function to get complete user data
export async function getServerUserData(userId: string): Promise<UserProfile | null> {
  try {
    // Get Clerk user data
    const clerkUser = await currentUser();
    
    if (!clerkUser || clerkUser.id !== userId) {
      return null;
    }

    // Prefer Clerk metadata, fallback to DB
    const metaTier = deriveTierFromClerkMeta((clerkUser as unknown as { publicMetadata?: Record<string, unknown> }).publicMetadata);
    const subscription = !metaTier ? await getUserSubscription(userId) : null;
    const subscriptionTier: SubscriptionTier = metaTier || (subscription?.tier || 'free');
    const isPremium = subscriptionTier === 'pro';

    // Get subscription display name
    const subscriptionDisplayName = getSubscriptionDisplayName(subscriptionTier);

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress,
      username: clerkUser.username || undefined,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      fullName: clerkUser.firstName && clerkUser.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
        : clerkUser.firstName || clerkUser.lastName || clerkUser.username || 'User',
      imageUrl: clerkUser.imageUrl || undefined,
      subscriptionTier,
      subscriptionDisplayName,
      isPremium,
      isLoaded: true,
      createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : null,
      updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt) : null,
      lastSignInAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,
      hasVerifiedEmail: (clerkUser as unknown as { hasVerifiedEmailAddress?: boolean }).hasVerifiedEmailAddress || false,
      externalAccounts: (clerkUser as unknown as { externalAccounts?: unknown[] }).externalAccounts,
      organizationMemberships: (clerkUser as unknown as { organizationMemberships?: unknown[] }).organizationMemberships,
    };
  } catch (error) {
    console.error('Error getting server user data:', error);
    return null;
  }
}

// Get user usage information
export async function getUserUsageInfo(userId: string): Promise<UserUsageInfo> {
  try {
    const clerkUser = await currentUser();
    const metaTier = deriveTierFromClerkMeta((clerkUser as unknown as { publicMetadata?: Record<string, unknown> })?.publicMetadata);
    const subscription = !metaTier ? await getUserSubscription(userId) : null;
    const subscriptionTier: SubscriptionTier = metaTier || (subscription?.tier || 'free');
    const limitsConfig = getUsageLimitsFromEnv()[subscriptionTier];
    const limits = limitsConfig as unknown as Record<string, number>;
    const isPremium = subscriptionTier === 'pro';
    
    // Check if testing mode is enabled
    const testingMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true' || 
                       process.env.TEST_MAX_LIMITS === 'true';

    return {
      subscriptionTier,
      limits,
      isPremium,
      testingMode,
    };
  } catch (error) {
    console.error('Error getting user usage info:', error);
    return {
      subscriptionTier: 'free',
      limits: getUsageLimitsFromEnv().free as unknown as Record<string, number>,
      isPremium: false,
      testingMode: false,
    };
  }
}

// Get subscription display name
export function getSubscriptionDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return 'Free';
    case 'pro':
      return 'Premium';
    default:
      return 'Free';
  }
}

// Check if user has specific subscription tier
export function hasSubscriptionTier(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  if (requiredTier === 'free') return true;
  return userTier === 'pro';
}

// Get user's display name (fallback chain)
export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return 'User';
  
  if (user.fullName) return user.fullName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
}

// Get user's avatar URL with fallback
export function getUserAvatarUrl(user: UserProfile | null): string | undefined {
  if (!user) return undefined;
  
  return user.imageUrl || undefined;
}

// Get user's email with fallback
export function getUserEmail(user: UserProfile | null): string | undefined {
  if (!user) return undefined;
  
  return user.email || undefined;
}

// Check if user is premium
export function isUserPremium(user: UserProfile | null): boolean {
  if (!user) return false;
  
  return user.isPremium;
}

// Get user's subscription tier
export function getUserSubscriptionTier(user: UserProfile | null): SubscriptionTier {
  if (!user) return 'free';
  
  return user.subscriptionTier;
}

// Get user's subscription display name
export function getUserSubscriptionDisplayName(user: UserProfile | null): string {
  if (!user) return 'Free';
  
  return user.subscriptionDisplayName;
}

// Utility function to sync user data to database
export async function syncUserToDatabase(userId: string): Promise<boolean> {
  try {
    const userData = await getServerUserData(userId);
    
    if (!userData) {
      return false;
    }

    // Check if user exists in database
    const { data: existingUser } = await SupabaseService.select(
      'profiles',
      'user_id',
      { user_id: userId }
    );

    if (existingUser && existingUser.length > 0) {
      // Update existing user
      const { error } = await SupabaseService.update(
        'profiles',
        {
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.imageUrl,
          updated_at: new Date().toISOString(),
        },
        { user_id: userId }
      );

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }
    } else {
      // Create new user
      const { error } = await SupabaseService.insert(
        'profiles',
        {
          user_id: userId,
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.imageUrl,
          subscription_tier: userData.subscriptionTier,
        }
      );

      if (error) {
        console.error('Error creating user profile:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error syncing user to database:', error);
    return false;
  }
}
