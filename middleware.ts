import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/ai(.*)',        // Protect all /ai routes
    '/(api|trpc)(.*)' // Protect API routes
  ],
};
