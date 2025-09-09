## Architecture

```
src/
  app/
    ai/                  # Feature pages (article, titles, images, resume, etc.)
    api/                 # Serverless API endpoints
  components/            # UI components (common, dashboard, ui)
  lib/                   # Services, hooks, validation, utils
```

### Key Directories
- `src/app/ai`: Route pages for each tool (`writearticle`, `blogtitles`, `generateimage`, `removebackground`, `removeobject`, `reviewresume`).
- `src/app/api`: API routes for each tool and user/account operations.
- `src/components/common`: Shared UI such as `ContentViewer`, `CreationItem`, and `UsageDisplay`.
- `src/lib`: Database setup, services (`user-service`), middleware (rate limiting, security), hooks, and validation.

### Data Flow
1. User triggers an action in UI (e.g., generate article).
2. Client calls an API route.
3. API validates input, checks usage limits, performs AI or image operation.
4. Results are stored (if needed) and returned to the client.
5. UI renders results with Markdown, highlighting, or images.

### Cross-Cutting Concerns
- **Validation**: `src/lib/validation/schemas.ts`
- **Security**: `src/lib/middleware/security.ts`
- **Rate Limiting**: `src/lib/middleware/rate-limiter.ts`
- **Database**: `src/lib/database/*.ts`



