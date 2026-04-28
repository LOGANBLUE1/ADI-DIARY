import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Persist session in localStorage (default)
    autoRefreshToken: true, // Automatically refresh token when expired
    detectSessionInUrl: true, // Detect session from URL (for magic links, etc.)
    storage: window.localStorage, // Use localStorage for session storage
  }
})