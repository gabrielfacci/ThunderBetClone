import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// User data interface
export interface UserProfile {
  id: string
  phone: string
  full_name: string
  balance: number
  account_mode: 'national' | 'international'
  created_at: string
  updated_at: string
}

// Auth helper functions
export const authHelpers = {
  async signUpWithPhone(phone: string, password: string, fullName: string) {
    // Use phone as email (Supabase requires email format)
    const email = `${phone.replace(/\D/g, '')}@thunderbet.temp`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          full_name: fullName,
          account_mode: 'national'
        }
      }
    })
    
    if (error) throw error
    return data
  },

  async signInWithPhone(phone: string, password: string) {
    // Use phone as email
    const email = `${phone.replace(/\D/g, '')}@thunderbet.temp`
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createUserProfile(userId: string, phone: string, fullName: string): Promise<UserProfile> {
    const profileData = {
      id: userId,
      phone,
      full_name: fullName,
      balance: 0,
      account_mode: 'national' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateUserBalance(userId: string, newBalance: number) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}