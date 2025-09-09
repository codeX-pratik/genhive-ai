// Type definitions for Supabase responses
export interface SupabaseUsageRecord {
  id: string;
  user_id: string;
  action_type: string;
  date: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseGenerationRecord {
  id: string;
  user_id: string;
  type: string;
  prompt: string;
  result: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
