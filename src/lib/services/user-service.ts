import { useUser, useClerk } from '@clerk/nextjs';
import { useMemo } from 'react';
import { SubscriptionTier } from '@/lib/database/subscription-manager';

// Types
export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionDisplayName: string;
  isPremium: boolean;
  isLoaded: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  lastSignInAt?: Date | null;
  hasVerifiedEmail: boolean;
  externalAccounts?: unknown[];
  organizationMemberships?: unknown[];
}

export interface UserUsageInfo {
  subscriptionTier: SubscriptionTier;
  limits: Record<string, number>;
  isPremium: boolean;
  testingMode: boolean;
}

export interface ClerkUserData {
  id: string;
  emailAddresses?: Array<{ emailAddress: string; id: string }>;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastSignInAt?: Date;
  hasVerifiedEmailAddress?: boolean;
  externalAccounts?: unknown[];
  organizationMemberships?: unknown[];
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
}

// Client-side hook for user data
export function useUserService() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const userProfile: UserProfile | null = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      fullName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.firstName || user.lastName || user.username || 'User',
      imageUrl: user.imageUrl || undefined,
      subscriptionTier: 'free', // Will be updated from database
      subscriptionDisplayName: 'Free',
      isPremium: false, // Will be updated from database
      isLoaded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSignInAt: user.lastSignInAt,
      hasVerifiedEmail: (user as unknown as { hasVerifiedEmailAddress?: boolean }).hasVerifiedEmailAddress || false,
      externalAccounts: (user as unknown as { externalAccounts?: unknown[] }).externalAccounts,
      organizationMemberships: (user as unknown as { organizationMemberships?: unknown[] }).organizationMemberships,
    };
  }, [user, isLoaded]); // Depend on user object and isLoaded

  return {
    user: userProfile,
    isLoaded,
    signOut,
    openUserProfile,
    isAuthenticated: !!user,
  };
}

// Client-side utility functions
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
