"use client";
import { Gem, Sparkle, Calendar, TrendingUp, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import CreationItem from "@/components/CreationItem";
import { Creation, dummyCreationData } from "@/lib/asset";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const [creationData, setCreationData] = useState<Creation[]>([]);
  const { user } = useUser();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    setCreationData(dummyCreationData);
  }, []);

  // Calculate some stats
  const totalCreations = creationData.length;
  const articlesCount = creationData.filter(item => item.type === 'article').length;
  const blogTitlesCount = creationData.filter(item => item.type === 'blog-title').length;
  const imagesCount = creationData.filter(item => item.type === 'image').length;

  return (
    <div className="min-h-full overflow-y-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {today}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Creation Card */}
        <div className="flex justify-between items-center p-6 bg-card rounded-xl border">
          <div className="text-card-foreground">
            <p className="text-sm text-muted-foreground">Total Creations</p>
            <h2 className="text-2xl font-bold">{totalCreations}</h2>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2588f2] to-[#0bb0df] text-white flex justify-center items-center">
            <Sparkle className="w-6 h-6" />
          </div>
        </div>

        {/* Articles Card */}
        <div className="flex justify-between items-center p-6 bg-card rounded-xl border">
          <div className="text-card-foreground">
            <p className="text-sm text-muted-foreground">Articles Written</p>
            <h2 className="text-2xl font-bold">{articlesCount}</h2>
            <p className="text-xs text-muted-foreground mt-1">AI-powered</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex justify-center items-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Blog Titles Card */}
        <div className="flex justify-between items-center p-6 bg-card rounded-xl border">
          <div className="text-card-foreground">
            <p className="text-sm text-muted-foreground">Blog Titles</p>
            <h2 className="text-2xl font-bold">{blogTitlesCount}</h2>
            <p className="text-xs text-muted-foreground mt-1">Generated</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white flex justify-center items-center">
            <Sparkle className="w-6 h-6" />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="flex justify-between items-center p-6 bg-card rounded-xl border">
          <div className="text-card-foreground">
            <p className="text-sm text-muted-foreground">Your Plan</p>
            <h2 className="text-2xl font-bold">Premium</h2>
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff61c5] to-[#9e53ee] text-white flex justify-center items-center">
            <Gem className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <p className="text-muted-foreground">Your latest creations</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{creationData.length} items</span>
          </div>
        </div>

        <div className="space-y-4">
          {creationData.length > 0 ? (
            creationData.map((item) => (
              <CreationItem
                key={item.id}
                item={{
                  prompt: item.prompt,
                  type: item.type,
                  createdAt: item.created_at,
                  content: item.content,
                }}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Sparkle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No creations yet</h3>
              <p className="text-muted-foreground">Start creating with our AI tools!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2588f2]"></div>
            <span>{totalCreations} total creations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span>{articlesCount} articles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span>{blogTitlesCount} blog titles</span>
          </div>
          {imagesCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff61c5]"></div>
              <span>{imagesCount} images</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}