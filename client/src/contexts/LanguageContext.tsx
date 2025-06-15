import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    'header.login': 'Entrar',
    'header.register': 'Cadastrar',
    'header.balance': 'R$ 1.000,00',
    'header.logout': 'Sair',
    
    // Navigation
    'nav.home': 'Início',
    'nav.deposit': 'Depósito',
    'nav.promotion': 'Promoção',
    'nav.profile': 'Perfil',
    
    // Profile Modal
    'profile.title': 'Meu Perfil',
    'profile.subtitle': 'Gerencie suas informações pessoais',
    'profile.loading': 'Carregando dados...',
    'profile.phone': 'Telefone',
    'profile.phone.notEditable': 'Não editável',
    'profile.fullName': 'Nome Completo',
    'profile.accountMode': 'Modo de conta',
    'profile.accountMode.nacional': 'Nacional',
    'profile.accountMode.internacional': 'Internacional',
    'profile.accountMode.brasil': 'Brasil',
    'profile.accountMode.global': 'Global',
    'profile.accountMode.description': 'Sua conta vai estar como:',
    'profile.close': 'Fechar',
    'profile.edit': 'Editar Perfil',
    'profile.cancel': 'Cancelar',
    'profile.save': 'Salvar Alterações',
    'profile.saving': 'Salvando...',
    
    // Auth Modals
    'auth.login.title': 'Entrar',
    'auth.register.title': 'Cadastrar',
    'auth.fullName': 'Nome Completo',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.phone': 'Telefone',
    'auth.login.button': 'Entrar',
    'auth.register.button': 'Cadastrar',
    'auth.cancel': 'Cancelar',
    
    // Games
    'games.title': 'Jogos',
    'games.search': 'Buscar jogos...',
    'games.category.all': 'Todos',
    'games.category.slots': 'Slots',
    'games.category.live': 'Ao Vivo',
    'games.category.table': 'Mesa',
    
    // Modals
    'modal.deposit.title': 'Depósito',
    'modal.withdrawal.title': 'Saque',
    'modal.promotion.title': 'Promoções',
    'modal.insufficientBalance.title': 'Saldo Insuficiente',
    
    // Messages
    'message.profileUpdated': 'Perfil atualizado',
    'message.profileUpdatedDesc': 'Suas informações foram salvas com sucesso.',
    'message.error': 'Erro',
    'message.errorLoadingProfile': 'Não foi possível carregar os dados do perfil.',
    'message.languageChanged': 'Idioma alterado para português.',
    
    // Validation
    'validation.required': 'Campo obrigatório',
    'validation.invalidEmail': 'Email inválido',
    'validation.passwordTooShort': 'A senha deve ter pelo menos 6 caracteres',
    'validation.passwordMismatch': 'As senhas não coincidem',
  },
  en: {
    // Header
    'header.login': 'Login',
    'header.register': 'Register',
    'header.balance': '$1,000.00',
    'header.logout': 'Logout',
    
    // Navigation
    'nav.home': 'Home',
    'nav.deposit': 'Deposit',
    'nav.promotion': 'Promotion',
    'nav.profile': 'Profile',
    
    // Profile Modal
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your personal information',
    'profile.loading': 'Loading data...',
    'profile.phone': 'Phone',
    'profile.phone.notEditable': 'Not editable',
    'profile.fullName': 'Full Name',
    'profile.accountMode': 'Account Mode',
    'profile.accountMode.nacional': 'National',
    'profile.accountMode.internacional': 'International',
    'profile.accountMode.brasil': 'Brazil',
    'profile.accountMode.global': 'Global',
    'profile.accountMode.description': 'Your account will be set as:',
    'profile.close': 'Close',
    'profile.edit': 'Edit Profile',
    'profile.cancel': 'Cancel',
    'profile.save': 'Save Changes',
    'profile.saving': 'Saving...',
    
    // Auth Modals
    'auth.login.title': 'Login',
    'auth.register.title': 'Register',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.phone': 'Phone',
    'auth.login.button': 'Login',
    'auth.register.button': 'Register',
    'auth.cancel': 'Cancel',
    
    // Games
    'games.title': 'Games',
    'games.search': 'Search games...',
    'games.category.all': 'All',
    'games.category.slots': 'Slots',
    'games.category.live': 'Live',
    'games.category.table': 'Table',
    
    // Modals
    'modal.deposit.title': 'Deposit',
    'modal.withdrawal.title': 'Withdrawal',
    'modal.promotion.title': 'Promotions',
    'modal.insufficientBalance.title': 'Insufficient Balance',
    
    // Messages
    'message.profileUpdated': 'Profile updated',
    'message.profileUpdatedDesc': 'Your information has been saved successfully.',
    'message.error': 'Error',
    'message.errorLoadingProfile': 'Could not load profile data.',
    'message.languageChanged': 'Language changed to English.',
    
    // Validation
    'validation.required': 'Required field',
    'validation.invalidEmail': 'Invalid email',
    'validation.passwordTooShort': 'Password must be at least 6 characters',
    'validation.passwordMismatch': 'Passwords do not match',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('pt');
  const { user, profile } = useAuth();

  // Update language based on user's account_mode
  useEffect(() => {
    if (profile?.account_mode) {
      const newLanguage = profile.account_mode === 'internacional' ? 'en' : 'pt';
      if (newLanguage !== language) {
        console.log('Changing language to:', newLanguage, 'based on account_mode:', profile.account_mode);
        setLanguageState(newLanguage);
      }
    }
  }, [profile?.account_mode, language]);

  const setLanguage = (lang: Language) => {
    console.log('Manual language change to:', lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['pt']];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}