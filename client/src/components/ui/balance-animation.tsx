import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

interface BalanceAnimationProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export function BalanceAnimation({ amount, show, onComplete }: BalanceAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Start animation after element is rendered
      setTimeout(() => setIsAnimating(true), 50);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 300); // Wait for exit animation
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out ${
      isAnimating 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 -translate-y-4 scale-95'
    }`}>
      <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 border-2 border-green-400 animate-pulse">
        <Plus className="w-5 h-5" />
        <span className="font-bold text-lg">
          +R$ {amount.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  );
}