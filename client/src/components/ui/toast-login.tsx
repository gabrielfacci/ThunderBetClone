import { AlertCircle, X } from 'lucide-react';

interface LoginToastProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginToast({ isOpen, onClose, onLogin }: LoginToastProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div 
        className="relative bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 rounded-lg shadow-lg overflow-hidden cursor-pointer"
        onClick={onLogin}
      >
        {/* Botão de fechar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Conteúdo */}
        <div className="flex items-center space-x-3 p-3 pr-8">
          {/* Ícone de alerta */}
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          
          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-tight">
              Entrar na Conta
            </h3>
            <p className="text-white/90 text-xs leading-tight mt-0.5">
              Faça login para acessar esta área
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}