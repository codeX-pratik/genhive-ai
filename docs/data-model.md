## Data Model

Supabase is used for authentication and persistence. Typical tables include:

- `profiles`: user profiles and plan info
- `activities`: records of generated content and actions
- `images`: generated or processed images metadata

See `supabase-optimized-schema.sql` for concrete schema and RLS policies.

### Activity Record Example
```sql
-- illustrative shape
id uuid primary key,
user_id uuid references auth.users,
action_type text,              -- e.g., 'article', 'blog_title', 'image'
input_params jsonb,
content text,
image_url text,
created_at timestamptz default now()
```


