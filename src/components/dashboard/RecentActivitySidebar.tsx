"use client";
import { RefreshCw, Loader2, Sparkle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentCreation {
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

interface RecentActivitySidebarProps {
  activities: RecentCreation[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function RecentActivitySidebar({
  activities,
  isLoading,
  onRefresh,
}: RecentActivitySidebarProps) {
  // Show only the 3 most recent activities
  const recentActivities = activities.slice(0, 3);

  const getActivityTitle = (creation: RecentCreation) => {
    switch (creation.action_type) {
      case 'article':
        return creation.input_params.topic as string || 'Article';
      case 'blog_title':
        return creation.input_params.keyword as string || 'Blog Titles';
      case 'image':
        return creation.input_params.prompt as string || 'Generated Image';
      default:
        return 'Content';
    }
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'article':
        return '📝';
      case 'blog_title':
        return '#️⃣';
      case 'image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Simple Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-medium text-slate-900 dark:text-white">Recent Activity</h3>
            {activities.length > 0 && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                {activities.length}
              </span>
            )}
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="p-4 space-y-3">
            {recentActivities.map((creation) => (
              <div
                key={creation.id}
                className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex-shrink-0 text-lg">
                  {getActivityIcon(creation.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {getActivityTitle(creation)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTimeAgo(creation.created_at)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Show more link if there are more activities */}
            {activities.length > 3 && (
              <div className="text-center pt-2">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View all {activities.length} activities →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Sparkle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}