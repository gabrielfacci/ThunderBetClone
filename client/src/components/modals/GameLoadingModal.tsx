import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { GameData } from '@/lib/gameData';

interface GameLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameData | null;
  onLoadingComplete: () => void;
}

export function GameLoadingModal({ isOpen, onClose, game, onLoadingComplete }: GameLoadingModalProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !game) return;

    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15 + 5; // Random increment between 5-20%
        const newProgress = Math.min(prev + increment, 100);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadingComplete();
          }, 500);
        }
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, game, onLoadingComplete]);

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
              <p className="text-sm text-gray-400">{t('Loading game...')}</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 text-center">
          {/* Loading Progress Circle */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-gray-700 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-transparent rounded-full animate-spin"
              style={{
                borderTopColor: 'hsl(43, 96%, 56%)',
                animationDuration: '1s'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-yellow-500">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-4">{t('Loading resources...')}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div 
              className="progress-bar h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm font-medium mb-2">
            {t('Starting')} {game.name}
          </p>
          <p className="text-xs text-gray-500">{t('Preparing interface...')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
