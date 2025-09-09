"use client";
import { FileText, Hash, Image as ImageIcon, Sparkle } from "lucide-react";

interface UserStats {
  totalCreations: number;
  articlesCount: number;
  blogTitlesCount: number;
  imagesCount: number;
  backgroundRemovalsCount: number;
  objectRemovalsCount: number;
  resumeReviewsCount: number;
}

interface StatsCardsProps {
  stats: UserStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Articles</p>
            <p className="text-xl font-bold text-foreground">{stats.articlesCount}</p>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Blog Titles</p>
            <p className="text-xl font-bold text-foreground">{stats.blogTitlesCount}</p>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Images</p>
            <p className="text-xl font-bold text-foreground">{stats.imagesCount}</p>
          </div>
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <ImageIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resume Reviews</p>
            <p className="text-xl font-bold text-foreground">{stats.resumeReviewsCount}</p>
          </div>
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">{stats.totalCreations}</p>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Sparkle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
