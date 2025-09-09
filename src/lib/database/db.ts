import { createClient } from '@supabase/supabase-js';

// Check if we're in a build environment or if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only throw errors if we're not in a build environment
if (!supabaseUrl && process.env.NODE_ENV !== 'production') {
    console.warn("NEXT_PUBLIC_SUPABASE_URL is not defined in your .env file");
}

if (!supabaseAnonKey && process.env.NODE_ENV !== 'production') {
    console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in your .env file");
}

if (!supabaseServiceKey && process.env.NODE_ENV !== 'production') {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined in your .env file");
}

// Create regular client with fallback values for build time
const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Create service role client for operations that need to bypass RLS
const supabaseService = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder-service-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Add error handling for database operations
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export const isSupabaseServiceConfigured = () => {
  return !!(supabaseUrl && supabaseServiceKey);
};

export { supabaseService };
export default supabase;