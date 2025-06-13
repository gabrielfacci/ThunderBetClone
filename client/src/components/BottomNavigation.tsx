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
        className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t border-gray-700/50 z-40"
        style={{
          backgroundImage: `url(${navBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="px-4 max-w-md mx-auto mt-[6px] mb-[6px]">
          <div className="grid grid-cols-5 h-20">
          <button 
            className="flex flex-col items-center justify-center space-y-1 transition-colors text-gray-400 hover:text-gray-300 mt-[30px] mb-[30px] pt-[0px] pb-[0px]"
            onClick={() => openModal('deposit')}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">{t('Deposit')}</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'withdrawal' ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => openModal('withdrawal')}
          >
            <TrendingDown className="w-5 h-5" />
            <span className="text-xs">{t('Withdrawal')}</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors relative -mt-4 ${
              activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <div className="relative w-12 h-12 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 transition-all duration-300 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40"></div>
              <Home className="w-6 h-6 relative z-10" />
            </div>
            <span className="text-xs">{t('Home')}</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
              activeTab === 'promotion' ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => openModal('promotion')}
          >
            <Gift className="w-5 h-5" />
            <span className="text-xs">{t('Promotion')}</span>
            <div className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
              activeTab === 'profile' ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => openModal('profile')}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-[#f9731605]">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs">{t('Profile')}</span>
          </button>
          </div>
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
