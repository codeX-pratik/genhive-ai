// React hook for article generation
'use client';

import { useState, useCallback } from 'react';
import { useActionUsage } from './useUsageTracker';
import { SupabaseGenerationRecord } from '../types/supabase';
import { useToast } from './use-toast';

interface ArticleRequest {
  topic: string;
  length: number;
  style?: 'professional' | 'casual' | 'academic' | 'creative';
  tone?: 'informative' | 'persuasive' | 'narrative' | 'analytical';
}

interface ArticleResponse {
  success: boolean;
  article?: string;
  error?: string;
  usage?: {
    remaining: number;
    limit: number;
  };
}

interface UseArticleGeneratorReturn {
  generateArticle: (request: ArticleRequest) => Promise<ArticleResponse>;
  isLoading: boolean;
  error: string | null;
  hasReachedLimit: boolean;
  remaining: number;
  limit: number;
}

export function useArticleGenerator(userId: string | null): UseArticleGeneratorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    remaining, 
    limit, 
    hasReachedLimit, 
    isLoading: usageLoading,
    refreshUsage
  } = useActionUsage(userId, 'article');

  const generateArticle = useCallback(async (request: ArticleRequest): Promise<ArticleResponse> => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      if (!data.success || !data.data) {
        console.error('Article generation failed:', data);
        throw new Error(data.error || 'Failed to generate article');
      }

      await refreshUsage();

      const isTestMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true';

      toast({
        variant: "success",
        title: "Article Generated!",
        description: isTestMode
          ? 'Generated successfully in preview mode.'
          : `Your article has been generated successfully.`,
      });

      return { success: true, article: data.data.article, usage: data.data.usage };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({ variant: "destructive", title: "Generation Failed", description: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast, refreshUsage]);

  return {
    generateArticle,
    isLoading: isLoading || usageLoading,
    error,
    hasReachedLimit,
    remaining,
    limit
  };
}

export function useArticleHistory(userId: string | null) {
  const [articles, setArticles] = useState<SupabaseGenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles`, {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      setArticles(data.generations || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    articles,
    isLoading,
    error,
    fetchArticles,
    refetch: fetchArticles
  };
}
