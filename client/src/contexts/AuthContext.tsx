import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, authHelpers, UserProfile } from '@/lib/supabase';
import { getUserProfile, createUserProfile, updateUserBalance } from '@/lib/supabaseQueries';
import { User as SupabaseUser } from '@supabase/supabase-js';

type AccountMode = 'national' | 'international';
type Language = 'pt' | 'en';

interface User {
  id: string;
  fullName: string;
  phone: string;
  accountMode: AccountMode;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  language: Language;
  isLoading: boolean;
  signUp: (phone: string, password: string, fullName: string) => Promise<void>;
  signIn: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (balance: number) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const language: Language = user?.accountMode === 'national' ? 'pt' : 'en';

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        // Check if we have valid Supabase credentials
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl.includes('placeholder') || 
            supabaseKey.includes('placeholder')) {
          console.log('No valid Supabase credentials - staying logged out');
          if (mounted) {
            setIsLoading(false);
            setUser(null);
            setSupabaseUser(null);
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setSupabaseUser(session.user);
            await loadUserProfile(session.user);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setIsLoading(false);
          setUser(null);
          setSupabaseUser(null);
        }
      }
    }

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSupabaseUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setUser(null);
          }
          
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserProfile(supabaseUser: SupabaseUser) {
    try {
      let profile = await getUserProfile(supabaseUser.id);
      
      // If profile doesn't exist, create it from auth metadata
      if (!profile) {
        const metadata = supabaseUser.user_metadata;
        profile = await createUserProfile({
          id: supabaseUser.id,
          phone: metadata.phone || '',
          full_name: metadata.full_name || 'User',
          account_mode: 'national'
        });
      }

      if (profile) {
        setUser({
          id: profile.id,
          fullName: profile.full_name,
          phone: profile.phone,
          accountMode: profile.account_mode,
          balance: profile.balance
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  const signUp = async (phone: string, password: string, fullName: string) => {
    // Check if we have valid Supabase credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      throw new Error('Configure as credenciais do Supabase para usar a autenticação');
    }

    try {
      await authHelpers.signUpWithPhone(phone, password, fullName);
      // The onAuthStateChange will handle the rest
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const signIn = async (phone: string, password: string) => {
    // Check if we have valid Supabase credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      throw new Error('Configure as credenciais do Supabase para usar a autenticação');
    }

    try {
      await authHelpers.signInWithPhone(phone, password);
      // The onAuthStateChange will handle the rest
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const logout = async () => {
    try {
      await authHelpers.signOut();
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!user) return;
    
    try {
      const success = await updateUserBalance(user.id, newBalance);
      if (success) {
        setUser(prev => prev ? { ...prev, balance: newBalance } : null);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      await loadUserProfile(supabaseUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      language,
      isLoading,
      signUp,
      signIn,
      logout,
      updateBalance,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}