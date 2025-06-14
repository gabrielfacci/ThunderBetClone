import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface LoginToastProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginToast({ isOpen, onClose, onLogin }: LoginToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div 
        className={`
          relative w-full max-w-sm mx-auto transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
        `}
      >
        {/* Toast Container */}
        <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm border border-yellow-400/30 rounded-xl shadow-2xl p-4 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/10 to-red-500/20 rounded-xl"></div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-orange-400/20 rounded-full blur-lg"></div>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="relative z-10 pr-8">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Entrar na Conta
                </h3>
                <p className="text-white/90 text-xs leading-relaxed">
                  Faça login para acessar esta área
                </p>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-4">
              <button
                onClick={onLogin}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />
    </div>
  );
}