import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Globe, X, Save, MapPin, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/supabaseQueries';
import { useToast } from '@/hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedMode, setSelectedMode] = useState<'national' | 'international'>(user?.accountMode || 'national');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const updates: { full_name?: string; account_mode?: 'national' | 'international' } = {};
      
      if (fullName !== user.fullName) {
        updates.full_name = fullName;
      }
      
      if (selectedMode !== user.accountMode) {
        updates.account_mode = selectedMode;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.id, updates);
        await refreshUser();
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md w-full mx-4 bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>Gerencie suas informações pessoais</DialogDescription>
        </DialogHeader>
        
        <div className="p-6 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-xl rounded-lg relative">
          
          {/* Content */}
          <div className="pt-4 pb-2">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
                <p className="text-gray-400">Gerencie suas informações pessoais</p>
              </div>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </label>
                  <div className="relative">
                    <input 
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed" 
                      disabled 
                      value="(91) 00000-0000"
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Não editável</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </label>
                  <input 
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 bg-gray-800/50 text-white placeholder-gray-500 border-purple-500/50 focus:border-purple-400" 
                    placeholder="Nome Completo" 
                    name="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Modo de conta
                  </label>
                  <div className="relative w-full">
                    <button 
                      className="inline-flex items-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:text-white h-10 px-4 py-2 w-full justify-between text-left font-normal bg-gray-800/50 border-gray-700 text-white hover:bg-gray-800/70" 
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇧🇷</span>
                        <div className="flex flex-col items-start">
                          <span className="text-white">Nacional</span>
                          <span className="text-xs text-gray-400">Brasil</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="inline-flex items-center justify-center h-5 w-5 hover:bg-gray-700 text-gray-400 hover:text-white rounded-md cursor-pointer">
                          <X className="h-3 w-3" />
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
                      </div>
                    </button>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Sua conta vai estar como:</p>
                    <p className="text-sm text-white font-medium">Nacional</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:text-white h-10 px-4 py-2 flex-1 border-gray-600 text-gray-300 hover:bg-gray-800" 
                    type="button"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 px-4 py-2 flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50" 
                    type="submit"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5 rounded-lg"></div>
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}