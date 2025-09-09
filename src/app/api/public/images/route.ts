import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs } from "@/lib/middleware/api-wrapper";
import { APIError, handleDatabaseError } from "@/lib/errors/api-errors";
import { getPublicImagesLimit } from "@/lib/config/pagination";

interface PublicImagesResponse {
  success: boolean;
  images: Array<{
    id: string;
    imageUrl: string;
    prompt: string;
    style: string;
    createdAt: string;
    user: {
      name: string;
      avatarUrl?: string;
    };
    metadata: {
      width: number;
      height: number;
      format: string;
    };
    likesCount: number;
    liked: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

async function handleGetPublicImages(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = getPublicImagesLimit();
  // const style = searchParams.get('style') || null;
  // const search = searchParams.get('search') || null;

      // const offset = (page - 1) * limit; // Not used in current implementation

  try {
    // Build query conditions
    const conditions: Record<string, unknown> = {
      action_type: 'image',
      is_public: true,
      is_deleted: false,
      status: 'completed'
    };

    // Get public images
    const { data: images, error } = await SupabaseService.select(
      'ai_generations',
      'id, image_url, input_params, image_metadata, created_at, user_id',
      conditions
    );

    if (error) {
      throw handleDatabaseError(error);
    }

    // Optional user id from Authorization (Bearer <userId>) for liked state
    const authHeader = request.headers.get('authorization') || '';
    const maybeUserId = authHeader.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length).trim()
      : '';

    // Get user information for the images
    const userIds = [...new Set((images as unknown[]).map((img: unknown) => (img as { user_id: string }).user_id))];
    // Try selecting username first; fallback if column doesn't exist
    let profiles: unknown[] | null = null;
    {
      const { data: p1, error: e1 } = await SupabaseService.selectWithServiceRole(
        'profiles',
        'user_id, username, full_name, email, avatar_url',
        { user_id: userIds }
      );
      if (!e1) {
        profiles = (p1 as unknown[]) || [];
      } else {
        const { data: p2, error: e2 } = await SupabaseService.selectWithServiceRole(
          'profiles',
          'user_id, full_name, email, avatar_url',
          { user_id: userIds }
        );
        if (e2) {
          console.warn('Failed to fetch user profiles:', e2);
          profiles = [];
        } else {
          profiles = (p2 as unknown[]) || [];
        }
      }
    }

    const profilesMap = new Map((profiles)?.map((p: unknown) => [(p as { user_id: string }).user_id, p]) || []);

    // Fetch community_posts and likes to compute likesCount and liked
    const generationIds = (images as unknown[]).map((img: unknown) => (img as { id: string }).id);
    const { data: posts } = await SupabaseService.selectWithServiceRole(
      'community_posts',
      'id, generation_id, likes_count, is_deleted',
      { generation_id: generationIds, is_deleted: false }
    );
    const genIdToPost = new Map(
      ((posts as unknown[]) || []).map((p: unknown) => {
        const row = p as { id: string; generation_id: string; likes_count?: number };
        return [row.generation_id, row];
      })
    );

    let likedPostIds = new Set<string>();
    if (maybeUserId && Array.isArray(posts) && posts.length > 0) {
      const postIds = (posts as unknown[]).map(p => (p as { id: string }).id);
      const { data: likes } = await SupabaseService.selectWithServiceRole(
        'likes',
        'post_id',
        { user_id: maybeUserId, post_id: postIds }
      );
      likedPostIds = new Set(((likes as unknown[]) || []).map(l => (l as { post_id: string }).post_id));
    }

    // Format the response
    const formattedImages = (images as unknown[]).map((img: unknown) => {
      const imgData = img as { 
        id: string; 
        image_url: string; 
        input_params: { prompt?: string; style?: string }; 
        image_metadata: { width?: number; height?: number; format?: string };
        created_at: string;
        user_id: string;
      };
      const profile = profilesMap.get(imgData.user_id) as { username?: string; full_name?: string; email?: string; avatar_url?: string } | undefined;
      const postRow = genIdToPost.get(imgData.id) as { id: string; likes_count?: number } | undefined;
      const postId = postRow?.id;
      const likesCount = postRow?.likes_count ?? 0;
      const liked = postId ? likedPostIds.has(postId) : false;
      return {
        id: imgData.id,
        imageUrl: imgData.image_url,
        prompt: imgData.input_params?.prompt || '',
        style: imgData.input_params?.style || 'realistic',
        createdAt: imgData.created_at,
        user: {
          name: profile?.username || (profile?.email ? profile.email.split('@')[0] : (profile?.full_name || 'Anonymous')),
          avatarUrl: profile?.avatar_url
        },
        metadata: {
          width: imgData.image_metadata?.width || 1024,
          height: imgData.image_metadata?.height || 1024,
          format: imgData.image_metadata?.format || 'jpg'
        },
        likesCount,
        liked
      };
    });

    // Get total count for pagination (simplified)
    const total = formattedImages.length;

    const response: PublicImagesResponse = {
      success: true,
      images: formattedImages,
      pagination: {
        page,
        limit,
        total,
        hasMore: formattedImages.length === limit
      }
    };

    return createSuccessResponse(response);

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to fetch public images', 500, 'DATABASE_ERROR');
  }
}

// Create the secure API route
export const GET = createAPIRoute(handleGetPublicImages, {
  ...commonAPIConfigs.public,
});
