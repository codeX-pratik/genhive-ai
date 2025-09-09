import { useState, useEffect, useCallback } from 'react';

interface UserStats {
  totalCreations: number;
  articlesCount: number;
  blogTitlesCount: number;
  imagesCount: number;
  backgroundRemovalsCount: number;
  objectRemovalsCount: number;
  resumeReviewsCount: number;
}

interface RecentActivity {
  id: string;
  action_type: string;
  input_params: Record<string, unknown>;
  content?: string;
  image_url?: string;
  created_at: string;
  status: string;
  model_used?: string;
  processing_time_ms?: number;
}

interface DashboardData {
  stats: UserStats;
  recentActivities: RecentActivity[];
}

export function useDashboard(userId: string | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/activities', {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Keep userId dependency but don't use this function in useEffect dependencies

  const refreshData = useCallback(() => {
    if (!userId) return;

    // Inline the fetch logic to avoid circular dependency
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/user/activities', {
          headers: {
            'Authorization': `Bearer ${userId}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]); // Only depend on userId

  // Initial data fetch when userId changes
  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, fetchDashboardData]); // Include fetchDashboardData but it's memoized with userId

  // Auto-refresh every 30 seconds when user is active
  // Temporarily disabled to prevent infinite loops
  // useEffect(() => {
  //   if (!userId) return;

  //   const interval = setInterval(() => {
  //     fetchDashboardData();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [userId]); // Only depend on userId

  return {
    data,
    isLoading,
    error,
    refreshData,
    refetch: fetchDashboardData,
  };
}
