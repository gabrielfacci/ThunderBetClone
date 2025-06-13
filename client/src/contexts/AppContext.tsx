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
  updateAccountMode: (mode: AccountMode) => void;
  updateBalance: (balance: number) => void;
  updateFullName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>({
    id: 1,
    fullName: 'dasdvf sfddfds',
    phone: '(00) 00000-0000',
    accountMode: 'national',
    balance: 0
  });

  const language: Language = user?.accountMode === 'national' ? 'pt' : 'en';

  const updateAccountMode = (mode: AccountMode) => {
    if (user) {
      setUser({ ...user, accountMode: mode });
    }
  };

  const updateBalance = (balance: number) => {
    if (user) {
      setUser({ ...user, balance });
    }
  };

  const updateFullName = (name: string) => {
    if (user) {
      setUser({ ...user, fullName: name });
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      language,
      setUser,
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
