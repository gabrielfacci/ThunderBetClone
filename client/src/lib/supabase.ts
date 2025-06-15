import { createClient } from '@supabase/supabase-js'

// Supabase configuration - using correct values
const supabaseUrl = 'https://kgpmvqfehzkeyrtexdkb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjMwNjUsImV4cCI6MjA2NTQzOTA2NX0.Bz3XSiSsdSSRVJoH6YxQx48T0DoHACY28wrv-X43ff4'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Export the supabase client for direct use in components
export default supabase