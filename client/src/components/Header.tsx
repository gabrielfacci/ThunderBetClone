import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { LoginModal } from '@/components/modals/LoginModal';
import { RegisterModal } from '@/components/modals/RegisterModal';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

export function Header() {
  const { user, logout } = useAppContext();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

          {/* Auth Buttons or User Info */}
          <div className="flex items-center space-x-2">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-700/50 h-8 px-4 text-sm"
                  onClick={() => setShowLoginModal(true)}
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-8 px-4 text-sm font-semibold"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Cadastrar
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{user.fullName}</p>
                  <p className="text-green-400 text-xs">
                    R$ {user.balance.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-700/50 h-8 px-3 text-xs"
                  onClick={logout}
                >
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
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