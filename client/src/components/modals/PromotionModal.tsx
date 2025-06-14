import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[85vh] overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-center">{t('VIP Promotions')}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 text-sm text-center">
            {t('Unlock exclusive rewards')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-4 pb-4">
          {/* Advanced Player Section */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-4 h-4 text-black" />
              <h3 className="font-bold text-black text-sm">{t('Advanced Player')}</h3>
            </div>
            <p className="text-black text-xs leading-tight">
              {t('You need to be an advanced player. Bet at least R$ 100.00 on any game to unlock exclusive promotions.')}
            </p>
          </div>

          {/* Benefits Available */}
          <div className="mb-4">
            <h3 className="font-bold mb-3 text-sm flex items-center">
              <Gift className="w-4 h-4 text-yellow-500 mr-2" />
              {t('Available Benefits')}
            </h3>
            
            <div className="space-y-2">
              {/* VIP Cashback */}
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm">{t('VIP Cashback')}</h4>
                  <p className="text-xs text-gray-400">{t('Up to 15% back')}</p>
                </div>
              </div>

              {/* Exclusive Bonuses */}
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm">{t('Exclusive Bonuses')}</h4>
                  <p className="text-xs text-gray-400">{t('Personalized offers')}</p>
                </div>
              </div>

              {/* Premium Status */}
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm">{t('Premium Status')}</h4>
                  <p className="text-xs text-gray-400">{t('Priority access')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Betting Button */}
          <Button 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 text-sm touch-manipulation"
            onClick={onClose}
          >
            {t('Start Betting')}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-2">
            {t('* Terms and conditions apply')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
