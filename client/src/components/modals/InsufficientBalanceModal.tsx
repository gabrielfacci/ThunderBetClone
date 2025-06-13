import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GameData } from '@/lib/gameData';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameData | null;
  onDeposit: () => void;
}

export function InsufficientBalanceModal({ 
  isOpen, 
  onClose, 
  game, 
  onDeposit 
}: InsufficientBalanceModalProps) {
  const { t } = useTranslation();

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-full max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <img 
              src={game.imageUrl} 
              alt={game.name}
              className="w-10 h-10 rounded-lg object-cover" 
            />
            <div>
              <DialogTitle className="text-lg font-bold">{game.name}</DialogTitle>
              <p className="text-sm text-red-400">{t('Game error')}</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-red-400 mb-2">
            {t('Insufficient Balance')}
          </h3>
          
          <p className="text-gray-300 text-sm mb-6">
            {t('You need balance to play this game. Make a deposit to continue having fun!')}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full thunder-button-primary"
              onClick={onDeposit}
            >
              {t('Make Deposit')}
            </Button>
            <Button 
              variant="outline"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              onClick={onClose}
            >
              {t('Back to Home')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
