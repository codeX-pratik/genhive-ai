import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdFromRequest } from "@/lib/middleware/api-wrapper";
import { APIError, handleDatabaseError, NotFoundError } from "@/lib/errors/api-errors";

interface UpdateImageRequest {
  isPublic: boolean;
}

async function handleUpdateImage(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { id: imageId } = await params;

  if (!imageId) {
    throw new APIError('Image ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const body: UpdateImageRequest = await request.json();
    const { isPublic } = body;

    if (typeof isPublic !== 'boolean') {
      throw new APIError('isPublic must be a boolean value', 400, 'VALIDATION_ERROR');
    }

    // First, check if the image exists and belongs to the user
    const { data: existingImage, error: fetchError } = await SupabaseService.select(
      'ai_generations',
      'id, user_id, action_type',
      {
        id: imageId,
        user_id: userId,
        action_type: 'image',
        is_deleted: false
      }
    );

    if (fetchError) {
      throw handleDatabaseError(fetchError);
    }

    if (!existingImage || existingImage.length === 0) {
      throw new NotFoundError('Image not found or you do not have permission to update it');
    }

    // Update the image's public status
    const { error: updateError } = await SupabaseService.update(
      'ai_generations',
      { is_public: isPublic },
      { id: imageId }
    );

    if (updateError) {
      throw handleDatabaseError(updateError);
    }

    return createSuccessResponse({
      success: true,
      message: `Image ${isPublic ? 'made public' : 'made private'} successfully`,
      isPublic
    });

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to update image', 500, 'DATABASE_ERROR');
  }
}

async function handleDeleteImage(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { id: imageId } = await params;

  if (!imageId) {
    throw new APIError('Image ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    // First, check if the image exists and belongs to the user
    const { data: existingImage, error: fetchError } = await SupabaseService.select(
      'ai_generations',
      'id, user_id, action_type',
      {
        id: imageId,
        user_id: userId,
        action_type: 'image',
        is_deleted: false
      }
    );

    if (fetchError) {
      throw handleDatabaseError(fetchError);
    }

    if (!existingImage || existingImage.length === 0) {
      throw new NotFoundError('Image not found or you do not have permission to delete it');
    }

    // Soft delete the image
    const { error: deleteError } = await SupabaseService.update(
      'ai_generations',
      { 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      },
      { id: imageId }
    );

    if (deleteError) {
      throw handleDatabaseError(deleteError);
    }

    return createSuccessResponse({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to delete image', 500, 'DATABASE_ERROR');
  }
}

// Create the secure API routes
export const PUT = createAPIRoute(handleUpdateImage, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  logRequests: false // Disable request logging to hide userId parameters
});

export const DELETE = createAPIRoute(handleDeleteImage, {
  ...commonAPIConfigs.general,
  requireAuth: true,
  logRequests: false // Disable request logging to hide userId parameters
});
