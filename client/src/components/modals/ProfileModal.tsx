import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Globe, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';
// Remove this import since AccountMode is not exported

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, updateAccountMode, updateFullName } = useAppContext();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedMode, setSelectedMode] = useState<'national' | 'international'>(user?.accountMode || 'national');

  const handleSave = () => {
    if (fullName !== user?.fullName) {
      updateFullName(fullName);
    }
    if (selectedMode !== user?.accountMode) {
      updateAccountMode(selectedMode);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md w-full mx-4 bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>Gerencie suas informações pessoais</DialogDescription>
        </DialogHeader>
        
        <div className="p-6 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-xl rounded-lg relative">
          {/* Close Button */}
          <button 
            className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md p-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
          
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
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500" 
                    placeholder="Nome Completo" 
                    name="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Modo de conta
                  </label>
                  
                  <div className="space-y-2">
                    {/* International Option */}
                    <div 
                      className={`rounded-lg p-3 cursor-pointer border-2 transition-colors ${
                        selectedMode === 'international' 
                          ? 'border-purple-500 bg-gray-700/50' 
                          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedMode('international')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Globe className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm">Internacional</h4>
                            <p className="text-xs text-gray-400">Outros países</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedMode === 'international' 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-gray-400'
                        }`}>
                          {selectedMode === 'international' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* National Option */}
                    <div 
                      className={`rounded-lg p-3 cursor-pointer border-2 transition-colors ${
                        selectedMode === 'national' 
                          ? 'border-purple-500 bg-gray-700/50' 
                          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedMode('national')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">BR</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm">Nacional</h4>
                            <p className="text-xs text-gray-400">Brasil</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedMode === 'national' 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-gray-400'
                        }`}>
                          {selectedMode === 'national' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Sua conta vai estar como:</p>
                    <p className="text-sm text-white font-medium">
                      {selectedMode === 'national' ? 'Nacional' : 'Internacional'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 px-4 py-2 w-full text-white" 
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
      </DialogContent>
    </Dialog>
  );
}