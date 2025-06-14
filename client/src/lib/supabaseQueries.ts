import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  phone: string;
  full_name: string;
  balance: number;
  account_mode: 'national' | 'international';
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function createUserProfile(profile: {
  id: string;
  phone: string;
  full_name: string;
  account_mode?: 'national' | 'international';
}): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: profile.id,
      phone: profile.phone,
      full_name: profile.full_name,
      account_mode: profile.account_mode || 'national',
      balance: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string;
  account_mode?: 'national' | 'international';
  balance?: number;
}): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user balance:', error);
    return false;
  }

  return true;
}