import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">{t('Make Deposit')}</DialogTitle>
          <p className="text-gray-400 text-xs sm:text-sm text-center">{t('Add balance to your account')}</p>
        </DialogHeader>
        
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'pix' ? 'default' : 'secondary'}
              className={`flex-1 h-10 sm:h-12 text-sm touch-manipulation ${activeTab === 'pix' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('pix')}
            >
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              PIX
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 h-10 sm:h-12 text-sm touch-manipulation ${activeTab === 'history' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'pix' && (
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-1">{t('Deposit via PIX')}</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">{t('Fast, secure and available 24h')}</p>
              
              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-green-400 mb-2 flex items-center">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {quickAmounts.slice(0, 6).map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/50 h-8 sm:h-10 text-xs sm:text-sm touch-manipulation"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <Label className="text-xs sm:text-sm text-gray-400 mb-2 block">{t('Deposit amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-10 sm:h-12 text-base sm:text-lg touch-manipulation"
                />
              </div>

              {/* Generate PIX Button */}
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 sm:h-12 text-sm sm:text-base touch-manipulation">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('Generate PIX QR Code')}
              </Button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-8">
              <p className="text-gray-400">{t('History')}</p>
              <p className="text-sm text-gray-500 mt-2">No deposits found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
