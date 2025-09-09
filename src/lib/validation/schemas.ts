import { z } from 'zod';

// Common validation schemas
export const userIdSchema = z.string().min(1, 'User ID is required');

export const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.string().min(1, 'File type is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB limit
});

// Article generation validation (userId comes from auth, not request body)
export const articleRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500, 'Topic must be less than 500 characters'),
  length: z.coerce.number().min(100, 'Article length must be at least 100 words').max(5000, 'Article length must be less than 5000 words'),
  style: z.enum(['professional', 'casual', 'academic', 'creative']).optional().default('professional'),
  tone: z.enum(['informative', 'persuasive', 'entertaining', 'educational', 'narrative', 'analytical']).optional().default('informative'),
});

// Blog title generation validation (userId comes from auth, not request body)
export const blogTitleRequestSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required').max(100, 'Keyword must be less than 100 characters'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  count: z.coerce.number().min(1, 'Count must be at least 1').max(20, 'Count must be less than 20').optional().default(5),
});

// Image generation validation (userId comes from auth, not request body)
export const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt must be less than 1000 characters'),
  style: z.enum(['realistic', 'anime', 'ghibli', 'cartoon', 'artistic']).optional().default('realistic'),
  count: z.coerce.number().min(1, 'Count must be at least 1').max(4, 'Count must be less than 4').optional().default(1),
  isPublic: z.boolean().optional().default(false),
});

// Background removal validation
export const backgroundRemovalRequestSchema = z.object({
  userId: userIdSchema,
  imageUrl: z.string().url('Valid image URL is required'),
});

// Object removal validation
export const objectRemovalRequestSchema = z.object({
  userId: userIdSchema,
  imageUrl: z.string().url('Valid image URL is required'),
  objectDescription: z.string().min(1, 'Object description is required').max(200, 'Object description must be less than 200 characters'),
});

// Resume review validation
export const resumeReviewRequestSchema = z.object({
  userId: userIdSchema,
  file: fileSchema.refine(
    (file) => file.type === 'application/pdf',
    'Only PDF files are allowed for resume review'
  ),
});

// Usage check validation
export const usageCheckRequestSchema = z.object({
  userId: userIdSchema,
  action: z.enum(['article', 'blog_title', 'image', 'background_removal', 'object_removal', 'resume_review']),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const usageStatsSchema = z.object({
  action: z.enum(['article', 'blog_title', 'image', 'background_removal', 'object_removal', 'resume_review']),
  used: z.number().min(0),
  limit: z.number().min(0),
  remaining: z.number().min(0),
});

export const usageResponseSchema = z.object({
  usage: z.array(usageStatsSchema),
  resetTime: z.string(),
});

// Type exports
export type ArticleRequest = z.infer<typeof articleRequestSchema>;
export type BlogTitleRequest = z.infer<typeof blogTitleRequestSchema>;
export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;
export type BackgroundRemovalRequest = z.infer<typeof backgroundRemovalRequestSchema>;
export type ObjectRemovalRequest = z.infer<typeof objectRemovalRequestSchema>;
export type ResumeReviewRequest = z.infer<typeof resumeReviewRequestSchema>;
export type UsageCheckRequest = z.infer<typeof usageCheckRequestSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type UsageStats = z.infer<typeof usageStatsSchema>;
export type UsageResponse = z.infer<typeof usageResponseSchema>;
