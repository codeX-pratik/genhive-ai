## Security

- Environment variables kept in `.env.local` (ignored by Git).
- Supabase RLS ensures users can only access their data.
- Rate limiter middleware to prevent abuse.
- Input validation for all API routes.
- Avoid `dangerouslySetInnerHTML` unless content is sanitized.

### Recommendations
- Rotate API keys regularly and scope permissions.
- Monitor rate-limit metrics and error rates.
- Sanitize user content rendered as HTML; prefer Markdown rendering.
- Use HTTPS in production and secure cookies.


