import { SupabaseService } from './supabase-utils';

export type SubscriptionTier = 'free' | 'pro';

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
}

// In free mode, always treat users as 'pro'
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  return { userId, tier: 'pro' };
}

export async function setUserSubscription(userId: string): Promise<boolean> {
  const { error } = await SupabaseService.updateWithServiceRole(
    'profiles',
    { subscription_tier: 'pro', updated_at: new Date().toISOString() },
    { user_id: userId }
  );
  return !error;
}

export function isPremium(): boolean {
  return true;
}
