'use client';

import { useUsageTracker } from '@/lib/hooks/useUsageTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

interface UsageDisplayProps {
  userId: string | null;
  className?: string;
}

export function UsageDisplay({ userId, className }: UsageDisplayProps) {
  const { usageStats, isLoading, error, resetTime } = useUsageTracker(userId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Daily Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Daily Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error loading usage: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!usageStats) {
    return null;
  }

  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  const getUsageBadgeVariant = (remaining: number, limit: number) => {
    const percentage = (remaining / limit) * 100;
    if (percentage > 50) return 'default';
    if (percentage > 25) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Daily Usage
        </CardTitle>
        {resetTime && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Resets at {new Date(resetTime).toLocaleTimeString()}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {usageStats.map((stat) => (
          <div key={stat.action} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {formatActionName(stat.action)}
              </span>
              <Badge variant={getUsageBadgeVariant(stat.remaining, stat.limit)}>
                {stat.remaining}/{stat.limit}
              </Badge>
            </div>
            <Progress
              value={(stat.used / stat.limit) * 100}
              className="h-2"
            />
            {stat.remaining === 0 && (
              <p className="text-xs text-red-500">
                Daily limit reached
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Compact version for smaller spaces
export function UsageDisplayCompact({ userId, className }: UsageDisplayProps) {
  const { usageStats, isLoading, error } = useUsageTracker(userId);

  if (isLoading || error || !usageStats) {
    return null;
  }

  const totalUsed = usageStats.reduce((sum, stat) => sum + stat.used, 0);
  const totalLimit = usageStats.reduce((sum, stat) => sum + stat.limit, 0);
  const totalRemaining = totalLimit - totalUsed;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Zap className="h-4 w-4" />
      <span>Usage: {totalRemaining}/{totalLimit}</span>
      <Progress
        value={(totalUsed / totalLimit) * 100}
        className="h-1 w-16"
      />
    </div>
  );
}
