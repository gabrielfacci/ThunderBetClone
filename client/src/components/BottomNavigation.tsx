import { useState } from 'react';
import { Wallet, TrendingDown, Home, Gift, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DepositModal } from './modals/DepositModal';
import { WithdrawalModal } from './modals/WithdrawalModal';
import { PromotionModal } from './modals/PromotionModal';
import { ProfileModal } from './modals/ProfileModal';
import navBackground from '@assets/image_1749830967541.png';

type ModalType = 'deposit' | 'withdrawal' | 'promotion' | 'profile' | null;

export function BottomNavigation() {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState('home');

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
    setActiveTab(modal || 'home');
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveTab('home');
  };

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 border-t border-gray-700/50 z-40 safe-area-inset-bottom"
        style={{
          backgroundImage: `url(${navBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative h-full flex items-end justify-around px-3 pb-2">
          <button 
            className="relative flex flex-col items-center cursor-pointer transition-all duration-300 text-gray-400 hover:text-gray-300 touch-manipulation active:scale-95 mb-2"
            onClick={() => openModal('deposit')}
          >
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs leading-tight mt-1">{t('Deposit')}</span>
          </button>
          
          <button 
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 touch-manipulation active:scale-95 mb-2 ${
              activeTab === 'withdrawal' ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => openModal('withdrawal')}
          >
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-xs leading-tight mt-1">{t('Withdrawal')}</span>
          </button>
          
          <button 
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 touch-manipulation active:scale-95 ${
              activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <div className="relative w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <div className="absolute inset-0 transition-all duration-300 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40"></div>
              <Home className="w-7 h-7 relative z-10" />
            </div>
            <span className="text-xs leading-tight">{t('Home')}</span>
          </button>
          
          <button 
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 touch-manipulation active:scale-95 mb-2 ${
              activeTab === 'promotion' ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => openModal('promotion')}
          >
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10">
              <Gift className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-xs leading-tight mt-1">{t('Promotion')}</span>
          </button>
          
          <button 
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 touch-manipulation active:scale-95 mb-2 ${
              activeTab === 'profile' ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => openModal('profile')}
          >
            <div className="relative flex items-center justify-center transition-all duration-300 group w-10 h-10 rounded-full text-white bg-[#f9731605]">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs leading-tight mt-1">{t('Profile')}</span>
          </button>
        </div>
      </nav>
      
      {/* Modals */}
      <DepositModal isOpen={activeModal === 'deposit'} onClose={closeModal} />
      <WithdrawalModal isOpen={activeModal === 'withdrawal'} onClose={closeModal} />
      <PromotionModal isOpen={activeModal === 'promotion'} onClose={closeModal} />
      <ProfileModal isOpen={activeModal === 'profile'} onClose={closeModal} />
    </>
  );
}
