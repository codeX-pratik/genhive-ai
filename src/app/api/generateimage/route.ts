import { NextRequest, NextResponse } from "next/server";
import { UsageTracker } from "@/lib/usage-tracker";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { v2 as cloudinary } from 'cloudinary';
import { createAPIRoute, validateRequestBody, createSuccessResponse, commonAPIConfigs, getUserIdAndEnsureExists } from "@/lib/middleware/api-wrapper";
import { imageGenerationRequestSchema } from "@/lib/validation/schemas";
import { APIError, ExternalServiceError } from "@/lib/errors/api-errors";
// Using native FormData

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handleImageGeneration(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdAndEnsureExists(request);
  const body = await validateRequestBody(request, imageGenerationRequestSchema);
  const { prompt, style = 'realistic', isPublic = false } = body;

  // Check usage (UsageTracker has test override built-in)
  const usageCheck = await UsageTracker.checkUsage(userId, 'image');
  if (!usageCheck.allowed) {
    throw new APIError(
      "Daily image generation limit reached. Please try again tomorrow.",
      429,
      'USAGE_LIMIT_EXCEEDED',
      { remaining: usageCheck.remaining, limit: usageCheck.limit }
    );
  }

  const clipdropApiKey = process.env.CLIPDROP_API_KEY;
  if (!clipdropApiKey) {
    console.error('CLIPDROP_API_KEY is not configured in environment variables');
    throw new ExternalServiceError('Clipdrop', 'API key not configured');
  }

  const stylePrompts = {
    realistic: "photorealistic, high quality, detailed",
    anime: "anime style, manga art, japanese animation",
    cartoon: "cartoon style, colorful, animated",
    fantasy: "fantasy art, magical, mystical",
    "3d": "3D rendered, CGI, digital art",
    portrait: "portrait photography, professional headshot",
    ghibli: "Studio Ghibli style, Miyazaki art, japanese animation",
    artistic: "artistic style, creative, expressive"
  } as const;

  const enhancedPrompt = `${prompt}, ${stylePrompts[style]}, high quality, detailed`;

  const startTime = Date.now();

  try {
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);

    const clipdropResponse = await fetch('https://clipdrop-api.co/text-to-image/v1', {
      method: 'POST',
      headers: { 'x-api-key': clipdropApiKey },
      body: formData,
    });

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text();
      console.error('Clipdrop API Error:', { status: clipdropResponse.status, statusText: clipdropResponse.statusText, errorText, url: 'https://clipdrop-api.co/text-to-image/v1' });
      throw new ExternalServiceError('Clipdrop', `API error: ${clipdropResponse.status} - ${errorText}`);
    }

    const imageBuffer = await clipdropResponse.arrayBuffer();
    const processingTime = Date.now() - startTime;

    const cloudinaryResult = await new Promise<{
      secure_url: string;
      format: string;
      bytes: number;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `genhive-ai/images/${userId}`,
          public_id: `generated_${Date.now()}`,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; format: string; bytes: number; public_id: string; });
        }
      );

      uploadStream.end(Buffer.from(imageBuffer));
    });

    const imageUrl = cloudinaryResult.secure_url;

    // Record usage (skipped automatically in test override)
    await UsageTracker.recordUsage(userId, 'image');

    const inputParams = { prompt, style, isPublic };

    const imageMetadata = {
      style,
      format: cloudinaryResult.format,
      size: cloudinaryResult.bytes,
      cloudinaryId: cloudinaryResult.public_id,
      note: 'Clipdrop default dimensions'
    };

    const { error: dbError } = await SupabaseService.insertWithServiceRole('ai_generations', {
      user_id: userId,
      action_type: 'image',
      input_params: inputParams,
      image_url: imageUrl,
      image_metadata: imageMetadata,
      processing_time_ms: processingTime,
      model_used: 'clipdrop-text-to-image',
      status: 'completed',
      is_public: isPublic
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Recompute usage for response
    const updatedUsage = await UsageTracker.checkUsage(userId, 'image');

    return createSuccessResponse({
      imageUrl,
      isPublic,
      usage: { remaining: updatedUsage.remaining, limit: updatedUsage.limit }
    });

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new ExternalServiceError('Image Generation', 'Failed to generate image');
  }
}

export const POST = createAPIRoute(handleImageGeneration, {
  ...commonAPIConfigs.ai,
  schema: imageGenerationRequestSchema,
});
