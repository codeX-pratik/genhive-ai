import { NextRequest, NextResponse } from "next/server";
import { UsageTracker } from "@/lib/usage-tracker";
import { SupabaseService } from "@/lib/database/supabase-utils";
import { createAPIRoute, createSuccessResponse, commonAPIConfigs, getUserIdAndEnsureExists } from "@/lib/middleware/api-wrapper";
import { APIError, ExternalServiceError } from "@/lib/errors/api-errors";

async function handleBlogTitleGeneration(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdAndEnsureExists(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw = (body as Record<string, unknown>) || {};
  const keyword = String(raw.keyword ?? '').trim();
  const category = String(raw.category ?? '').trim() || 'General';
  const count = Math.max(1, Math.min(20, Number(raw.count ?? 5) || 5));

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  // Check usage (UsageTracker has test override built-in)
  const usageCheck = await UsageTracker.checkUsage(userId, 'blog_title');
  if (!usageCheck.allowed) {
    throw new APIError(
      "Daily blog title generation limit reached. Please try again tomorrow.",
      429,
      'USAGE_LIMIT_EXCEEDED',
      { remaining: usageCheck.remaining, limit: usageCheck.limit }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ExternalServiceError('Gemini', 'API key not configured');
  }
  
  const systemPrompt = `You are an expert content marketer and SEO specialist. You create compelling, click-worthy blog titles that are optimized for search engines and social media. You understand different writing styles and can adapt to various target audiences.`;

  const userPrompt = `Generate ${count} compelling blog titles about "${keyword}" in the ${category} category.

    Requirements:
    - Each title should be 6-12 words long
    - Make them SEO-friendly and searchable
    - Ensure they're engaging and click-worthy
    - Avoid clichés and overused phrases
    - Make each title unique and distinct
    - Consider trending keywords and topics
    - Return ONLY the titles, one per line, without numbers or bullet points
    - Do not include any introductory text or explanations
    
    Generate the blog titles:`;

  const startTime = Date.now();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const geminiResponse = await response.json();
    const processingTime = Date.now() - startTime;
    
    const parts = geminiResponse?.candidates?.[0]?.content?.parts || [];
    const combinedText = parts
      .map((p: { text?: string }) => (typeof p?.text === 'string' ? p.text : ''))
      .filter((t: string) => t.trim().length > 0)
      .join('\n')
      .trim();

    const titlesSource = combinedText || geminiResponse?.candidates?.[0]?.content?.text || '';

    if (!titlesSource) {
      throw new ExternalServiceError('Gemini', 'Failed to generate blog titles');
    }

    const titles = titlesSource
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter((title: string) => title.length > 0)
      .slice(0, count);

    if (titles.length === 0) {
      throw new ExternalServiceError('Gemini', 'Failed to parse titles from response');
    }

    // Record usage (skipped automatically in test override)
    await UsageTracker.recordUsage(userId, 'blog_title');

    const inputParams = { keyword, category, count };

    const { error: dbError } = await SupabaseService.insertWithServiceRole('ai_generations', {
      user_id: userId,
      action_type: 'blog_title',
      input_params: inputParams,
      content: titles.join('\n'),
      processing_time_ms: processingTime,
      model_used: model,
      tokens_used: geminiResponse.usageMetadata?.totalTokenCount || 0,
      status: 'completed'
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Recompute usage for response
    const updatedUsage = await UsageTracker.checkUsage(userId, 'blog_title');

    return createSuccessResponse({
      titles,
      usage: { remaining: updatedUsage.remaining, limit: updatedUsage.limit }
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key not configured')) {
        throw new ExternalServiceError('Gemini', 'API key not configured');
      }
      if (error.message.includes('quota')) {
        throw new ExternalServiceError('Gemini', 'API quota exceeded');
      }
    }
    throw error;
  }
}

export const POST = createAPIRoute(handleBlogTitleGeneration, {
  ...commonAPIConfigs.ai,
});
