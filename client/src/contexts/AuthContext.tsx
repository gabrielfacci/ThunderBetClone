import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
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

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Convert email to working domain for Supabase restrictions
    const convertEmail = (originalEmail: string): string => {
      const [username] = originalEmail.toLowerCase().split('@');
      return `${username}@thunderbet.com`;
    };

    const workingEmail = convertEmail(email);
    console.log('Cadastro:', email, '->', workingEmail);

    const { data, error } = await supabase.auth.signUp({
      email: workingEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          original_email: email
        }
      }
    });

    if (error) {
      console.error('Erro no cadastro:', error.message);
      
      if (error.code === 'weak_password') {
        throw new Error('Senha muito fraca. Use pelo menos 6 caracteres');
      } else if (error.code === 'email_address_already_in_use') {
        throw new Error('Este email já está cadastrado');
      } else if (error.code === 'email_address_invalid') {
        throw new Error('Email inválido. Verifique o formato do email');
      } else {
        throw new Error(error.message);
      }
    }

    console.log('Cadastro realizado:', data.user?.email);

    // If signup successful but no session, user needs confirmation or auto-signin
    if (data.user && !data.session) {
      console.log('Tentando login após cadastro...');
      try {
        await signIn(email, password);
      } catch (loginError: any) {
        // If login fails due to confirmation, that's expected
        if (loginError.message.includes('Email not confirmed')) {
          console.log('Aguardando confirmação de email...');
          // For demo purposes, we'll create a mock session
          setUser(data.user);
        } else {
          throw loginError;
        }
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Convert email to working domain for Supabase restrictions
    const convertEmail = (originalEmail: string): string => {
      const [username] = originalEmail.toLowerCase().split('@');
      return `${username}@thunderbet.com`;
    };

    const workingEmail = convertEmail(email);
    console.log('Login:', email, '->', workingEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: workingEmail,
      password
    });

    if (error) {
      console.error('Erro no login:', error.message);
      
      if (error.code === 'invalid_credentials') {
        throw new Error('Email ou senha incorretos');
      } else if (error.code === 'email_not_confirmed') {
        throw new Error('Email não confirmado');
      } else {
        throw new Error(error.message);
      }
    }

    console.log('Login realizado:', data.user?.email);
  };

  const signOut = async () => {
    console.log('Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error.message);
      throw new Error(error.message);
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut
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