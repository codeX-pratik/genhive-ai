import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { UsageTracker } from "@/lib/usage-tracker";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { createAPIRoute, validateRequestBody, createSuccessResponse, commonAPIConfigs, getUserIdAndEnsureExists } from "@/lib/middleware/api-wrapper";
import { articleRequestSchema } from "@/lib/validation/schemas";
import { APIError, ExternalServiceError, handleDatabaseError } from "@/lib/errors/api-errors";

// Initialize Gemini AI with OpenAI-compatible client (lazy initialization)
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: `https://generativelanguage.googleapis.com/v1beta/openai/`,
      defaultQuery: { key: apiKey },
    });
  }
  return client;
}

// interface ArticleResponse {
//   success: boolean;
//   article?: string;
//   error?: string;
//   usage?: {
//     remaining: number;
//     limit: number;
//   };
// }

async function handleArticleGeneration(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdAndEnsureExists(request);
  const body = await validateRequestBody(request, articleRequestSchema);
  const { topic, length, style = 'professional', tone = 'informative' } = body;

  // Check usage (UsageTracker has test override built-in)
  const usageCheck = await UsageTracker.checkUsage(userId, 'article');
  if (!usageCheck.allowed) {
    throw new APIError(
      "Daily article generation limit reached",
      429,
      'USAGE_LIMIT_EXCEEDED',
      { remaining: usageCheck.remaining, limit: usageCheck.limit }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const systemPrompt = `You are an expert content writer and journalist. You write comprehensive, well-structured articles that are informative, engaging, and valuable to readers. You always use proper markdown formatting and include relevant headings and subheadings.`;

  const wordCount = length;
  const styleInstructions = {
    professional: "Write in a professional, authoritative tone suitable for business and industry publications.",
    casual: "Write in a friendly, conversational tone that feels approachable and relatable.",
    academic: "Write in an academic, scholarly tone with proper citations and formal language.",
    creative: "Write in a creative, engaging tone with storytelling elements and vivid descriptions."
  } as const;

  const toneInstructions = {
    informative: "Focus on providing valuable information and insights.",
    persuasive: "Use persuasive techniques to convince readers of your points.",
    entertaining: "Write in an engaging, entertaining style that keeps readers interested.",
    educational: "Focus on teaching and explaining concepts clearly and thoroughly.",
    narrative: "Write in a storytelling style that engages readers through narrative.",
    analytical: "Focus on analysis, critical thinking, and detailed examination of topics."
  } as const;

  const userPrompt = `Write a comprehensive, well-structured article about "${topic}". 

Requirements:
- Word count: approximately ${wordCount} words
- Style: ${styleInstructions[style]}
- Tone: ${toneInstructions[tone]}
- Include an introduction, main body with key points, and conclusion
- Use proper headings and subheadings (## for main headings, ### for subheadings)
- Make it informative and valuable for readers
- Ensure the content is original and well-researched
- Use markdown formatting for structure
- Include bullet points or numbered lists where appropriate

Please generate the article now:`;

  const startTime = Date.now();

  try {
    const geminiResponse = await getClient().chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: Math.min(wordCount * 2, 4000),
    }, {
      query: { key: process.env.GEMINI_API_KEY }
    });

    const processingTime = Date.now() - startTime;
    const article = geminiResponse.choices[0]?.message?.content;

    if (!article) {
      throw new ExternalServiceError('Gemini', 'Failed to generate article content');
    }

    // Record usage in database (skipped automatically in test override)
    await UsageTracker.recordUsage(userId, 'article');

    // Save the generation to database
    const inputParams = { topic, length: wordCount, style, tone };

    const { error: saveError } = await SupabaseService.insertWithServiceRole('ai_generations', {
      user_id: userId,
      action_type: 'article',
      input_params: inputParams,
      content: article,
      processing_time_ms: processingTime,
      model_used: model,
      tokens_used: geminiResponse.usage?.total_tokens || 0,
      status: 'completed'
    });

    if (saveError) {
      console.error('Error saving article generation:', saveError);
    }

    // Recompute usage for response
    const updatedUsage = await UsageTracker.checkUsage(userId, 'article');

    return createSuccessResponse({
      article,
      usage: { remaining: updatedUsage.remaining, limit: updatedUsage.limit }
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        throw new ExternalServiceError('Gemini', 'API key not configured');
      }
      if (error.message.includes('quota')) {
        throw new ExternalServiceError('Gemini', 'API quota exceeded');
      }
    }
    throw error;
  }
}

export const POST = createAPIRoute(handleArticleGeneration, {
  ...commonAPIConfigs.ai,
  schema: articleRequestSchema,
});

async function handleGetArticles(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdAndEnsureExists(request);

  const { data: generations, error } = await SupabaseService.select(
    'ai_generations',
    '*',
    { user_id: userId, action_type: 'article' }
  );

  if (error && error.code !== 'PGRST116') {
    throw handleDatabaseError(error);
  }

  return createSuccessResponse({ generations: generations || [] });
}

export const GET = createAPIRoute(handleGetArticles, {
  ...commonAPIConfigs.general,
  requireAuth: true
});
