import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
      };
      media_items: {
        Row: {
          id: string;
          type: 'video' | 'document' | 'audio' | 'image';
          title: string;
          description: string;
          category: string;
          thumbnail_url: string | null;
          file_url: string | null;
          youtube_id: string | null;
          file_name: string | null;
          file_size: number | null;
          duration: string | null;
          pages: number | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
          views_count: number;
          downloads_count: number;
          created_by: string;
        };
        Insert: {
          id?: string;
          type: 'video' | 'document' | 'audio' | 'image';
          title: string;
          description: string;
          category: string;
          thumbnail_url?: string | null;
          file_url?: string | null;
          youtube_id?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          duration?: string | null;
          pages?: number | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
          views_count?: number;
          downloads_count?: number;
          created_by: string;
        };
        Update: {
          id?: string;
          type?: 'video' | 'document' | 'audio' | 'image';
          title?: string;
          description?: string;
          category?: string;
          thumbnail_url?: string | null;
          file_url?: string | null;
          youtube_id?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          duration?: string | null;
          pages?: number | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
          views_count?: number;
          downloads_count?: number;
          created_by?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          subscription_date: string;
          is_active: boolean;
          preferences: {
            actualites: boolean;
            temoignages: boolean;
            evenements: boolean;
            ressources: boolean;
          };
          unsubscribe_token: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          subscription_date?: string;
          is_active?: boolean;
          preferences?: {
            actualites: boolean;
            temoignages: boolean;
            evenements: boolean;
            ressources: boolean;
          };
          unsubscribe_token?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          subscription_date?: string;
          is_active?: boolean;
          preferences?: {
            actualites: boolean;
            temoignages: boolean;
            evenements: boolean;
            ressources: boolean;
          };
          unsubscribe_token?: string;
        };
      };
      newsletters: {
        Row: {
          id: string;
          title: string;
          content: string;
          html_content: string | null;
          category: 'actualites' | 'temoignages' | 'evenements' | 'ressources';
          status: 'draft' | 'scheduled' | 'sent';
          scheduled_date: string | null;
          sent_date: string | null;
          recipients_count: number;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          html_content?: string | null;
          category: 'actualites' | 'temoignages' | 'evenements' | 'ressources';
          status?: 'draft' | 'scheduled' | 'sent';
          scheduled_date?: string | null;
          sent_date?: string | null;
          recipients_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          html_content?: string | null;
          category?: 'actualites' | 'temoignages' | 'evenements' | 'ressources';
          status?: 'draft' | 'scheduled' | 'sent';
          scheduled_date?: string | null;
          sent_date?: string | null;
          recipients_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
    };
  };
}