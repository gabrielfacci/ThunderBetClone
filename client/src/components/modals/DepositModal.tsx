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
      <DialogContent className="bg-gray-900/95 backdrop-blur-sm border-gray-700/50 text-white w-full max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('Make Deposit')}</DialogTitle>
          <p className="text-gray-400 text-sm">{t('Add balance to your account')}</p>
        </DialogHeader>
        
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === 'pix' ? 'default' : 'secondary'}
              className={`flex-1 h-12 ${activeTab === 'pix' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('pix')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              PIX
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 h-12 ${activeTab === 'history' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-2" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'pix' && (
            <div>
              <h3 className="text-lg font-bold mb-1">{t('Deposit via PIX')}</h3>
              <p className="text-sm text-gray-400 mb-4">{t('Fast, secure and available 24h')}</p>
              
              {/* Quick Amounts */}
              <div className="mb-6">
                <p className="text-sm text-green-400 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {quickAmounts.slice(0, 5).map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/50 h-10"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/50 h-10"
                    onClick={() => handleQuickAmount(quickAmounts[5])}
                  >
                    R$ {quickAmounts[5]}
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <Label className="text-sm text-gray-400 mb-2 block">{t('Deposit amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-12 text-lg"
                />
              </div>

              {/* Generate PIX Button */}
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 text-base">
                <QrCode className="w-5 h-5 mr-2" />
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
