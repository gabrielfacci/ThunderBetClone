import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Sparkles, X } from 'lucide-react';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao ThunderBet.",
      });
      
      onClose();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setPassword('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg p-0 border-0 bg-transparent max-w-sm sm:max-w-md w-full pl-[20px] pr-[20px]">
        <DialogTitle className="sr-only">Entrar na Conta</DialogTitle>
        <div className="relative w-full bg-gradient-to-br from-slate-900/98 via-purple-900/95 to-blue-900/98 border border-purple-500/30 backdrop-blur-2xl shadow-2xl rounded-lg max-h-[90vh] overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-cyan-600/10 rounded-lg"></div>
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          {/* Close Button */}
          <div className="absolute top-3 right-3 z-50">
            <button 
              onClick={handleClose}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 p-4">
            {/* Compact Header */}
            <div className="text-center space-y-3 mb-5">
              {/* Logo compacto */}
              <div className="flex justify-center">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                  <img 
                    alt="ThunderBet" 
                    src={thunderbetLogo}
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                  />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Entrar na Conta
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">Entre e continue sua jornada</p>
              </div>

              {/* Tab Buttons compactos */}
              <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                <button className="flex-1 py-2 px-3 rounded-md font-medium text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                  Entrar
                </button>
                <button 
                  onClick={onSwitchToRegister}
                  className="flex-1 py-2 px-3 rounded-md font-medium text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
                >
                  Cadastrar
                </button>
              </div>
            </div>

            {/* Form compacto */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-purple-400" />
                  Email
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm text-white bg-gray-800/70 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200 placeholder:text-gray-400 h-9 sm:h-10"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-purple-400" />
                  Senha
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm text-white bg-gray-800/70 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200 placeholder:text-gray-400 h-9 sm:h-10"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-9 sm:h-10 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm mt-4"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? 'Entrando...' : 'Entrar na Conta'}
                  <Sparkles className="h-3 w-3" />
                </span>
              </button>
            </form>

            {/* Footer compacto */}
            <div className="text-center pt-3 mt-3 border-t border-gray-700/50">
              <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
                Ao continuar, você concorda com nossos{' '}
                <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Termos</span>
                {' '}e{' '}
                <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Privacidade</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}