import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, History, DollarSign } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { t } = useTranslation();
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'withdrawal' | 'history'>('withdrawal');
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

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
    return `R$ ${balance.toFixed(2).replace('.', ',')}`;
  };

  const handleWithdrawal = async () => {
    if (!user || !amount || !pixKey) return;
    
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (numericAmount < 20) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para saque é R$ 20,00",
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > user.balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não possui saldo suficiente para este saque",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/transactions/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: numericAmount,
          pixKey
        }),
      });

      if (response.ok) {
        const transaction = await response.json();
        await updateBalance(parseFloat(transaction.balanceAfter));
        
        toast({
          title: "Saque solicitado!",
          description: `Seu saque de R$ ${numericAmount.toFixed(2).replace('.', ',')} está sendo processado`,
        });
        
        setAmount('');
        setPixKey('');
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar saque');
      }
    } catch (error) {
      toast({
        title: "Erro no saque",
        description: error instanceof Error ? error.message : "Não foi possível processar o saque",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/${user.id}/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.filter((t: any) => t.type === 'withdrawal'));
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadTransactions();
    }
  }, [isOpen, activeTab, user]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">{t('Request Withdrawal')}</DialogTitle>
          <p className="text-gray-400 text-xs sm:text-sm text-center">{t('Withdraw your winnings via PIX')}</p>
        </DialogHeader>
        
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'withdrawal' ? 'default' : 'secondary'}
              className={`flex-1 h-12 ${activeTab === 'withdrawal' ? 'bg-red-600 text-white font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('withdrawal')}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              {t('Request Withdrawal')}
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 h-12 ${activeTab === 'history' ? 'bg-red-600 text-white font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-2" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'withdrawal' && (
            <div>
              <h3 className="text-lg font-bold mb-1">Solicitar Saque</h3>
              <p className="text-sm text-gray-400 mb-4">Retire seus ganhos via PIX</p>
              
              {/* Available Balance */}
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{t('Available balance:')}</span>
                  <span className="text-green-400 font-bold text-lg">
                    {formatBalance(user?.balance || 0)}
                  </span>
                </div>
              </div>
              
              {/* Quick Amounts */}
              <div className="mb-6">
                <p className="text-sm text-green-400 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/50 text-xs h-8"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <Label className="text-sm text-gray-400 mb-2 block">{t('Withdrawal amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-12 text-lg"
                />
              </div>

              {/* PIX Key Type */}
              <div className="mb-6">
                <Label className="text-sm text-gray-400 mb-2 block">{t('PIX key type')}</Label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white h-12">
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
