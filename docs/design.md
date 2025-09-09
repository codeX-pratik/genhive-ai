## Design Principles

- **Clarity first**: Simple forms and clear actions. Minimal configuration.
- **Responsive UI**: Mobile-friendly layouts and accessible components.
- **Safety & Limits**: Rate limiting and usage quotas protect resources.
- **Separation of Concerns**: UI (components) vs. server logic (API routes) vs. data/services (lib).

### UI System
- Tailwind + shadcn/ui. Custom `prose` styles for Markdown.
- Markdown rendered via `react-markdown` + `remark-gfm` and optional `rehype-highlight`.

### Component Conventions
- Presentational components live in `src/components/ui` and `src/components/common`.
- Feature components live near their routes or in `src/components/dashboard`.
- Prefer composition over inheritance; keep components small and focused.

### Error & State Management
- Use toasts for non-blocking feedback.
- Client hooks (e.g., `useArticleGenerator`) encapsulate side effects and API calls.



