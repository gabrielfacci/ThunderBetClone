import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, History, QrCode, DollarSign } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pix' | 'history'>('pix');
  const [amount, setAmount] = useState('');

  const quickAmounts = [35, 50, 100, 200, 500, 1000];

  const handleQuickAmount = (value: number) => {
    setAmount(`R$ ${value},00`);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers) / 100;
    return `R$ ${amount.toFixed(2).replace('.', ',')}`;
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatCurrency(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[92%] max-w-xs mx-auto rounded-2xl max-h-[85vh] overflow-y-auto p-0 sm:max-w-sm sm:w-[95%]">
        <DialogHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
          <DialogTitle className="text-base sm:text-lg font-bold text-center leading-tight">{t('Make Deposit')}</DialogTitle>
          <DialogDescription className="text-gray-400 text-[11px] sm:text-sm text-center leading-tight mt-1">
            {t('Add balance to your account')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          {/* Tabs */}
          <div className="flex space-x-1.5 mb-3">
            <Button
              variant={activeTab === 'pix' ? 'default' : 'secondary'}
              className={`flex-1 h-9 text-xs sm:h-10 sm:text-sm touch-manipulation ${activeTab === 'pix' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('pix')}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              PIX
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 h-9 text-xs sm:h-10 sm:text-sm touch-manipulation ${activeTab === 'history' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-3 h-3 mr-1" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'pix' && (
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-1 leading-tight">{t('Deposit via PIX')}</h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mb-2 leading-tight">{t('Fast, secure and available 24h')}</p>
              
              {/* Quick Amounts */}
              <div className="mb-3">
                <p className="text-[11px] sm:text-xs text-green-400 mb-2 flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {quickAmounts.slice(0, 6).map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/50 h-7 text-[11px] sm:h-8 sm:text-xs touch-manipulation px-2"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-3">
                <Label className="text-[11px] sm:text-xs text-gray-400 mb-1.5 block">{t('Deposit amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-9 text-sm sm:h-10 sm:text-base touch-manipulation"
                />
              </div>

              {/* Generate PIX Button */}
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-9 text-xs sm:h-10 sm:text-sm touch-manipulation">
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                {t('Generate PIX QR Code')}
              </Button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 font-medium">{t('History')}</p>
              <p className="text-xs text-gray-500 mt-2">No deposits found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
