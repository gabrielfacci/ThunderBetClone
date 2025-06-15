import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Phone, Globe, X, Save, MapPin, ChevronDown, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { profileService, type UserProfile } from '@/lib/supabaseProfile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { t, setLanguage } = useLanguage();
  const { toast } = useToast();
  
  // Real data state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [accountMode, setAccountMode] = useState<'nacional' | 'internacional'>('nacional');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  
  // Original values for cancel functionality
  const [originalFullName, setOriginalFullName] = useState('');
  const [originalAccountMode, setOriginalAccountMode] = useState<'nacional' | 'internacional'>('nacional');

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile();
    }
  }, [isOpen, user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setIsLoadingProfile(true);
    console.log('Carregando perfil do usuário:', user.id);
    try {
      const userProfile = await profileService.getOrCreateUserProfile(user.id, user);
      console.log('Perfil carregado:', userProfile);
      setProfile(userProfile);
      setFullName(userProfile.full_name);
      setAccountMode(userProfile.account_mode);
      setOriginalFullName(userProfile.full_name);
      setOriginalAccountMode(userProfile.account_mode);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleEdit = () => {
    console.log('Ativando modo de edição');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFullName(originalFullName);
    setAccountMode(originalAccountMode);
    setIsEditing(false);
    setShowModeDropdown(false);
  };

  const handleSave = async () => {
    if (!user || !profile || !fullName.trim()) return;
    
    setIsSaving(true);
    try {
      const updates = {
        full_name: fullName.trim(),
        account_mode: accountMode,
      };

      const updatedProfile = await profileService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      setOriginalFullName(updatedProfile.full_name);
      setOriginalAccountMode(updatedProfile.account_mode);
      setIsEditing(false);
      
      // Check if language changed and handle appropriately
      const languageChanged = originalAccountMode !== accountMode;
      if (languageChanged) {
        // Update language immediately without delays
        const newLanguage = accountMode === 'internacional' ? 'en' : 'pt';
        setLanguage(newLanguage);
        
        // Show success notification immediately in the new language
        toast({
          title: accountMode === 'internacional' ? 'Profile Updated' : 'Perfil Atualizado',
          description: accountMode === 'internacional' 
            ? 'Language changed to English successfully' 
            : 'Idioma alterado para Português com sucesso',
        });
      } else {
        toast({
          title: t('message.profileUpdated'),
          description: t('message.profileUpdatedDesc'),
        });
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('message.error'),
        description: t('message.errorLoadingProfile'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeSelect = (mode: 'nacional' | 'internacional') => {
    setAccountMode(mode);
    setShowModeDropdown(false);
  };

  // Don't render if user is not authenticated
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-sm w-[95%] mx-auto bg-transparent border-0 shadow-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[85vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('profile.title')}</DialogTitle>
          <DialogDescription>{t('profile.subtitle')}</DialogDescription>
        </DialogHeader>
        
        <div className="p-4 h-full overflow-y-auto bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-xl rounded-lg relative">
          
          {/* Loading State */}
          {isLoadingProfile ? (
            <div className="py-2">
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Meu Perfil</h2>
                  <p className="text-sm text-gray-400">Carregando dados...</p>
                </div>
                <div className="space-y-3">
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                  </div>
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Profile Content */
            (<div className="py-2">
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('profile.title')}</h2>
                  <p className="text-sm text-gray-400">{t('profile.subtitle')}</p>
                </div>
                
                <form className="space-y-3">
                  {/* Phone Field - Non-editable */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {t('profile.phone')}
                    </label>
                    <div className="relative">
                      <input 
                        className="flex h-8 w-full rounded-md border px-2 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed" 
                        disabled 
                        value={user?.user_metadata?.phone || user?.email || 'Não informado'}
                        readOnly
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs text-gray-500 bg-gray-700 px-1 py-0.5 rounded text-xs">{t('profile.phone.notEditable')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Full Name Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {t('profile.fullName')}
                    </label>
                    <input 
                      className={`flex h-8 w-full rounded-md border px-2 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                        isEditing 
                          ? 'bg-gray-800/50 text-white placeholder-gray-500 border-purple-500/50 focus:border-purple-400' 
                          : 'bg-gray-800/30 text-gray-300 border-gray-700 cursor-not-allowed'
                      }`}
                      placeholder={t('profile.fullName')} 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {/* Account Mode Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t('profile.accountMode')}
                    </label>
                    <div className="relative w-full">
                      <button 
                        className={`inline-flex items-center whitespace-nowrap rounded-md text-xs ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border h-8 px-2 py-1 w-full justify-between text-left font-normal ${
                          isEditing 
                            ? 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-800/70 hover:text-white' 
                            : 'bg-gray-800/30 border-gray-700 text-gray-300 cursor-not-allowed'
                        }`}
                        type="button"
                        onClick={() => isEditing && setShowModeDropdown(!showModeDropdown)}
                        disabled={!isEditing}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{accountMode === 'nacional' ? '🇧🇷' : '🌍'}</span>
                          <div className="flex flex-col items-start">
                            <span className={isEditing ? 'text-white' : 'text-gray-300'}>
                              {accountMode === 'nacional' ? t('profile.accountMode.nacional') : t('profile.accountMode.internacional')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {accountMode === 'nacional' ? t('profile.accountMode.brasil') : t('profile.accountMode.global')}
                            </span>
                          </div>
                        </div>
                        {isEditing && (
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showModeDropdown ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      
                      {/* Dropdown */}
                      {isEditing && showModeDropdown && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-2"
                            onClick={() => handleModeSelect('nacional')}
                          >
                            <span className="text-lg">🇧🇷</span>
                            <div className="flex flex-col">
                              <span className="text-white">{t('profile.accountMode.nacional')}</span>
                              <span className="text-xs text-gray-400">{t('profile.accountMode.brasil')}</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-2"
                            onClick={() => handleModeSelect('internacional')}
                          >
                            <span className="text-lg">🌍</span>
                            <div className="flex flex-col">
                              <span className="text-white">{t('profile.accountMode.internacional')}</span>
                              <span className="text-xs text-gray-400">{t('profile.accountMode.global')}</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 pl-[18px] pr-[18px] pt-[0px] pb-[0px] mt-[12px] mb-[12px]">
                      <p className="text-sm text-gray-400 mb-2">{t('profile.accountMode.description')}</p>
                      <p className="text-base text-white font-medium">
                        {accountMode === 'nacional' ? t('profile.accountMode.nacional') : t('profile.accountMode.internacional')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    {!isEditing ? (
                      <>
                        <Button 
                          variant="outline"
                          className="flex-1 h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" 
                          onClick={onClose}
                        >
                          {t('profile.close')}
                        </Button>
                        <Button 
                          className="flex-1 h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Botão editar clicado, isEditing atual:', isEditing);
                            handleEdit();
                            console.log('Após handleEdit, isEditing deveria ser true');
                          }}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          {t('profile.edit')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline"
                          className="flex-1 h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" 
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          {t('profile.cancel')}
                        </Button>
                        <Button 
                          className="flex-1 h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                          onClick={handleSave}
                          disabled={isSaving || !fullName.trim()}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {isSaving ? t('profile.saving') : t('profile.save')}
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>)
          )}
          
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