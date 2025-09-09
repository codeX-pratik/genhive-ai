import supabase, { supabaseService, isSupabaseConfigured, isSupabaseServiceConfigured } from './db';

// Common database operations for Supabase
export class SupabaseService {
  // Test connection
  static async testConnection() {
    try {
      if (!isSupabaseConfigured()) {
        return { 
          success: false, 
          message: 'Supabase not configured. Please set up your environment variables.', 
          error: 'Missing Supabase configuration'
        };
      }

      const { error } = await supabase
        .from('_test_connection')
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, message: 'Supabase connected successfully!' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Supabase connection failed', 
        error: (error as Error).message 
      };
    }
  }

  // Generic select operation
  static async select(table: string, columns = '*', filters?: Record<string, unknown>) {
    let query = supabase.from(table).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    return await query;
  }

  // Generic insert operation
  static async insert(table: string, data: Record<string, unknown>) {
    return await supabase.from(table).insert(data);
  }

  // Generic update operation
  static async update(table: string, data: Record<string, unknown>, filters: Record<string, unknown>) {
    let query = supabase.from(table).update(data);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  }

  // Generic delete operation
  static async delete(table: string, filters: Record<string, unknown>) {
    let query = supabase.from(table).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  }

  // Service role operations (bypass RLS)
  static async selectWithServiceRole(table: string, columns = '*', filters?: Record<string, unknown>) {
    if (!isSupabaseServiceConfigured()) {
      throw new Error('Service role not configured');
    }

    let query = supabaseService.from(table).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    return await query;
  }

  static async insertWithServiceRole(table: string, data: Record<string, unknown>) {
    if (!isSupabaseServiceConfigured()) {
      throw new Error('Service role not configured');
    }

    return await supabaseService.from(table).insert(data);
  }

  static async updateWithServiceRole(table: string, data: Record<string, unknown>, filters: Record<string, unknown>) {
    if (!isSupabaseServiceConfigured()) {
      throw new Error('Service role not configured');
    }

    let query = supabaseService.from(table).update(data);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  }

  static async deleteWithServiceRole(table: string, filters: Record<string, unknown>) {
    if (!isSupabaseServiceConfigured()) {
      throw new Error('Service role not configured');
    }

    let query = supabaseService.from(table).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return await query;
  }
}

export default SupabaseService;
