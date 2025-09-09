## API Endpoints

Base: Next.js App Router under `src/app/api`

- `POST /api/articles` — Generate article
- `POST /api/blogtitles` — Generate blog titles
- `POST /api/generateimage` — Generate an image from prompt
- `POST /api/removebackground` — Remove image background
- `POST /api/removeobject` — Remove object from image
- `POST /api/reviewresume` — Analyze resume text

### Conventions
- Input validated via `src/lib/validation/schemas.ts`
- Errors normalized via `src/lib/errors/api-errors.ts`
- Rate limiting and security in `src/lib/middleware`

### Example: Generate Article
Request:
```json
{
  "topic": "Email spam mitigation",
  "tone": "professional",
  "length": "long"
}
```

Response:
```json
{
  "id": "uuid",
  "content": "# Title...\n...",
  "created_at": "2025-09-09T10:00:00Z"
}
```



