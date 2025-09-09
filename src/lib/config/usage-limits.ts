export type SubscriptionTier = 'free' | 'pro';

export type AIActionType =
  | 'article'
  | 'blog_title'
  | 'image'
  | 'background_removal'
  | 'object_removal'
  | 'resume_review';

export interface UsageLimitsConfig {
  free: Record<AIActionType, number>;
  pro: Record<AIActionType, number>;
}

function readNumberEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function getTierLimitsFromEnv(prefix: string, defaults: Record<AIActionType, number>) {
  return {
    article: readNumberEnv(`${prefix}_ARTICLE`, defaults.article),
    blog_title: readNumberEnv(`${prefix}_BLOG_TITLE`, defaults.blog_title),
    image: readNumberEnv(`${prefix}_IMAGE`, defaults.image),
    background_removal: readNumberEnv(`${prefix}_BACKGROUND_REMOVAL`, defaults.background_removal),
    object_removal: readNumberEnv(`${prefix}_OBJECT_REMOVAL`, defaults.object_removal),
    resume_review: readNumberEnv(`${prefix}_RESUME_REVIEW`, defaults.resume_review),
  } as Record<AIActionType, number>;
}

export function getUsageLimitsFromEnv(): UsageLimitsConfig {
  const defaults = {
    free: {
      article: 5,
      blog_title: 10,
      image: 3,
      background_removal: 5,
      object_removal: 5,
      resume_review: 2,
    },
    pro: {
      article: 50,
      blog_title: 100,
      image: 30,
      background_removal: 50,
      object_removal: 50,
      resume_review: 20,
    },
  } as UsageLimitsConfig;

  return {
    free: getTierLimitsFromEnv('NEXT_PUBLIC_LIMIT_FREE', getTierLimitsFromEnv('LIMIT_FREE', defaults.free)),
    pro: getTierLimitsFromEnv('NEXT_PUBLIC_LIMIT_PRO', getTierLimitsFromEnv('LIMIT_PRO', defaults.pro)),
  };
}

export function getTestMaxFlag(): boolean {
  return process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true' || process.env.TEST_MAX_LIMITS === 'true';
}


