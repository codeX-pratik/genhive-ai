"use client";
import React, { useState } from "react";
import { useUserService } from "@/lib/services/user-service";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { ContentViewer } from "@/components/common/ContentViewer";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { 
  FileText, 
  Hash, 
  Image as ImageIcon, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Stats shape inferred from API response; no local interface needed
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

export default function Dashboard() {
  const { user } = useUserService();
  const { data, isLoading, refreshData } = useDashboard(user?.id || null);
  const [selectedContent, setSelectedContent] = useState<RecentCreation | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const stats = data?.stats || {
    totalCreations: 0,
    articlesCount: 0,
    blogTitlesCount: 0,
    imagesCount: 0,
    backgroundRemovalsCount: 0,
    objectRemovalsCount: 0,
    resumeReviewsCount: 0,
  };
  const recentCreations = data?.recentActivities || [];

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleRefresh = () => {
    refreshData();
  };

  const handleViewContent = (content: RecentCreation) => {
    setSelectedContent(content);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedContent(null);
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/user/activities/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
        
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete content');
      }

      refreshData();
      
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  const quickActions = [
    {
      title: "Write Article",
      description: "Generate AI-powered articles",
      icon: <FileText className="w-5 h-5" />,
      href: "/ai/writearticle",
      color: "bg-green-500 hover:bg-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Blog Titles",
      description: "Create catchy blog titles",
      icon: <Hash className="w-5 h-5" />,
      href: "/ai/blogtitles",
      color: "bg-purple-500 hover:bg-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Generate Image",
      description: "Create AI-generated images",
      icon: <ImageIcon className="w-5 h-5" />,
      href: "/ai/generateimage",
      color: "bg-orange-500 hover:bg-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {today} • Ready to create something amazing?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalCreations}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Creations
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto scroll-smooth">
        {/* Horizontal Recent Activity Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              Recent Activity
            </h2>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : recentCreations.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {recentCreations.map((creation) => {
                  const getActivityTitle = (creation: RecentCreation) => {
                    switch (creation.action_type) {
                      case 'article':
                        return creation.input_params.topic as string || 'Article';
                      case 'blog_title':
                        return creation.input_params.keyword as string || 'Blog Titles';
                      case 'image':
                        return creation.input_params.prompt as string || 'Generated Image';
                      case 'background_removal':
                        return 'Background Removed';
                      case 'object_removal':
                        return 'Object Removed';
                      case 'resume_review':
                        return (creation.input_params as { fileName?: string })?.fileName || 'Resume Review';
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
                      case 'background_removal':
                        return '🧼';
                      case 'object_removal':
                        return '✂️';
                      case 'resume_review':
                        return '📄';
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
                    <div
                      key={creation.id}
                      className="flex-shrink-0 w-64 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-xl">
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="group block p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <div className={action.iconColor}>
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>
              </a>
            ))}
          </div>
        </div>


        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Your Statistics
          </h2>
          <StatsCards stats={stats} />
        </div>

        {/* Content Sections */}
        {stats.totalCreations > 0 ? (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-500" />
              Recent Creations
            </h2>
            
            {/* Articles Section */}
            {stats.articlesCount > 0 && (
              <ContentSection
                type="article"
                title="Articles"
                count={stats.articlesCount}
                description={`${stats.articlesCount} articles written`}
                icon={<FileText className="w-6 h-6" />}
                iconBg="bg-green-100 dark:bg-green-900/30"
                iconColor="text-green-600 dark:text-green-400"
                creations={recentCreations.filter(creation => creation.action_type === 'article')}
                onView={handleViewContent}
                onDelete={handleDeleteContent}
                createUrl="/ai/writearticle"
                gridCols="grid-cols-1 md:grid-cols-2"
              />
            )}

            {/* Blog Titles Section */}
            {stats.blogTitlesCount > 0 && (
              <ContentSection
                type="blog_title"
                title="Blog Titles"
                count={stats.blogTitlesCount}
                description={`${stats.blogTitlesCount} title sets generated`}
                icon={<Hash className="w-6 h-6" />}
                iconBg="bg-purple-100 dark:bg-purple-900/30"
                iconColor="text-purple-600 dark:text-purple-400"
                creations={recentCreations.filter(creation => creation.action_type === 'blog_title')}
                onView={handleViewContent}
                onDelete={handleDeleteContent}
                createUrl="/ai/blogtitles"
                gridCols="grid-cols-1 md:grid-cols-2"
              />
            )}

            {/* Images Section */}
            {stats.imagesCount > 0 && (
              <ContentSection
                type="image"
                title="Images"
                count={stats.imagesCount}
                description={`${stats.imagesCount} images generated`}
                icon={<ImageIcon className="w-6 h-6" />}
                iconBg="bg-orange-100 dark:bg-orange-900/30"
                iconColor="text-orange-600 dark:text-orange-400"
                creations={recentCreations.filter(creation => creation.action_type === 'image')}
                onView={handleViewContent}
                onDelete={handleDeleteContent}
                createUrl="/ai/generateimage"
                gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              />
            )}

            {/* Resume Reviews Section */}
            {stats.resumeReviewsCount > 0 && (
              <ContentSection
                type="resume_review"
                title="Resume Reviews"
                count={stats.resumeReviewsCount}
                description={`${stats.resumeReviewsCount} resumes reviewed`}
                icon={<FileText className="w-6 h-6" />}
                iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                iconColor="text-emerald-600 dark:text-emerald-400"
                creations={recentCreations.filter(creation => creation.action_type === 'resume_review')}
                onView={handleViewContent}
                onDelete={handleDeleteContent}
                createUrl="/ai/reviewresume"
                gridCols="grid-cols-1 md:grid-cols-2"
              />
            )}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState />
          </div>
        )}

      </div>

      {/* Content Viewer Modal */}
      <ContentViewer
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        content={selectedContent}
        onDelete={handleDeleteContent}
      />
    </div>
  );
}