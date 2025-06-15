import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoginModal } from '@/components/modals/LoginModal';
import { RegisterModal } from '@/components/modals/RegisterModal';
import { LogOut, Wallet } from 'lucide-react';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

export function Header() {
  const { user, isLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Debug logs
  console.log('Header render - user:', user, 'isLoading:', isLoading);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={thunderbetLogo} alt="ThunderBet" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              ThunderBet
            </span>
          </div>

          {/* Estado dinâmico baseado na autenticação */}
          <div className="flex items-center space-x-2">
            {isLoading ? (
              // Loading state
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-600 rounded"></div>
              </div>
            ) : user ? (
              // Usuário logado - mostrar saldo e logout
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-800/60 rounded-lg px-2 py-1">
                  <Wallet className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 font-medium text-xs">
                    R$ 1.000,00
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-white text-xs font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 h-6 w-6 p-0"
                  onClick={handleLogout}
                  title={t('header.logout')}
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              // Usuário não logado - mostrar botões de login/cadastro
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-700/50 h-8 px-4 text-sm"
                  onClick={() => {
                    console.log('Abrindo modal de login');
                    setShowLoginModal(true);
                  }}
                >
                  {t('header.login')}
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-8 px-4 text-sm font-semibold"
                  onClick={() => {
                    console.log('Abrindo modal de cadastro');
                    setShowRegisterModal(true);
                  }}
                >
                  {t('header.register')}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modais */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}