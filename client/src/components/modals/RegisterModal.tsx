import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Phone, User } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[85vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Criar Conta
            </DialogTitle>
            <p className="text-gray-400 text-center text-sm mt-2">
              Cadastre-se no ThunderBet
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome Completo */}
            <div>
              <Label className="text-gray-300 text-sm font-medium mb-2 block">
                Nome Completo
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="bg-gray-800/50 border-gray-600/50 text-white pl-10 h-12 text-base focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

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
                  placeholder="Digite sua senha (mín. 6 caracteres)"
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

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 text-base font-semibold mt-6 disabled:opacity-50"
            >
              {isLoading ? 'Criando conta...' : 'Cadastrar Agora'}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Faça login aqui
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}