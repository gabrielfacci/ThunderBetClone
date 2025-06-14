import { CircleAlert, X } from 'lucide-react';

interface LoginToastProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginToast({ isOpen, onClose, onLogin }: LoginToastProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-900/20 border-yellow-500 border rounded-lg p-4 max-w-sm w-full shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-in-out translate-x-0 opacity-100 pt-[5px] pb-[5px]">
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