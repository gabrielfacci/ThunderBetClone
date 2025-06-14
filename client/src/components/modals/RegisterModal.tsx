import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Phone, Lock, Sparkles, X, User } from 'lucide-react';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      const formatted = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (fullName.trim().length < 2) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter pelo menos 2 caracteres.",
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

    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length !== 11) {
      toast({
        title: "Telefone inválido",
        description: "Digite um telefone válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = `+55${phoneNumbers}`;
      await signUp(cleanPhone, password, fullName.trim());
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao ThunderBet.",
      });
      
      onClose();
      setFullName('');
      setPhone('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFullName('');
    setPhone('');
    setPassword('');
  };

  const handleSwitchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    if (tab === 'login') {
      onSwitchToLogin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 border-0 bg-transparent max-w-lg w-full">
        <div className="relative z-50 w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          <div className="p-6 max-w-lg bg-gradient-to-br from-slate-900/98 via-purple-900/95 to-blue-900/98 border border-purple-500/30 backdrop-blur-2xl shadow-2xl rounded-lg">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-cyan-600/10 rounded-lg"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={handleClose}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex flex-col sm:text-left text-center space-y-6 mb-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="relative flex items-center gap-2 transition-all duration-700 ease-out group hover:scale-110 cursor-pointer">
                      <div className="relative transition-all duration-700 w-20 h-20 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] filter brightness-110 group-hover:drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] group-hover:brightness-125">
                        <div className="absolute inset-0 bg-gradient-radial from-yellow-400/40 via-orange-500/20 to-transparent rounded-full blur-xl -z-30 animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-conic from-yellow-300/30 via-amber-400/20 to-orange-500/30 rounded-full blur-lg -z-20 animate-spin-slow"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/25 via-transparent to-amber-500/25 rounded-lg blur-md -z-10"></div>
                        <div className="relative w-full h-full">
                          <img 
                            alt="ThunderBet" 
                            src={thunderbetLogo}
                            className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-ping opacity-70 blur-[1px]"></div>
                        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full animate-pulse opacity-60 animation-delay-300 blur-[0.5px]"></div>
                        <div className="absolute top-1/4 -right-3 w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full animate-bounce opacity-50 animation-delay-500"></div>
                        <div className="absolute bottom-1/4 -left-3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-40 animation-delay-700"></div>
                      </div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/40 animate-ping scale-125"></div>
                        <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-pulse animation-delay-200 scale-110"></div>
                        <div className="absolute inset-0 rounded-full border border-orange-400/20 animate-ping animation-delay-400 scale-150"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-300/5 to-transparent pointer-events-none animate-pulse opacity-60"></div>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="tracking-tight text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Criar Conta
                  </h3>
                  <p className="text-gray-300 text-sm">Cadastre-se e comece sua jornada no ThunderBet</p>
                </div>

                {/* Tab Buttons */}
                <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700/50">
                  <button 
                    onClick={() => handleSwitchTab('login')}
                    className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 text-gray-400 hover:text-white hover:bg-gray-700/50"
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => handleSwitchTab('register')}
                    className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-400" />
                      Nome Completo
                    </label>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Digite seu nome completo"
                        className="flex w-full border px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-400" />
                      Telefone
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                        <span className="text-green-400 text-sm font-medium">🇧🇷 +55</span>
                      </div>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        className="flex w-full border px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-20 h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-purple-400" />
                      Senha
                    </label>
                    <div className="relative group">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha (mín. 6 caracteres)"
                        className="flex w-full border px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12 h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none px-4 py-2 w-full h-12 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="flex items-center gap-2">
                      {isLoading ? 'Criando conta...' : 'Cadastrar Agora'}
                      <Sparkles className="h-4 w-4" />
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400">
                    Ao continuar, você concorda com nossos{' '}
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Termos de Uso</span>
                    {' '}e{' '}
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Política de Privacidade</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}