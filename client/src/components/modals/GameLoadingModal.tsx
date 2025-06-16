import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { GameData } from '@/lib/gameData';
import { TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameData | null;
  onLoadingComplete: () => void;
}

export function GameLoadingModal({ isOpen, onClose, game, onLoadingComplete }: GameLoadingModalProps) {
  const { t, language } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [showError, setShowError] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');

  const loadingStages = language === 'en' 
    ? [
        'Connecting to server...',
        'Loading interface...',
        'Initializing...',
        'Loading resources...',
        'Preparing interface...',
        'Finalizing...'
      ]
    : [
        'Conectando ao servidor...',
        'Carregando interface...',
        'Inicializando...',
        'Carregando recursos...',
        'Preparando interface...',
        'Finalizando...'
      ];

  useEffect(() => {
    if (!isOpen || !game) {
      setProgress(0);
      setShowError(false);
      setLoadingStage('');
      return;
    }

    setProgress(0);
    setShowError(false);
    setLoadingStage(loadingStages[0]);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 8 + 2; // Random increment between 2-10% to complete in ~10 seconds
        const newProgress = Math.min(prev + increment, 100);
        
        // Update loading stage based on progress
        const stageIndex = Math.floor((newProgress / 100) * loadingStages.length);
        if (stageIndex < loadingStages.length) {
          setLoadingStage(loadingStages[stageIndex]);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Show error message after loading completes
          setTimeout(() => {
            setShowError(true);
          }, 500);
        }
        
        return newProgress;
      });
    }, 150); // Check every 150ms for realistic timing

    return () => clearInterval(interval);
  }, [isOpen, game, language]);

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900/98 via-purple-900/95 to-slate-900/98 border border-purple-400/30 shadow-2xl backdrop-blur-xl text-white w-full max-w-md mx-4 rounded-2xl overflow-hidden">
        {!showError ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between p-6 border-b border-purple-400/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-purple-400/30">
                    <img 
                      src={game.imageUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">{game.name}</DialogTitle>
                    <p className="text-purple-300 text-sm">
                      {language === 'en' ? 'Loading game...' : 'Carregando jogo...'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
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

              <p className="text-gray-400 text-sm mb-4">{loadingStage}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div 
                  className="progress-bar h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-sm font-medium mb-2">
                {language === 'en' ? 'Starting' : 'Iniciando'} {game.name}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round(progress)}% {language === 'en' ? 'complete' : 'concluído'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-between p-6 border-b border-purple-400/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-purple-400/30">
                  <img 
                    src={game.imageUrl} 
                    alt={game.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{game.name}</h2>
                  <p className="text-purple-300 text-sm">
                    {language === 'en' ? 'Game error' : 'Erro no jogo'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
                    <TriangleAlert className="h-10 w-10 text-red-400" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping opacity-60" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-red-400">
                    {language === 'en' ? 'Insufficient Balance' : 'Saldo Insuficiente'}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {language === 'en' 
                      ? 'You need balance to play this game. Make a deposit to continue having fun!'
                      : 'Você precisa de saldo para jogar este jogo. Faça um depósito para continuar se divertindo!'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    {language === 'en' ? 'Back to Home' : 'Voltar ao Início'}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-3 rounded-xl transition-all duration-300"
                  >
                    {language === 'en' ? 'Close' : 'Fechar'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
