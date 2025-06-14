import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SimpleUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
  created_at?: string;
  full_name?: string;
  balance?: number;
}

interface AuthContextType {
  user: SimpleUser | null;
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

// Simple in-memory user storage for demo
const getStoredUsers = (): Record<string, { email: string; password: string; fullName: string; id: string }> => {
  const stored = localStorage.getItem('thunderbet_users');
  return stored ? JSON.parse(stored) : {};
};

const storeUser = (email: string, password: string, fullName: string) => {
  const users = getStoredUsers();
  const id = `user_${Date.now()}`;
  users[email] = { email, password, fullName, id };
  localStorage.setItem('thunderbet_users', JSON.stringify(users));
  return id;
};

const getCurrentUser = (): SimpleUser | null => {
  const stored = localStorage.getItem('thunderbet_current_user');
  return stored ? JSON.parse(stored) : null;
};

const setCurrentUser = (user: SimpleUser | null) => {
  if (user) {
    localStorage.setItem('thunderbet_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('thunderbet_current_user');
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on startup
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
    console.log('Auth initialized - user:', currentUser?.email || 'none');
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    console.log('Cadastro com email:', email);

    // Check if user already exists
    const users = getStoredUsers();
    if (users[email]) {
      throw new Error('Este email já está cadastrado');
    }

    // Create new user
    const userId = storeUser(email, password, fullName);
    const newUser: SimpleUser = {
      id: userId,
      email,
      user_metadata: { full_name: fullName },
      created_at: new Date().toISOString(),
      full_name: fullName,
      balance: 1000.00 // Starting balance for demo
    };

    setUser(newUser);
    setCurrentUser(newUser);
    console.log('Cadastro realizado com sucesso:', email);
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    console.log('Login com email:', email);

    const users = getStoredUsers();
    const storedUser = users[email];

    if (!storedUser || storedUser.password !== password) {
      throw new Error('Email ou senha incorretos');
    }

    const authUser: SimpleUser = {
      id: storedUser.id,
      email: storedUser.email,
      user_metadata: { full_name: storedUser.fullName },
      created_at: new Date().toISOString(),
      full_name: storedUser.fullName,
      balance: 1000.00 // Default balance for demo
    };

    setUser(authUser);
    setCurrentUser(authUser);
    console.log('Login realizado com sucesso:', email);
  };

  const signOut = async () => {
    console.log('Fazendo logout...');
    setUser(null);
    setCurrentUser(null);
    console.log('Logout realizado');
  };

  const refreshProfile = async () => {
    // Mock implementation - in real app would refetch user data
    console.log('Refreshing profile...');
    if (user) {
      const updatedUser = { ...user };
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}