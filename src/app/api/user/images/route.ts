import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdFromRequest } from "@/lib/middleware/api-wrapper";
import { APIError, handleDatabaseError } from "@/lib/errors/api-errors";

interface UserImagesResponse {
  success: boolean;
  images: Array<{
    id: string;
    imageUrl: string;
    prompt: string;
    style: string;
    isPublic: boolean;
    createdAt: string;
    metadata: {
      width: number;
      height: number;
      format: string;
      size: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

async function handleGetUserImages(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Max 1000 per page for testing
  const style = searchParams.get('style') || null;
  const isPublic = searchParams.get('isPublic') || null;

  const offset = (page - 1) * limit;

  try {
    // Build query conditions
    const conditions: Record<string, unknown> = {
      user_id: userId,
      action_type: 'image',
      is_deleted: false,
      status: 'completed'
    };

    // Add style filter if provided
    if (style) {
      conditions['input_params->style'] = style;
    }

    // Add public/private filter if provided
    if (isPublic !== null) {
      conditions.is_public = isPublic === 'true';
    }

    // Get total count for pagination
    const { data: countData, error: countError } = await SupabaseService.select(
      'ai_generations',
      'count(*)',
      conditions
    );

    if (countError) {
      throw handleDatabaseError(countError);
    }

    const total = (countData as unknown[])?.[0] ? ((countData as unknown[])[0] as { count: number }).count : 0;

    // Get user's images
    const { data: images, error } = await SupabaseService.select(
      'ai_generations',
      'id, image_url, input_params, image_metadata, is_public, created_at',
      conditions
    );

    if (error) {
      throw handleDatabaseError(error);
    }

    // Format the response
    const formattedImages = (images as unknown[]).map((img: unknown) => {
      const imgData = img as {
        id: string;
        image_url: string;
        input_params: { prompt?: string; style?: string };
        image_metadata: { width?: number; height?: number; format?: string; size?: number };
        is_public: boolean;
        created_at: string;
      };
      return {
        id: imgData.id,
        imageUrl: imgData.image_url,
        prompt: imgData.input_params?.prompt || '',
        style: imgData.input_params?.style || 'realistic',
        isPublic: imgData.is_public || false,
        createdAt: imgData.created_at,
        metadata: {
          width: imgData.image_metadata?.width || 1024,
          height: imgData.image_metadata?.height || 1024,
          format: imgData.image_metadata?.format || 'jpg',
          size: imgData.image_metadata?.size || 0
        }
      };
    });

    const response: UserImagesResponse = {
      success: true,
      images: formattedImages,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total
      }
    };

    return createSuccessResponse(response);

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to fetch user images', 500, 'DATABASE_ERROR');
  }
}

// Create the secure API route
export const GET = createAPIRoute(handleGetUserImages, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  logRequests: false // Disable request logging to hide userId parameters
});
