'use client';

import { useState } from 'react';
import { useActionUsage } from '@/lib/hooks/useUsageTracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIActionType } from '@/lib/usage-tracker';
import { Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

interface AIActionWrapperProps {
  userId: string | null;
  action: AIActionType;
  onAction: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function AIActionWrapper({ 
  userId, 
  action, 
  onAction, 
  children, 
  className 
}: AIActionWrapperProps) {
  const { limit, remaining, hasReachedLimit, isLoading } = useActionUsage(userId, action);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    if (hasReachedLimit || !userId) {
      // Show toast notification for limit reached
      toast({
        variant: "destructive",
        title: "Daily Limit Reached",
        description: `You've reached your daily limit for ${action.replace('_', ' ')}. Usage resets at midnight UTC.`,
      });
      return;
    }

    setIsExecuting(true);
    try {
      // Record usage before performing the action
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

      // Perform the actual AI action
      await onAction();
      
      // Show success toast
      toast({
        variant: "success",
        title: "Action Completed",
        description: `${action.replace('_', ' ')} generated successfully!`,
      });
    } catch (error) {
      console.error('Error performing AI action:', error);
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete the action. Please try again.",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Usage indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <Badge variant={hasReachedLimit ? 'destructive' : 'secondary'}>
          {remaining}/{limit}
        </Badge>
      </div>

      {/* Limit reached warning */}
      {hasReachedLimit && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">
              You&apos;ve reached your daily limit for this action. Usage resets at midnight UTC.
            </p>
          </div>
        </div>
      )}

      {/* Action content */}
      {children}

      {/* Action button */}
      <Button
        onClick={handleAction}
        disabled={hasReachedLimit || isExecuting || !userId}
        className="w-full mt-4"
      >
        {isExecuting ? 'Processing...' : `Generate ${action.replace('_', ' ')}`}
      </Button>
    </div>
  );
}
