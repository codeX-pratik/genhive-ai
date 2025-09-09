import { NextRequest, NextResponse } from "next/server";
import { createAPIRoute, commonAPIConfigs, getUserIdAndEnsureExists } from "@/lib/middleware/api-wrapper";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { APIError } from "@/lib/errors/api-errors";

async function handleToggleLike(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const userId = await getUserIdAndEnsureExists(request);
  const { id: imageId } = await context.params;

  if (!imageId) {
    throw new APIError('Missing image id', 400, 'INVALID_REQUEST');
  }

  // Ensure the image exists and is public
  const { data: imageRows, error: imageError } = await SupabaseService.selectWithServiceRole(
    'ai_generations',
    'id, user_id, input_params, is_public, action_type, is_deleted, status',
    { id: imageId }
  );

  if (imageError) {
    throw new APIError('Failed to fetch image', 500, 'DATABASE_ERROR', imageError);
  }

  const image = (imageRows as unknown[])[0] as { id: string; user_id: string; input_params?: { prompt?: string }; is_public?: boolean; action_type?: string; is_deleted?: boolean; status?: string } | undefined;

  if (!image || image.action_type !== 'image' || image.is_deleted || image.status !== 'completed') {
    throw new APIError('Image not found', 404, 'NOT_FOUND');
  }
  if (!image.is_public) {
    throw new APIError('Image is not public', 403, 'FORBIDDEN');
  }

  // Ensure a community_post exists for this image so likes can target post_id
  const { data: existingPosts, error: postCheckError } = await SupabaseService.selectWithServiceRole(
    'community_posts',
    'id',
    { generation_id: image.id, is_deleted: false }
  );
  if (postCheckError) {
    throw new APIError('Failed to check community post', 500, 'DATABASE_ERROR', postCheckError);
  }

  let postId: string | null = Array.isArray(existingPosts) && (existingPosts as unknown[]).length > 0
    ? ((existingPosts as unknown[])[0] as { id: string }).id
    : null;
  if (!postId) {
    const title = image.input_params?.prompt || 'Public Image';
    const { data: insertPost, error: createPostError } = await SupabaseService.insertWithServiceRole('community_posts', {
      user_id: image.user_id,
      generation_id: image.id,
      title,
      description: null,
      tags: [],
      is_public: true,
    });
    if (createPostError) {
      throw new APIError('Failed to create community post', 500, 'DATABASE_ERROR', createPostError);
    }
    if (!Array.isArray(insertPost) || (insertPost as unknown[]).length === 0) {
      throw new APIError('Failed to create community post', 500, 'DATABASE_ERROR');
    }
    postId = ((insertPost as unknown[])[0] as { id: string }).id;
  }

  // Check if like exists for this post
  const { data: likeRows, error: likeCheckError } = await SupabaseService.selectWithServiceRole(
    'likes',
    'id',
    { user_id: userId, post_id: postId }
  );

  if (likeCheckError) {
    throw new APIError('Failed to check like status', 500, 'DATABASE_ERROR', likeCheckError);
  }

  const hasLike = Array.isArray(likeRows) && likeRows.length > 0;

  if (hasLike) {
    // Remove like
    const likeId = (likeRows as unknown[])[0] as { id: string };
    const { error: deleteError } = await SupabaseService.deleteWithServiceRole('likes', { id: (likeId as { id: string }).id });
    if (deleteError) {
      throw new APIError('Failed to remove like', 500, 'DATABASE_ERROR', deleteError);
    }
    return NextResponse.json({ success: true, liked: false });
  }

  // Add like
  const { error: insertError } = await SupabaseService.insertWithServiceRole('likes', {
    user_id: userId,
    post_id: postId,
    created_at: new Date().toISOString(),
  });
  if (insertError) {
    throw new APIError('Failed to add like', 500, 'DATABASE_ERROR', insertError);
  }

  return NextResponse.json({ success: true, liked: true });
}

export const POST = createAPIRoute(handleToggleLike, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  rateLimit: { type: 'general', identifier: 'userId' }
});


