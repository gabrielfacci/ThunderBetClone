import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { countryCodes } from '@/lib/countryCodes';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  countryCode: z.string().min(1, 'Selecione o código do país'),
  phone: z.string().min(8, 'Número de telefone inválido').max(15, 'Número muito longo'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useAppContext();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      countryCode: '+55',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const fullPhoneNumber = `${data.countryCode}${data.phone}`;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: fullPhoneNumber,
          password: data.password,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          fullName: userData.full_name || userData.fullName,
          phone: userData.phone,
          accountMode: userData.account_mode || userData.accountMode,
          balance: parseFloat(userData.balance) || 0,
        });

        toast({
          title: "Conta criada!",
          description: "Bem-vindo à ThunderBet. Sua conta foi criada com sucesso.",
        });
        
        form.reset();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Erro no cadastro",
          description: error.message || "Não foi possível criar a conta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountry = countryCodes.find(country => country.code === form.watch('countryCode'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-md border-gray-700 text-white w-[90%] max-w-sm mx-auto rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
            Criar Conta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-400">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">Telefone Celular</Label>
            <div className="flex space-x-2">
              <Select
                value={form.watch('countryCode')}
                onValueChange={(value) => form.setValue('countryCode', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white w-28">
                  <SelectValue>
                    {selectedCountry && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">{selectedCountry.flag}</span>
                        <span className="text-xs">{selectedCountry.code}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                  {countryCodes.map((country) => (
                    <SelectItem key={`${country.code}-${country.country}`} value={country.code}>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{country.flag}</span>
                        <span className="text-xs">{country.code}</span>
                        <span className="text-xs text-gray-400 truncate">{country.country}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex-1">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="999999999"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  {...form.register('phone')}
                />
              </div>
            </div>
            {form.formState.errors.countryCode && (
              <p className="text-sm text-red-400">{form.formState.errors.countryCode.message}</p>
            )}
            {form.formState.errors.phone && (
              <p className="text-sm text-red-400">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                {...form.register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                {...form.register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-400">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              "Criando conta..."
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Button
                type="button"
                variant="link"
                className="text-yellow-400 hover:text-yellow-300 p-0 h-auto font-normal"
                onClick={onSwitchToLogin}
              >
                Entrar aqui
              </Button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}