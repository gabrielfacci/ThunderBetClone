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
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-full max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{t('Make Deposit')}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-gray-400 text-sm mb-4">{t('Add balance to your account')}</p>
          
          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'pix' ? 'default' : 'secondary'}
              className={`flex-1 ${activeTab === 'pix' ? 'thunder-button-primary' : 'bg-gray-700 text-gray-400'}`}
              onClick={() => setActiveTab('pix')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              PIX
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 ${activeTab === 'history' ? 'thunder-button-primary' : 'bg-gray-700 text-gray-400'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-2" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'pix' && (
            <div>
              <h3 className="font-bold mb-2">{t('Deposit via PIX')}</h3>
              <p className="text-xs text-gray-400 mb-3">{t('Fast, secure and available 24h')}</p>
              
              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-sm text-green-400 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <Label className="text-sm text-gray-400 mb-2">{t('Deposit amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Generate PIX Button */}
              <Button className="w-full thunder-button-primary">
                <QrCode className="w-4 h-4 mr-2" />
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
