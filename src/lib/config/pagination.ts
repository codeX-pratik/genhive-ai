export function getPublicImagesLimit(): number {
  const raw = process.env.NEXT_PUBLIC_PUBLIC_IMAGES_LIMIT || process.env.PUBLIC_IMAGES_LIMIT;
  const parsed = raw ? Number(raw) : 100; // Default to 100 for testing
  const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
  return Math.min(limit, 1000); // Max 1000 for testing
}



