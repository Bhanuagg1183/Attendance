import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          employee_id: string;
          department: string;
          role: 'employee' | 'admin';
          photo_url: string | null;
          is_enrolled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          employee_id: string;
          department: string;
          role?: 'employee' | 'admin';
          photo_url?: string | null;
          is_enrolled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          employee_id?: string;
          department?: string;
          role?: 'employee' | 'admin';
          photo_url?: string | null;
          is_enrolled?: boolean;
          created_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          user_id: string;
          check_in_time: string;
          check_out_time: string | null;
          date: string;
          status: 'present' | 'late' | 'absent';
          location: string | null;
          verification_confidence: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_in_time: string;
          check_out_time?: string | null;
          date: string;
          status?: 'present' | 'late' | 'absent';
          location?: string | null;
          verification_confidence?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          check_in_time?: string;
          check_out_time?: string | null;
          date?: string;
          status?: 'present' | 'late' | 'absent';
          location?: string | null;
          verification_confidence?: number | null;
          created_at?: string;
        };
      };
    };
  };
};