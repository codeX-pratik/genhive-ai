## Setup

### Prerequisites
- Node.js LTS
- Supabase project (URL, anon/public keys)

### Environment
Create a `.env.local` in project root:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Install & Run
```
npm install
npm run dev
```

Optional: import `supabase-optimized-schema.sql` into your Supabase instance.

### Scripts
```
npm run dev        # start dev server
npm run build      # production build
npm run start      # start production server
```

### Troubleshooting
- Ensure `.env.local` is present and keys are correct
- Check browser console and server logs for API errors
- Verify Supabase RLS policies if data is not visible


