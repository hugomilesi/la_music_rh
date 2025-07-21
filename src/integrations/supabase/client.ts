
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://grbajpcxfmxeexqthpwz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYmFqcGN4Zm14ZWV4cXRocHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzEwMDAsImV4cCI6MjA2NzY0NzAwMH0.NZ2B_wF1caWMrj3QNt_pw8Z2wunVM2njuHkZmJv3f-M'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
