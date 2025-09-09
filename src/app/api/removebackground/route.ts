import { NextRequest, NextResponse } from "next/server";
import { UsageTracker } from "@/lib/usage-tracker";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { v2 as cloudinary } from 'cloudinary';
// Using native FormData

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface BackgroundRemovalResponse {
  success: boolean;
  processedImageUrl?: string;
  error?: string;
  usage?: {
    remaining: number;
    limit: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const imageFile = formData.get('image') as File;
    const isPublic = formData.get('isPublic') === 'true';

    if (!userId || !imageFile) {
      return NextResponse.json({ success: false, error: "User ID and image file are required" }, { status: 400 });
    }

    // Check usage (UsageTracker has test override built-in)
    const usageCheck = await UsageTracker.checkUsage(userId, 'background_removal');
    if (!usageCheck.allowed) {
      return NextResponse.json({ success: false, error: "Daily background removal limit reached. Please try again tomorrow.", usage: { remaining: usageCheck.remaining, limit: usageCheck.limit } }, { status: 429 });
    }

    const clipdropApiKey = process.env.CLIPDROP_API_KEY;
    if (!clipdropApiKey) {
      throw new Error('CLIPDROP_API_KEY is not configured');
    }

    const startTime = Date.now();

    const imageBuffer = await imageFile.arrayBuffer();

    const clipdropFormData = new FormData();
    const blob = new Blob([imageBuffer], { type: imageFile.type });
    clipdropFormData.append('image_file', blob, imageFile.name);

    const clipdropResponse = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: { 'x-api-key': clipdropApiKey },
      body: clipdropFormData,
    });

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text();
      throw new Error(`Clipdrop API error: ${clipdropResponse.status} - ${errorText}`);
    }

    const processedImageBuffer = await clipdropResponse.arrayBuffer();
    const processingTime = Date.now() - startTime;

    const cloudinaryResult = await new Promise<{
      secure_url: string;
      format: string;
      bytes: number;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `genhive-ai/background-removal/${userId}`,
          public_id: `bg_removed_${Date.now()}`,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'png',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; format: string; bytes: number; public_id: string; });
        }
      );

      uploadStream.end(Buffer.from(processedImageBuffer));
    });

    const processedImageUrl = cloudinaryResult.secure_url;

    // Record usage (skipped automatically in test override)
    await UsageTracker.recordUsage(userId, 'background_removal');

    const inputParams = { fileName: imageFile.name, fileSize: imageFile.size, isPublic };

    const imageMetadata = {
      originalFileName: imageFile.name,
      originalFileSize: imageFile.size,
      format: cloudinaryResult.format,
      size: cloudinaryResult.bytes,
      cloudinaryId: cloudinaryResult.public_id,
      hasTransparency: true
    };

    const { error: dbError } = await SupabaseService.insertWithServiceRole('ai_generations', {
      user_id: userId,
      action_type: 'background_removal',
      input_params: inputParams,
      image_url: processedImageUrl,
      image_metadata: imageMetadata,
      processing_time_ms: processingTime,
      model_used: 'clipdrop-background-removal',
      status: 'completed'
    });

    if (dbError) {
      // Database error during save
    }

    // Recompute usage for response
    const updatedUsage = await UsageTracker.checkUsage(userId, 'background_removal');

    const response: BackgroundRemovalResponse = {
      success: true,
      processedImageUrl,
      usage: { remaining: updatedUsage.remaining, limit: updatedUsage.limit }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Background removal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove background';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
