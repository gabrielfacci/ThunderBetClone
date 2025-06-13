import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-full max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold">{t('My Profile')}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-gray-400 text-sm mb-4">{t('Manage your personal information')}</p>
          
          {/* Phone Number */}
          <div className="mb-4">
            <Label className="text-sm text-gray-400 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {t('Phone')}
            </Label>
            <div className="relative">
              <Input
                value={user?.phone || '(00) 00000-0000'}
                readOnly
                className="bg-gray-800 text-gray-400 border-gray-700 pr-20"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {t('Non-editable')}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <Label className="text-sm text-gray-400 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              {t('Full Name')}
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Account Mode */}
          <div className="mb-6">
            <Label className="text-sm text-gray-400 mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              {t('Account mode')}
            </Label>
            
            <div className="space-y-2">
              {/* International Option */}
              <div 
                className={`thunder-card rounded-lg p-3 cursor-pointer border-2 transition-colors ${
                  selectedMode === 'international' 
                    ? 'border-green-500 bg-gray-700' 
                    : 'border-transparent bg-gray-800'
                }`}
                onClick={() => setSelectedMode('international')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Globe className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{t('International')}</h4>
                      <p className="text-xs text-gray-400">{t('Other countries')}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMode === 'international' 
                      ? 'bg-green-500 border-green-500' 
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
                className={`thunder-card rounded-lg p-3 cursor-pointer border-2 transition-colors ${
                  selectedMode === 'national' 
                    ? 'border-green-500 bg-gray-700' 
                    : 'border-transparent bg-gray-800'
                }`}
                onClick={() => setSelectedMode('national')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">BR</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{t('National')}</h4>
                      <p className="text-xs text-gray-400">{t('Brazil')}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMode === 'national' 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400'
                  }`}>
                    {selectedMode === 'national' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
            onClick={handleSave}
          >
            {t('Save Changes')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
