import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, History, DollarSign } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'withdrawal' | 'history'>('withdrawal');
  const [amount, setAmount] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');

  const quickAmounts = [50, 100, 200, 500, 1000];

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

  const formatBalance = (balance: number) => {
    return `R$ ${(balance / 100).toFixed(2).replace('.', ',')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-full max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{t('Request Withdrawal')}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-gray-400 text-sm mb-4">{t('Withdraw your winnings via PIX')}</p>
          
          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'withdrawal' ? 'default' : 'secondary'}
              className={`flex-1 ${activeTab === 'withdrawal' ? 'thunder-button-secondary' : 'bg-gray-700 text-gray-400'}`}
              onClick={() => setActiveTab('withdrawal')}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              {t('Request Withdrawal')}
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 ${activeTab === 'history' ? 'thunder-button-secondary' : 'bg-gray-700 text-gray-400'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-2" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'withdrawal' && (
            <div>
              <h3 className="font-bold mb-2">{t('Request Withdrawal')}</h3>
              <p className="text-xs text-gray-400 mb-3">{t('Withdraw your winnings via PIX')}</p>
              
              {/* Available Balance */}
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{t('Available balance:')}</span>
                  <span className="text-green-400 font-bold">
                    {formatBalance(user?.balance || 0)}
                  </span>
                </div>
              </div>
              
              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-sm text-green-400 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <Label className="text-sm text-gray-400 mb-2">{t('Withdrawal amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* PIX Key Type */}
              <div className="mb-4">
                <Label className="text-sm text-gray-400 mb-2">{t('PIX key type')}</Label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">{t('Phone')}</SelectItem>
                    <SelectItem value="random">{t('Random Key')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-8">
              <p className="text-gray-400">{t('History')}</p>
              <p className="text-sm text-gray-500 mt-2">No withdrawals found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
