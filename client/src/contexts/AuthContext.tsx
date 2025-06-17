import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { profileService, type UserProfile } from '@/lib/supabaseProfile';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoading(false);
      console.log('Initial session:', session?.user?.email || 'none');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'null');
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    console.log('Cadastro com email:', email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || ''
        }
      }
    });

    if (error) {
      console.error('Erro no cadastro:', error.message, error.code);
      
      if (error.code === 'weak_password') {
        throw new Error('Senha muito fraca. Use pelo menos 6 caracteres');
      } else if (error.code === 'email_address_already_in_use') {
        throw new Error('Este email já está cadastrado');
      } else if (error.code === 'signup_disabled') {
        throw new Error('Cadastro desabilitado. Entre em contato com o suporte');
      } else if (error.message.includes('email_address_invalid') || error.message.includes('invalid')) {
        throw new Error('Este domínio de email não é permitido. Use um email corporativo ou entre em contato com o suporte');
      } else {
        throw new Error(`Erro no cadastro: ${error.message}`);
      }
    }

    // Create user entry in users table
    if (data.user) {
      try {
        const phoneToSave = phone || data.user.user_metadata?.phone || '';
        
        // Verificar se usuário já existe antes de inserir
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingUser) {
          // Usuário não existe, inserir novo
          const { data: insertData, error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            account_mode: 'nacional',
            balance: 0.00,
            phone: phoneToSave,
            created_at: new Date().toISOString()
          });
          
        } else {
          // Usuário já existe, apenas atualizar informações
          await supabase
            .from('users')
            .update({
              full_name: fullName,
              phone: phoneToSave,
              account_mode: 'nacional'
            })
            .eq('id', data.user.id);
        }

        // Garantir que o telefone seja salvo usando endpoint do backend
        if (phoneToSave) {
          try {
            const phoneResponse = await fetch('/api/users/update-phone', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user.id,
                phone: phoneToSave
              })
            });
            
          } catch (phoneError) {
            // Silent error handling
          }
        }
      } catch (userCreateError: any) {
        // Continue with authentication even if user table creation fails
      }
    }

    // If signup successful but no session, try auto-login
    if (data.user && !data.session) {
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) {
          if (loginError.message.includes('Email not confirmed')) {
            throw new Error('Email cadastrado com sucesso! Verifique sua caixa de entrada para confirmar o email antes de fazer login.');
          }
          throw new Error(`Login automático falhou: ${loginError.message}`);
        }

        setUser(loginData.user);
      } catch (autoLoginError: any) {
        throw autoLoginError;
      }
    } else if (data.session) {
      // Session created immediately
      setUser(data.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      
      if (error.code === 'invalid_credentials') {
        throw new Error('Email ou senha incorretos');
      } else if (error.code === 'email_not_confirmed') {
        throw new Error('Email não confirmado. Verifique sua caixa de entrada');
      } else if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou senha incorretos');
      } else {
        throw new Error(`Erro no login: ${error.message}`);
      }
    }

    console.log('Login realizado:', data.user?.email);
    
    if (data.user) {
      setUser(data.user);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      
      // Recarrega o perfil do usuário
      try {
        const userProfile = await profileService.getOrCreateUserProfile(session.user.id, session.user);
        setProfile(userProfile);
      } catch (error) {
        // Silent error handling
      }
    }
  };

  // Load profile when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      
      try {
        const userProfile = await profileService.getOrCreateUserProfile(user.id, user);
        setProfile(userProfile);
      } catch (error) {
        // Silent error handling
      }
    };

    loadProfile();
  }, [user]);

  const value: AuthContextType = {
    user,
    profile,
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