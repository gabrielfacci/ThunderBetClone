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
    'nav.withdrawal': 'Saque',
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
    'modal.deposit.pixTab': 'PIX',
    'modal.deposit.historyTab': 'Histórico',
    'modal.deposit.amount': 'Valor',
    'modal.deposit.enterAmount': 'Digite o valor',
    'modal.deposit.quickAmounts': 'Valores rápidos',
    'modal.deposit.confirmDeposit': 'Confirmar Depósito',
    'modal.deposit.close': 'Fechar',
    'modal.deposit.processing': 'Processando...',
    'modal.deposit.subtitle': 'Adicione saldo à sua conta',
    'modal.deposit.pixDescription': 'Rápido, seguro e disponível 24h',
    'modal.deposit.generateQR': 'Gerar QR Code PIX',
    'Make Deposit': 'Fazer Depósito',
    'Add balance to your account': 'Adicione saldo à sua conta',
    'History': 'Histórico',
    'Deposit via PIX': 'Depósito via PIX',
    'Fast, secure and available 24h': 'Rápido, seguro e disponível 24h',
    'Quick amounts': 'Valores rápidos',
    'Deposit amount': 'Valor do depósito',
    'Generate PIX QR Code': 'Gerar QR Code PIX',
    'Request Withdrawal': 'Solicitar Saque',
    'Withdraw your winnings via PIX': 'Retire seus ganhos via PIX',
    'Available balance:': 'Saldo disponível:',
    'Withdrawal amount': 'Valor do saque',
    'PIX key type': 'Tipo de chave PIX',
    'Phone': 'Telefone',
    'Random Key': 'Chave Aleatória',
    'VIP Promotions': 'Promoções VIP',
    'Unlock exclusive rewards': 'Desbloqueie recompensas exclusivas',
    'Advanced Player': 'Jogador Avançado',
    'You need to be an advanced player. Bet at least R$ 100.00 on any game to unlock exclusive promotions.': 'Você precisa ser um jogador avançado. Aposte pelo menos R$ 100,00 em qualquer jogo para desbloquear promoções exclusivas.',
    'Available Benefits': 'Benefícios Disponíveis',
    'VIP Cashback': 'Cashback VIP',
    'Up to 15% back': 'Até 15% de volta',
    'Exclusive Bonuses': 'Bônus Exclusivos',
    'Personalized offers': 'Ofertas personalizadas',
    'Premium Status': 'Status Premium',
    'Priority access': 'Acesso prioritário',
    'Start Betting': 'Começar a Apostar',
    '* Terms and conditions apply': '* Termos e condições se aplicam',
    'All': 'Todos',
    'Pragmatic Play': 'Pragmatic Play',
    'Evolution': 'Evolution',
    'Relax Gaming': 'Relax Gaming',
    'Jili': 'Jili',
    'Page': 'Página',
    'of': 'de',
    'games': 'jogos',
    'Search games by name or provider': 'Buscar jogos por nome ou provedor',
    'Game Lobby': 'Lobby de Jogos',
    'Minimum amount': 'Valor mínimo',
    'Minimum withdrawal amount is R$ 20.00': 'O valor mínimo para saque é R$ 20,00',
    'Insufficient balance': 'Saldo insuficiente',
    'You do not have enough balance for this withdrawal': 'Você não possui saldo suficiente para este saque',
    'Withdrawal requested!': 'Saque solicitado!',
    'Your withdrawal of R$': 'Seu saque de R$',
    'is being processed': 'está sendo processado',
    'Withdrawal error': 'Erro no saque',
    'Could not process withdrawal': 'Não foi possível processar o saque',
    'Error loading transactions:': 'Erro ao carregar transações:',
    'No withdrawals found': 'Nenhum saque encontrado',
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
    'nav.withdrawal': 'Withdrawal',
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
    'modal.deposit.pixTab': 'PIX',
    'modal.deposit.historyTab': 'History',
    'modal.deposit.amount': 'Amount',
    'modal.deposit.enterAmount': 'Enter amount',
    'modal.deposit.quickAmounts': 'Quick amounts',
    'modal.deposit.confirmDeposit': 'Confirm Deposit',
    'modal.deposit.close': 'Close',
    'modal.deposit.processing': 'Processing...',
    'modal.deposit.subtitle': 'Add balance to your account',
    'modal.deposit.pixDescription': 'Fast, secure and available 24h',
    'modal.deposit.generateQR': 'Generate PIX QR Code',
    'Make Deposit': 'Make Deposit',
    'Add balance to your account': 'Add balance to your account',
    'History': 'History',
    'Deposit via PIX': 'Deposit via PIX',
    'Fast, secure and available 24h': 'Fast, secure and available 24h',
    'Quick amounts': 'Quick amounts',
    'Deposit amount': 'Deposit amount',
    'Generate PIX QR Code': 'Generate PIX QR Code',
    'Request Withdrawal': 'Request Withdrawal',
    'Withdraw your winnings via PIX': 'Withdraw your winnings via PIX',
    'Available balance:': 'Available balance:',
    'Withdrawal amount': 'Withdrawal amount',
    'PIX key type': 'PIX key type',
    'Phone': 'Phone',
    'Random Key': 'Random Key',
    'VIP Promotions': 'VIP Promotions',
    'Unlock exclusive rewards': 'Unlock exclusive rewards',
    'Advanced Player': 'Advanced Player',
    'You need to be an advanced player. Bet at least R$ 100.00 on any game to unlock exclusive promotions.': 'You need to be an advanced player. Bet at least R$ 100.00 on any game to unlock exclusive promotions.',
    'Available Benefits': 'Available Benefits',
    'VIP Cashback': 'VIP Cashback',
    'Up to 15% back': 'Up to 15% back',
    'Exclusive Bonuses': 'Exclusive Bonuses',
    'Personalized offers': 'Personalized offers',
    'Premium Status': 'Premium Status',
    'Priority access': 'Priority access',
    'Start Betting': 'Start Betting',
    '* Terms and conditions apply': '* Terms and conditions apply',
    'All': 'All',
    'Pragmatic Play': 'Pragmatic Play',
    'Evolution': 'Evolution',
    'Relax Gaming': 'Relax Gaming',
    'Jili': 'Jili',
    'Page': 'Page',
    'of': 'of',
    'games': 'games',
    'Search games by name or provider': 'Search games by name or provider',
    'Game Lobby': 'Game Lobby',
    'Minimum amount': 'Minimum amount',
    'Minimum withdrawal amount is R$ 20.00': 'Minimum withdrawal amount is R$ 20.00',
    'Insufficient balance': 'Insufficient balance',
    'You do not have enough balance for this withdrawal': 'You do not have enough balance for this withdrawal',
    'Withdrawal requested!': 'Withdrawal requested!',
    'Your withdrawal of R$': 'Your withdrawal of R$',
    'is being processed': 'is being processed',
    'Withdrawal error': 'Withdrawal error',
    'Could not process withdrawal': 'Could not process withdrawal',
    'Error loading transactions:': 'Error loading transactions:',
    'No withdrawals found': 'No withdrawals found',
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