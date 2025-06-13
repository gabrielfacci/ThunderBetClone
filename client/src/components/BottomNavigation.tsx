import { useState } from 'react';
import { Wallet, TrendingDown, Home, Gift, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DepositModal } from './modals/DepositModal';
import { WithdrawalModal } from './modals/WithdrawalModal';
import { PromotionModal } from './modals/PromotionModal';
import { ProfileModal } from './modals/ProfileModal';

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
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-40">
        <div className="grid grid-cols-5 h-16">
          <button 
            className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => openModal('deposit')}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">{t('Deposit')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'withdrawal' ? 'active' : ''}`}
            onClick={() => openModal('withdrawal')}
          >
            <TrendingDown className="w-5 h-5" />
            <span className="text-xs">{t('Withdrawal')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">{t('Home')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'promotion' ? 'active' : ''}`}
            onClick={() => openModal('promotion')}
          >
            <Gift className="w-5 h-5" />
            <span className="text-xs">{t('Promotion')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => openModal('profile')}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{t('Profile')}</span>
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
