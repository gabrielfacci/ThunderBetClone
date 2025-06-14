import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Phone } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
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
    
    if (!phone || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha telefone e senha.",
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
      const cleanPhone = `+55${phone.replace(/\D/g, '')}`;
      await signIn(cleanPhone, password);
      
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao ThunderBet.",
      });
      
      onClose();
      setPhone('');
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
    setPhone('');
    setPassword('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[85vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Entrar na Conta
            </DialogTitle>
            <p className="text-gray-400 text-center text-sm mt-2">
              Acesse sua conta no ThunderBet
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Telefone */}
            <div>
              <Label className="text-gray-300 text-sm font-medium mb-2 block">
                Telefone
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-400 text-sm">+55</span>
                </div>
                <Input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="bg-gray-800/50 border-gray-600/50 text-white pl-16 h-12 text-base focus:border-purple-500 focus:ring-purple-500"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <Label className="text-gray-300 text-sm font-medium mb-2 block">
                Senha
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-12 text-base focus:border-purple-500 focus:ring-purple-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 text-base font-semibold mt-6 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar na Conta'}
            </Button>
          </form>

          {/* Link para Cadastro */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Ainda não tem conta?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Cadastre-se aqui
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}