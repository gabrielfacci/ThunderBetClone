import { useEffect, useState } from 'react';
import { CircleAlert, X } from 'lucide-react';

interface LoginToastProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginToast({ isOpen, onClose, onLogin }: LoginToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Pequeno delay para permitir que o componente seja renderizado antes da animação
      setTimeout(() => setIsVisible(true), 10);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Aguarda a animação terminar antes de remover o componente
        setTimeout(() => {
          setShouldRender(false);
          onClose();
        }, 300);
      }, 5000); // 5 segundos
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        bg-yellow-900/20 border-yellow-500 border rounded-lg p-4 max-w-sm w-full shadow-lg backdrop-blur-sm 
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CircleAlert className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0" onClick={onLogin} style={{ cursor: 'pointer' }}>
            <h4 className="text-sm font-semibold text-white">Entrar na Conta</h4>
            <p className="text-sm text-gray-300 mt-1">Faça login para acessar esta área</p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}