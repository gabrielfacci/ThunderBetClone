import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AccountMode = 'national' | 'international';
type Language = 'pt' | 'en';

interface User {
  id: number;
  fullName: string;
  phone: string;
  accountMode: AccountMode;
  balance: number;
}

interface AppContextType {
  user: User | null;
  language: Language;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateAccountMode: (mode: AccountMode) => void;
  updateBalance: (balance: number) => void;
  updateFullName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const language: Language = user?.accountMode === 'national' ? 'pt' : 'en';

  const logout = () => {
    setUser(null);
  };

  const updateAccountMode = async (mode: AccountMode) => {
    if (user) {
      try {
        const response = await fetch(`/api/user/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accountMode: mode }),
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating account mode:', error);
        // Fallback to local update if API fails
        setUser({ ...user, accountMode: mode });
      }
    }
  };

  const updateBalance = async (balance: number) => {
    if (user) {
      try {
        const response = await fetch(`/api/user/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ balance }),
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        // Fallback to local update if API fails
        setUser({ ...user, balance });
      }
    }
  };

  const updateFullName = async (name: string) => {
    if (user) {
      try {
        const response = await fetch(`/api/user/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fullName: name }),
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating full name:', error);
        // Fallback to local update if API fails
        setUser({ ...user, fullName: name });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      language,
      setUser,
      logout,
      updateAccountMode,
      updateBalance,
      updateFullName
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
