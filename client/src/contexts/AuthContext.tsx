import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create user profile from Supabase auth user
  function createUserProfile(authUser: SupabaseUser): UserProfile {
    return {
      id: authUser.id,
      email: authUser.email || '',
      phone: authUser.phone || '',
      full_name: authUser.user_metadata?.full_name || '',
      balance: 1000, // Default balance for demo
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser(createUserProfile(session.user));
          console.log('Session loaded:', session.user.email);
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'null');
        
        if (mounted) {
          if (session?.user) {
            setSupabaseUser(session.user);
            setUser(createUserProfile(session.user));
            console.log('User authenticated:', session.user.email);
          } else {
            setUser(null);
            setSupabaseUser(null);
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      console.log('Tentando cadastro com email original:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (error) {
        console.error('Erro Supabase:', error.message);
        throw error;
      }

      console.log('Cadastro realizado:', data);

      // If no session was created automatically, sign in the user
      if (!data.session && data.user) {
        console.log('Sem sessão automática, fazendo login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (loginError) {
          console.error('Erro no login automático:', loginError.message);
          throw loginError;
        }

        console.log('Login automático realizado:', loginData);
      }
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      let message = 'Erro ao criar conta';
      
      if (error.code === 'weak_password') {
        message = 'Senha muito fraca. Use pelo menos 6 caracteres';
      } else if (error.code === 'email_address_already_in_use') {
        message = 'Este email já está cadastrado';
      } else if (error.code === 'email_address_invalid') {
        message = 'Email inválido. Tente com um formato diferente.';
      } else if (error.message) {
        message = error.message;
      }
      
      throw new Error(message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Erro Supabase:', error.message);
        throw error;
      }
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar estado local
      setUser(null);
      setSupabaseUser(null);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw new Error(error.message || 'Erro ao sair');
    }
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      await loadUserProfile(supabaseUser);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}