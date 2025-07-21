
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dzmatfnltgtgjvbputtb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bWF0Zm5sdGd0Z2p2YnB1dHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzAxOTIsImV4cCI6MjA2NjIwNjE5Mn0.JEaWCyoC4FRwE8VuD0u-CwXYfDBp8tY0znXl-0OQ230'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})
