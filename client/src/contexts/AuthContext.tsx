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

  // Carregar perfil do usuário do Supabase
  async function loadUserProfile(authUser: SupabaseUser) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar perfil:', error);
    }
  }

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
        }

        if (mounted) {
          if (session?.user) {
            setSupabaseUser(session.user);
            await loadUserProfile(session.user);
          } else {
            setUser(null);
            setSupabaseUser(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        if (mounted) {
          setIsLoading(false);
          setUser(null);
          setSupabaseUser(null);
        }
      }
    }

    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          if (session?.user) {
            setSupabaseUser(session.user);
            await loadUserProfile(session.user);
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
      console.log('Iniciando cadastro:', { email: email.trim(), fullName });
      
      // Primeiro, fazer signup no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        throw authError;
      }

      console.log('Cadastro de auth bem-sucedido:', authData);
      
      // O trigger do banco vai criar automaticamente o perfil na tabela users
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'email_address_invalid') {
        errorMessage = 'Email inválido. Verifique o formato do email.';
      } else if (error.code === 'weak_password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.code === 'email_address_already_in_use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Não precisa fazer mais nada - onAuthStateChange vai lidar com o resto
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