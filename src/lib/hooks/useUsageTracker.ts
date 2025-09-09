// React hook for usage tracking in components
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AIActionType, UsageStats } from '../usage-tracker';

interface UseUsageTrackerReturn {
  usageStats: UsageStats[] | null;
  isLoading: boolean;
  error: string | null;
  checkUsage: (action: AIActionType) => Promise<boolean>;
  recordUsage: (action: AIActionType) => Promise<void>;
  refreshUsage: () => Promise<void>;
  resetTime: string | null;
}

export function useUsageTracker(userId: string | null): UseUsageTrackerReturn {
  const [usageStats, setUsageStats] = useState<UsageStats[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetTime, setResetTime] = useState<string | null>(null);

  // Fetch usage stats from API
  const fetchUsageStats = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data = await response.json();
      setUsageStats(data.usage);
      setResetTime(data.resetTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Check if user can perform an action
  const checkUsage = useCallback(async (action: AIActionType): Promise<boolean> => {
    if (!userId) return false;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to check usage');
      }

      const data = await response.json();
      return data.allowed;
    } catch (err) {
      console.error('Error checking usage:', err);
      return false;
    }
  }, [userId]);

  // Record usage after performing an action
  const recordUsage = useCallback(async (action: AIActionType): Promise<void> => {
    if (!userId) return;

    try {
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to record usage');
      }

      // Refresh usage stats after recording
      await fetchUsageStats();
    } catch (err) {
      console.error('Error recording usage:', err);
      throw err;
    }
  }, [userId, fetchUsageStats]);

  // Refresh usage stats
  const refreshUsage = useCallback(async () => {
    await fetchUsageStats();
  }, [fetchUsageStats]);

  // Load usage stats on mount and when userId changes
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  return {
    usageStats,
    isLoading,
    error,
    checkUsage,
    recordUsage,
    refreshUsage,
    resetTime,
  };
}

// Helper hook to get usage for a specific action
export function useActionUsage(userId: string | null, action: AIActionType) {
  const { usageStats, isLoading, error, refreshUsage } = useUsageTracker(userId);
  
  const actionUsage = usageStats?.find(stat => stat.action === action) || {
    action,
    used: 0,
    limit: 0,
    remaining: 0,
  };

  return {
    ...actionUsage,
    isLoading,
    error,
    hasReachedLimit: actionUsage.remaining === 0,
    refreshUsage,
  };
}
