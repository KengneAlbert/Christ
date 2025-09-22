import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Charger les variables d'environnement
config();

// Node.js version of Supabase client for build scripts
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bcfrhbcxtbybvsoebfjt.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZnJoYmN4dGJ5YnZzb2ViZmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjE0NzQsImV4cCI6MjA3MzE5NzQ3NH0.xpAi61TmI8yzDMac44B4-zUqM7GUPqkV2F-QydppLZI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);