import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  account_mode: 'nacional' | 'internacional';
  balance: number;
  email: string;
  created_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  account_mode?: 'nacional' | 'internacional';
}

export const profileService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, phone, account_mode, balance, email, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, user doesn't exist
        return null;
      }
      throw error;
    }

    return data;
  },

  async createUserInUsersTable(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    const profileData = {
      id: userId,
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      account_mode: 'nacional', // Default to nacional
      balance: 1000.00, // Default balance
      email: userData.email || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select('id, full_name, phone, account_mode, balance, email, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, full_name, phone, account_mode, balance, email, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  async getOrCreateUserProfile(userId: string, authUserData: any): Promise<UserProfile> {
    try {
      // Try to get existing profile from users table
      const profile = await this.getUserProfile(userId);
      if (profile) {
        return profile;
      }

      // Profile doesn't exist in users table, create it
      const newProfile = await this.createUserInUsersTable(userId, {
        full_name: authUserData.user_metadata?.full_name || authUserData.email?.split('@')[0] || 'Usuário',
        phone: authUserData.user_metadata?.phone || authUserData.phone || '',
        account_mode: 'nacional', // Always default to nacional
        email: authUserData.email,
      });

      return newProfile;
    } catch (error) {
      console.error('Error getting or creating user profile:', error);
      throw error;
    }
  }
};