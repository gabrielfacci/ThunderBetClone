import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Gift, TrendingUp, Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromotionModal({ isOpen, onClose }: PromotionModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-full max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <DialogTitle className="text-lg font-bold">{t('VIP Promotions')}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-gray-400 text-sm mb-4">{t('Unlock exclusive rewards')}</p>
          
          {/* Advanced Player Section */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-4 h-4 text-black" />
              <h3 className="font-bold text-black">{t('Advanced Player')}</h3>
            </div>
            <p className="text-black text-sm">
              {t('You need to be an advanced player. Bet at least R$ 100.00 on any game to unlock exclusive promotions.')}
            </p>
          </div>

          {/* Benefits Available */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 flex items-center">
              <Gift className="w-4 h-4 text-yellow-500 mr-2" />
              {t('Available Benefits')}
            </h3>
            
            <div className="space-y-3">
              {/* VIP Cashback */}
              <div className="thunder-card rounded-lg p-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">{t('VIP Cashback')}</h4>
                  <p className="text-xs text-gray-400">{t('Up to 15% back')}</p>
                </div>
              </div>

              {/* Exclusive Bonuses */}
              <div className="thunder-card rounded-lg p-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">{t('Exclusive Bonuses')}</h4>
                  <p className="text-xs text-gray-400">{t('Personalized offers')}</p>
                </div>
              </div>

              {/* Premium Status */}
              <div className="thunder-card rounded-lg p-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">{t('Premium Status')}</h4>
                  <p className="text-xs text-gray-400">{t('Priority access')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Betting Button */}
          <Button 
            className="w-full thunder-button-primary"
            onClick={onClose}
          >
            {t('Start Betting')}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-3">
            {t('* Terms and conditions apply')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
