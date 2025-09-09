// Usage tracking utilities for GenHive AI
import { SupabaseService } from './database/supabase-utils';
import { SupabaseUsageRecord } from './types/supabase';
import { isSupabaseConfigured } from './database/db';
import { getTestMaxFlag, getUsageLimitsFromEnv } from './config/usage-limits';

export type AIActionType = 'article' | 'blog_title' | 'image' | 'background_removal' | 'object_removal' | 'resume_review';

export interface UsageLimits {
  article: number;
  blog_title: number;
  image: number;
  background_removal: number;
  object_removal: number;
  resume_review: number;
}

export interface UsageStats {
  action: AIActionType;
  used: number;
  limit: number;
  remaining: number;
}

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime?: string;
}

export class UsageTracker {
  private static getTestingOverrideEnabled(): boolean {
    return getTestMaxFlag();
  }

  /**
   * Get user's subscription tier
   */
  static async getUserSubscriptionTier(userId: string): Promise<string> {
    try {
      if (!isSupabaseConfigured()) {
        return 'free'; // Default to free in development
      }

      const { data: profile, error } = await SupabaseService.select(
        'profiles',
        'subscription_tier',
        { user_id: userId }
      );

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user subscription tier:', error);
        return 'free'; // Default to free on error
      }

      const tier = (profile as unknown as Array<{ subscription_tier: string }>)?.[0]?.subscription_tier || 'free';
      return tier;
    } catch (error) {
      console.error('Error getting user subscription tier:', error);
      return 'free'; // Default to free on error
    }
  }

  /**
   * Get usage limits for a subscription tier (env-based)
   */
  static getUsageLimits(tier: string): UsageLimits {
    if (this.getTestingOverrideEnabled()) {
      return {
        article: 1000000000,
        blog_title: 1000000000,
        image: 1000000000,
        background_removal: 1000000000,
        object_removal: 1000000000,
        resume_review: 1000000000,
      };
    }
    const envLimits = getUsageLimitsFromEnv();
    return (envLimits[tier as keyof typeof envLimits] as UsageLimits) || (envLimits.free as UsageLimits);
  }

  /**
   * Check if user can perform an AI action
   */
  static async checkUsage(userId: string, action: AIActionType): Promise<UsageCheckResult> {
    try {
      if (this.getTestingOverrideEnabled()) {
        return { allowed: true, remaining: 1000000000, limit: 1000000000, resetTime: new Date().toISOString() };
      }
      // Get user's subscription tier
      const subscriptionTier = await this.getUserSubscriptionTier(userId);
      const limits = this.getUsageLimits(subscriptionTier);
      const limit = limits[action];

      if (!isSupabaseConfigured()) {
        return { allowed: true, remaining: limit, limit, resetTime: new Date().toISOString() };
      }
      const today = new Date().toISOString().split('T')[0];

      // Get today's usage for this user and action
      const { data: usageData, error } = await SupabaseService.selectWithServiceRole(
        'user_usage',
        'usage_count',
        { user_id: userId, action_type: action, date: today }
      );

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const currentUsage = (usageData as unknown as SupabaseUsageRecord[])?.[0]?.usage_count || 0;
      const remaining = Math.max(0, limit - currentUsage);
      const allowed = remaining > 0;

      // Calculate reset time (next day at midnight UTC)
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const resetTime = tomorrow.toISOString();

      return { allowed, remaining, limit, resetTime };
    } catch (error) {
      console.error('Error checking usage:', error);
      // If there's an error, allow usage for development
      const subscriptionTier = await this.getUserSubscriptionTier(userId);
      const limits = this.getUsageLimits(subscriptionTier);
      const limit = limits[action];
      return { allowed: true, remaining: limit, limit, resetTime: new Date().toISOString() };
    }
  }

  /**
   * Record usage after an AI action is performed
   */
  static async recordUsage(userId: string, action: AIActionType): Promise<void> {
    try {
      if (this.getTestingOverrideEnabled()) {
        return; // Skip recording during test override
      }
      if (!isSupabaseConfigured()) {
        return; // Skip recording in development when DB not configured
      }

      const today = new Date().toISOString().split('T')[0];

      // Check if usage record exists for today
      const { data: existingUsage, error: checkError } = await SupabaseService.selectWithServiceRole(
        'user_usage',
        'id, usage_count',
        { user_id: userId, action_type: action, date: today }
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
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  }

  /**
   * Get user's current usage stats for all actions
   */
  static async getUserUsageStats(userId: string): Promise<{ usage: UsageStats[]; resetTime: string; }> {
    try {
      const subscriptionTier = await this.getUserSubscriptionTier(userId);
      const limits = this.getUsageLimits(subscriptionTier);
      
      const today = new Date().toISOString().split('T')[0];

      const { data: usageData, error } = await SupabaseService.selectWithServiceRole(
        'user_usage',
        'action_type, usage_count',
        { user_id: userId, date: today }
      );

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const usageStats: UsageStats[] = Object.keys(limits).map(action => {
        const actionType = action as AIActionType;
        const limit = limits[actionType];
        const currentUsage = (usageData as unknown as SupabaseUsageRecord[])?.find((u: SupabaseUsageRecord) => u.action_type === actionType)?.usage_count || 0;
        return { action: actionType, used: currentUsage, limit, remaining: Math.max(0, limit - currentUsage) };
      });

      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const resetTime = tomorrow.toISOString();

      return { usage: usageStats, resetTime };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw new Error('Failed to get usage stats');
    }
  }

  static async hasReachedLimit(userId: string, action: AIActionType): Promise<boolean> {
    const usageCheck = await this.checkUsage(userId, action);
    return !usageCheck.allowed;
  }

  static async getRemainingUsage(userId: string, action: AIActionType): Promise<number> {
    const usageCheck = await this.checkUsage(userId, action);
    return usageCheck.remaining;
  }

  static getNextResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }
}

// Helper function to validate AI action type (env-based)
export function isValidAIAction(action: string): action is AIActionType {
  const actions = Object.keys(getUsageLimitsFromEnv().free);
  return actions.includes(action);
}

// Helper function to get usage limit for an action (free tier env-based)
export function getUsageLimit(action: AIActionType): number {
  const limits = getUsageLimitsFromEnv().free as unknown as UsageLimits;
  return limits[action];
}

export default UsageTracker;
