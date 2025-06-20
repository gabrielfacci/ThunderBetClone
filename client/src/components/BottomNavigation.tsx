import { useState } from 'react';
import { Wallet, TrendingDown, Home, Gift, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DepositModal } from './modals/DepositModal';
import { WithdrawalModal } from './modals/WithdrawalModal';
import { PromotionModal } from './modals/PromotionModal';
import { ProfileModal } from './modals/ProfileModal';
import { LoginToast } from './ui/toast-login';
import navBackground from '@assets/image_1749830967541.png';

type ModalType = 'deposit' | 'withdrawal' | 'promotion' | 'profile' | null;

interface BottomNavigationProps {
  onLoginRequest?: () => void;
}

export function BottomNavigation({ onLoginRequest }: BottomNavigationProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showLoginToast, setShowLoginToast] = useState(false);

  const openModal = (modal: ModalType) => {
    // Bloquear modais que requerem autenticação se usuário não estiver logado
    const protectedModals: ModalType[] = ['deposit', 'withdrawal', 'profile'];
    
    if (protectedModals.includes(modal) && !user) {
      setShowLoginToast(true);
      return;
    }

    setActiveModal(modal);
    setActiveTab(modal || 'home');
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveTab('home');
  };

  return (
    <>
      <div id="tab-bar-home" className="fixed bottom-0 left-0 right-0 lg:hidden z-[2000] h-[87px] overflow-hidden">
        <img 
          alt="Bottom navigation background" 
          decoding="async" 
          data-nimg="fill" 
          className="tabbar-left-bg object-cover object-center" 
          sizes="100vw" 
          src={navBackground}
          style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent' }}
        />
        <div className="tabbar-left relative h-full flex items-end justify-around px-3 pb-2">
          <div className="tabbar-left-item relative flex flex-col items-center cursor-pointer transition-all duration-300" onClick={() => openModal('deposit')}>
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <Wallet className="relative z-10 transition-all duration-300 h-5 w-5 text-gray-300 group-hover:text-white" />
            </div>
            <span className="text-[9px] font-medium mt-0.5 transition-all duration-300 text-center leading-none text-gray-400">{t('nav.deposit')}</span>
          </div>
          
          <div className="tabbar-left-item relative flex flex-col items-center cursor-pointer transition-all duration-300" onClick={() => openModal('withdrawal')}>
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <TrendingDown className="relative z-10 transition-all duration-300 h-5 w-5 text-gray-300 group-hover:text-white" />
            </div>
            <span className="text-[9px] font-medium mt-0.5 transition-all duration-300 text-center leading-none text-gray-400">{t('nav.withdrawal')}</span>
          </div>
          
          <div className="tabbar-left-item relative flex flex-col items-center cursor-pointer transition-all duration-300 transform -translate-y-4" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center transition-all duration-300 group w-12 h-12">
              <div className="absolute inset-0 transition-all duration-300 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10"></div>
              <Home className="relative z-10 transition-all duration-300 h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <span className="text-[9px] font-medium mt-0.5 transition-all duration-300 text-center leading-none text-orange-200">{t('nav.home')}</span>
          </div>
          
          <div className="tabbar-left-item relative flex flex-col items-center cursor-pointer transition-all duration-300" onClick={() => openModal('promotion')}>
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <Gift className="relative z-10 transition-all duration-300 h-5 w-5 text-gray-300 group-hover:text-white" />
              <div className="red-point absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border border-white/80 shadow-sm flex items-center justify-center z-20">
                <span className="text-white text-[8px] font-bold leading-none">2</span>
              </div>
            </div>
            <span className="text-[9px] font-medium mt-0.5 transition-all duration-300 text-center leading-none text-gray-400">{t('nav.promotion')}</span>
          </div>
          
          <div className="tabbar-left-item relative flex flex-col items-center cursor-pointer transition-all duration-300" onClick={() => openModal('profile')}>
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <User className="relative z-10 transition-all duration-300 h-5 w-5 text-gray-300 group-hover:text-white" />
            </div>
            <span className="text-[9px] font-medium mt-0.5 transition-all duration-300 text-center leading-none text-gray-400">{t('nav.profile')}</span>
          </div>
        </div>
      </div>
      {/* Modals */}
      <DepositModal isOpen={activeModal === 'deposit'} onClose={closeModal} />
      <WithdrawalModal isOpen={activeModal === 'withdrawal'} onClose={closeModal} />
      <PromotionModal isOpen={activeModal === 'promotion'} onClose={closeModal} />
      <ProfileModal isOpen={activeModal === 'profile'} onClose={closeModal} />

      {/* Login Toast para usuários não logados */}
      <LoginToast 
        isOpen={showLoginToast}
        onClose={() => setShowLoginToast(false)}
        onLogin={() => {
          setShowLoginToast(false);
          onLoginRequest?.();
        }}
      />
    </>
  );
}
