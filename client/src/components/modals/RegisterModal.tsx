import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Phone, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { countryCodes } from '@/lib/countryCodes';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
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
  const { signUp } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      countryCode: '+55',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const fullPhoneNumber = `${data.countryCode}${data.phone.replace(/\D/g, '')}`;
      
      await signUp(fullPhoneNumber, data.password, data.fullName);

      toast({
        title: "Conta criada!",
        description: "Bem-vindo à ThunderBet. Sua conta foi criada com sucesso.",
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCountry = countryCodes.find(country => country.code === form.watch('countryCode'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative z-50 w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 max-w-lg bg-gradient-to-br from-slate-900/98 via-purple-900/95 to-blue-900/98 border border-purple-500/30 backdrop-blur-2xl shadow-2xl rounded-lg">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-cyan-600/10 rounded-lg"></div>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-10 w-10 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative z-10 p-6">
            {/* Logo and Header */}
            <div className="flex flex-col text-center space-y-6 mb-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="relative flex items-center gap-2 transition-all duration-700 ease-out group hover:scale-110 cursor-pointer">
                    <div className="relative transition-all duration-700 w-20 h-20 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] filter brightness-110 group-hover:drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] group-hover:brightness-125">
                      <div className="absolute inset-0 bg-gradient-radial from-yellow-400/40 via-orange-500/20 to-transparent rounded-full blur-xl -z-30 animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-conic from-yellow-300/30 via-amber-400/20 to-orange-500/30 rounded-full blur-lg -z-20 animate-spin-slow"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/25 via-transparent to-amber-500/25 rounded-lg blur-md -z-10"></div>
                      <div className="relative w-full h-full">
                        <img 
                          src={thunderbetLogo} 
                          alt="ThunderBet" 
                          className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-ping opacity-70 blur-[1px]"></div>
                      <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full animate-pulse opacity-60 animation-delay-300 blur-[0.5px]"></div>
                      <div className="absolute top-1/4 -right-3 w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full animate-bounce opacity-50 animation-delay-500"></div>
                      <div className="absolute bottom-1/4 -left-3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-40 animation-delay-700"></div>
                    </div>
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
                <p className="text-gray-300 text-sm">Junte-se à ThunderBet e comece sua jornada</p>
              </div>

              {/* Tab Buttons */}
              <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700/50">
                <button 
                  onClick={onSwitchToLogin}
                  className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  Entrar
                </button>
                <button className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                  Cadastrar
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-400" />
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <input
                      {...form.register('fullName')}
                      className="flex w-full border px-3 py-2 text-sm text-white h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500 placeholder:text-gray-400 focus-visible:outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-400">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-400" />
                    Email
                  </label>
                  <div className="relative group">
                    <input
                      {...form.register('email')}
                      type="email"
                      className="flex w-full border px-3 py-2 text-sm text-white h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500 placeholder:text-gray-400 focus-visible:outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-400" />
                    Telefone
                  </label>
                  <div className="flex space-x-2">
                    <select
                      {...form.register('countryCode')}
                      className="bg-gray-800/70 border border-gray-600/50 text-white rounded-xl px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus-visible:outline-none w-24"
                    >
                      {countryCodes.slice(0, 10).map((country) => (
                        <option key={`${country.code}-${country.country}`} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      {...form.register('phone')}
                      type="tel"
                      className="flex-1 border px-3 py-2 text-sm text-white h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none"
                      placeholder="999999999"
                    />
                  </div>
                  {form.formState.errors.countryCode && (
                    <p className="text-sm text-red-400">{form.formState.errors.countryCode.message}</p>
                  )}
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-400">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-purple-400" />
                    Senha
                  </label>
                  <div className="relative group">
                    <input
                      {...form.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="flex w-full border px-3 py-2 text-sm text-white pr-12 h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500 placeholder:text-gray-400 focus-visible:outline-none"
                      placeholder="Sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-purple-400" />
                    Confirmar Senha
                  </label>
                  <div className="relative group">
                    <input
                      {...form.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="flex w-full border px-3 py-2 text-sm text-white pr-12 h-12 bg-gray-800/70 border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-200 group-hover:border-gray-500 placeholder:text-gray-400 focus-visible:outline-none"
                      placeholder="Confirme sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-400">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm w-full h-12 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                    <Sparkles className="h-4 w-4" />
                  </span>
                </button>
              </form>

              {/* Terms */}
              <div className="text-center pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-400">
                  Ao continuar, você concorda com nossos{' '}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Termos de Uso</span> e{' '}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Política de Privacidade</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}