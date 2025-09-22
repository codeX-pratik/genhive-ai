import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';
import OpenAI from "openai";
import { UsageTracker } from "@/lib/usage-tracker";
import { SupabaseService } from "@/lib/database/supabase-utils";
// Dynamic import for pdf-parse to avoid build issues
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }
  return client;
}

interface ResumeReviewResponse {
  success: boolean;
  review?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keywordMatch: string[];
    missingKeywords: string[];
    summary: string;
  };
  extractedText?: string;
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
    const file = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const targetRole = formData.get('targetRole') as string;

    if (!userId || !file) {
      return NextResponse.json({ success: false, error: "User ID and file are required" }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "The PDF file is empty" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    const pdfSignature = uint8Array.slice(0, 4);
    const isPDF = pdfSignature[0] === 0x25 && pdfSignature[1] === 0x50 && pdfSignature[2] === 0x44 && pdfSignature[3] === 0x46;
    if (!isPDF) {
      return NextResponse.json({ success: false, error: "Invalid PDF file format" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Check usage (UsageTracker has test override built-in)
    const usageCheck = await UsageTracker.checkUsage(userId, 'resume_review');
    await UsageTracker.getUserSubscriptionTier(userId);

    if (!usageCheck.allowed) {
      return NextResponse.json({ success: false, error: `Daily resume review limit reached (${usageCheck.remaining}/${usageCheck.limit}). Please try again tomorrow.`, usage: { remaining: usageCheck.remaining, limit: usageCheck.limit } }, { status: 429 });
    }

    const startTime = Date.now();

    const cloudinaryResult = await new Promise<{
      secure_url: string;
      format: string;
      bytes: number;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `genhive-ai/resumes/${userId}`, public_id: `resume_${Date.now()}`, resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; format: string; bytes: number; public_id: string; });
        }
      );

      uploadStream.end(Buffer.from(fileBuffer));
    });

    const fileUrl = cloudinaryResult.secure_url;

    // Parse PDF content
    let extractedText: string;
    try {
      // Validate PDF signature again
      const uint8Array = new Uint8Array(fileBuffer);
      const pdfSignature = uint8Array.slice(0, 4);
      const isPDFValid = pdfSignature[0] === 0x25 && pdfSignature[1] === 0x50 && pdfSignature[2] === 0x44 && pdfSignature[3] === 0x46;

      if (!isPDFValid) {
        throw new Error('Invalid PDF file format - missing PDF signature');
      }

      // Use pdf-parse with proper error handling for serverless environment
      const pdfParse = await import('pdf-parse');
      const pdf = pdfParse.default;
      
      // Create buffer from file data
      const pdfBuffer = Buffer.from(fileBuffer);
      
      // Configure pdf-parse for serverless environment
      const pdfOptions = {
        // Disable debug mode to prevent file system access issues in serverless
        isDebugMode: false,
        // Set max buffer size to prevent memory issues
        max: 0
      };
      
      // Add timeout to prevent hanging in serverless environment
      const pdfData = await Promise.race([
        pdf(pdfBuffer, pdfOptions),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('PDF parsing timeout')), 30000)
        )
      ]) as { text: string };
      
      extractedText = pdfData.text;

      if (!(extractedText && extractedText.trim().length > 0)) {
        throw new Error('No text extracted from PDF - file may be image-based or corrupted');
      }
    } catch (error) {
      console.error('PDF parsing error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      
      // Fallback: try parsing with pdfjs-dist if pdf-parse failed
      try {
        // Use the main pdfjs-dist entry to avoid bundling issues in serverless
        const pdfjsLib = await import('pdfjs-dist');
        // In Node runtime, disable worker
        // @ts-expect-error GlobalWorkerOptions typing differs between builds
        pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(fileBuffer),
          disableFontFace: true,
          useSystemFonts: true,
          isEvalSupported: false,
          stopAtErrors: true,
          disableRange: true,
          disableAutoFetch: true,
          disableStream: true,
        });
        const doc = await loadingTask.promise;
        let combinedText = '';
        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          const page = await doc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: unknown) => {
              const text = (item as { str?: unknown }).str;
              return typeof text === 'string' ? text : '';
            })
            .join(' ');
          combinedText += (pageNum > 1 ? '\n\n' : '') + pageText;
        }
        extractedText = (combinedText || '').trim();
        if (!(extractedText && extractedText.length > 0)) {
          throw new Error('No text extracted with pdfjs');
        }
      } catch (fallbackError) {
        console.error('PDF parsing fallback (pdfjs) error:', {
          error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
        });
        // Provide more specific error messages based on the error type
        const message = (fallbackError as Error)?.message || (error as Error)?.message || '';
        if (message) {
          if (message.toLowerCase().includes('timeout')) {
            throw new Error('PDF parsing timed out. The file may be too large or complex.');
          } else if (message.toLowerCase().includes('password')) {
            throw new Error('This PDF appears to be password-protected. Please remove the password and try again.');
          } else if (message.includes('Invalid PDF') || message.toLowerCase().includes('invalidpdf')) {
            throw new Error('Invalid PDF file format. Please ensure the file is a valid PDF.');
          } else if (message.toLowerCase().includes('no text')) {
            throw new Error('No readable text found in the PDF. The file may be image-based or corrupted.');
          }
        }
        
        throw new Error('Failed to parse PDF file. Please ensure the file is a valid PDF with readable text and is not password-protected.');
      }
    }

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const maxTextLength = 3000;
    const truncatedText = extractedText.length > maxTextLength ? extractedText.substring(0, maxTextLength) + "..." : extractedText;

    const systemPrompt = `You are an expert HR professional. Review resumes and provide constructive feedback.`;

    const jobContext = jobDescription ? `\nJob Description: ${jobDescription.substring(0, 500)}` : '';
    const roleContext = targetRole ? `\nTarget Role: ${targetRole}` : '';
    
    const userPrompt = `Review this resume${roleContext}${jobContext}

Resume:
${truncatedText}

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": 85,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "keywordMatch": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "summary": "Brief summary here"
}`;

    const geminiResponse = await getClient().chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const reviewText = geminiResponse.choices[0]?.message?.content;
    const finishReason = geminiResponse.choices[0]?.finish_reason;

    if (!reviewText) {
      if (finishReason === 'length') {
        throw new Error('Response was too long and got cut off. Please try with a shorter resume or contact support.');
      } else {
        throw new Error('No review generated from AI');
      }
    }

    let review;
    try {
      try {
        review = JSON.parse(reviewText);
      } catch {
        const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          review = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not find JSON in response');
        }
      }

      if (!review.overallScore || !review.strengths || !review.weaknesses || !review.suggestions) {
        throw new Error('Invalid review structure');
      }
    } catch {
      review = {
        overallScore: 75,
        strengths: ["Resume received and processed successfully"],
        weaknesses: ["Could not parse detailed AI feedback"],
        suggestions: ["Please try again or contact support if the issue persists"],
        keywordMatch: [],
        missingKeywords: [],
        summary: reviewText || "Resume was processed but AI feedback could not be parsed properly."
      };
    }

    const processingTime = Date.now() - startTime;

    // Record usage (skipped automatically in test override)
    await UsageTracker.recordUsage(userId, 'resume_review');

    const inputParams = { fileName: file.name, fileSize: file.size, fileUrl, jobDescription: jobDescription || null, targetRole: targetRole || null };

    const { error: dbError } = await SupabaseService.insertWithServiceRole('ai_generations', {
      user_id: userId,
      action_type: 'resume_review',
      input_params: inputParams,
      content: JSON.stringify(review),
      processing_time_ms: processingTime,
      model_used: model,
      tokens_used: geminiResponse.usage?.total_tokens || 0,
      status: 'completed'
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Recompute usage for response
    const updatedUsage = await UsageTracker.checkUsage(userId, 'resume_review');

    const response: ResumeReviewResponse = {
      success: true,
      review,
      extractedText,
      usage: { remaining: updatedUsage.remaining, limit: updatedUsage.limit }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Resume review error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to review resume';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
