import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, updateAccountMode, updateFullName } = useAppContext();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedMode, setSelectedMode] = useState(user?.accountMode || 'national');

  const handleSave = () => {
    if (user) {
      updateFullName(fullName);
      updateAccountMode(selectedMode as 'national' | 'international');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="relative z-50 w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
        <div className="p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left relative p-0">
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 absolute right-0 top-0 text-gray-400 hover:text-white hover:bg-gray-800/50 z-10"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4" aria-hidden="true">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          
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
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 cursor-not-allowed" 
                    disabled 
                    placeholder="Nome Completo" 
                    name="name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin w-4 h-4" aria-hidden="true">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Modo de conta
                  </label>
                  <div className="relative w-full">
                    <button 
                      className="inline-flex items-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:text-white h-10 px-4 py-2 w-full justify-between text-left font-normal bg-gray-800/50 border-gray-700 text-white hover:bg-gray-800/70 cursor-not-allowed opacity-50" 
                      type="button" 
                      disabled
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇧🇷</span>
                        <div className="flex flex-col items-start">
                          <span className="text-white">Nacional</span>
                          <span className="text-xs text-gray-400">Brasil</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 text-gray-400 transition-transform duration-200" aria-hidden="true">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
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
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 px-4 py-2 w-full bg-purple-600 hover:bg-purple-700 text-white" 
                    type="button"
                    onClick={handleSave}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Editar Perfil
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
      </div>
    </Dialog>
  );
}
