import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  account_mode: 'national' | 'international';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  account_mode?: 'national' | 'international';
  phone?: string;
}

export const profileService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, profile doesn't exist
        return null;
      }
      throw error;
    }

    return data;
  },

  async createUserProfile(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    const profileData = {
      user_id: userId,
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      account_mode: userData.account_mode || 'national',
      balance: 1000.00, // Default balance
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrCreateUserProfile(userId: string, authUserData: any): Promise<UserProfile> {
    try {
      // Try to get existing profile
      const profile = await this.getUserProfile(userId);
      if (profile) {
        return profile;
      }

      // Profile doesn't exist, create it
      const newProfile = await this.createUserProfile(userId, {
        full_name: authUserData.user_metadata?.full_name || authUserData.email?.split('@')[0] || 'Usuário',
        phone: authUserData.user_metadata?.phone || '',
        account_mode: 'national',
      });

      return newProfile;
    } catch (error) {
      console.error('Error getting or creating user profile:', error);
      throw error;
    }
  }
};