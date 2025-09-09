import { useEffect, useState, useRef } from 'react';
import { useUserService, UserProfile, UserUsageInfo } from '@/lib/services/user-service';

// Hook for getting complete user data with subscription info
export function useUserData() {
  const { user, isLoaded, isAuthenticated } = useUserService();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usageInfo, setUsageInfo] = useState<UserUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef<string | null>(null); // Track which user we've fetched data for

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthenticated || !user) {
      setUserProfile(null);
      setUsageInfo(null);
      setIsLoading(false);
      hasFetchedRef.current = null;
      return;
    }

    // Check if we've already fetched data for this user
    if (hasFetchedRef.current === user.id) {
      return;
    }

    // Fetch subscription data from API
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        hasFetchedRef.current = user.id; // Mark as fetched
        
        // Fetch user profile with subscription info
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
          setUsageInfo(data.usageInfo);
        } else {
          // Fallback to basic user data
          setUserProfile(user);
          setUsageInfo({
            subscriptionTier: 'free',
            limits: {},
            isPremium: false,
            testingMode: false,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to basic user data
        setUserProfile(user);
        setUsageInfo({
          subscriptionTier: 'free',
          limits: {},
          isPremium: false,
          testingMode: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isAuthenticated, user?.id, user]); // Include user for completeness but use ref to prevent infinite calls

  return {
    user: userProfile,
    usageInfo,
    isLoaded: isLoaded && !isLoading,
    isLoading,
    isAuthenticated,
  };
}

// Hook for getting just user profile (without subscription data)
export function useUserProfile() {
  const { user, isLoaded, isAuthenticated } = useUserService();
  
  return {
    user,
    isLoaded,
    isAuthenticated,
  };
}

// Hook for getting user subscription info
export function useUserSubscription() {
  const { user, isLoaded, isAuthenticated } = useUserService();
  const [subscriptionInfo, setSubscriptionInfo] = useState<UserUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef<string | null>(null); // Track which user we've fetched data for

  useEffect(() => {
    if (!isLoaded || !isAuthenticated || !user) {
      setSubscriptionInfo(null);
      setIsLoading(false);
      hasFetchedRef.current = null;
      return;
    }

    // Check if we've already fetched data for this user
    if (hasFetchedRef.current === user.id) {
      return;
    }

    const fetchSubscriptionInfo = async () => {
      try {
        setIsLoading(true);
        hasFetchedRef.current = user.id; // Mark as fetched
        
        const response = await fetch('/api/user/usage-status', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo(data.usageInfo);
        } else {
          setSubscriptionInfo({
            subscriptionTier: 'free',
            limits: {},
            isPremium: false,
            testingMode: false,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        setSubscriptionInfo({
          subscriptionTier: 'free',
          limits: {},
          isPremium: false,
          testingMode: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [isLoaded, isAuthenticated, user?.id, user]); // Include user for completeness but use ref to prevent infinite calls

  return {
    subscriptionInfo,
    isLoaded: isLoaded && !isLoading,
    isLoading,
    isAuthenticated,
  };
}

// Hook for checking if user has specific subscription tier
export function useSubscriptionCheck(requiredTier: 'free' | 'pro') {
  const { subscriptionInfo, isLoaded } = useUserSubscription();
  
  const hasAccess = subscriptionInfo ? 
    (requiredTier === 'free' || subscriptionInfo.subscriptionTier === 'pro') : false;

  return {
    hasAccess,
    isLoaded,
    subscriptionTier: subscriptionInfo?.subscriptionTier || 'free',
    isPremium: subscriptionInfo?.isPremium || false,
  };
}

// Hook for getting user display information
export function useUserDisplay() {
  const { user, isLoaded, isAuthenticated } = useUserService();
  
  const displayName = user ? 
    (user.fullName || user.firstName || user.lastName || user.username || user.email?.split('@')[0] || 'User') : 
    'User';
  
  const avatarUrl = user?.imageUrl;
  const email = user?.email;
  const username = user?.username;

  return {
    displayName,
    avatarUrl,
    email,
    username,
    isLoaded,
    isAuthenticated,
  };
}
