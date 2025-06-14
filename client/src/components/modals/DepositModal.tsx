import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, History, QrCode, DollarSign } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/MockAuthContext';
import { useToast } from '@/hooks/use-toast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pix' | 'history'>('pix');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

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

  const handleDeposit = async () => {
    if (!user || !amount) return;
    
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (numericAmount < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para depósito é R$ 10,00",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: numericAmount,
          pixKey: `usuario${user.id}@pix.com`
        }),
      });

      if (response.ok) {
        const transaction = await response.json();
        await refreshProfile();
        
        toast({
          title: "Depósito realizado!",
          description: `R$ ${numericAmount.toFixed(2).replace('.', ',')} foi adicionado ao seu saldo`,
        });
        
        setAmount('');
        onClose();
      } else {
        throw new Error('Erro ao processar depósito');
      }
    } catch (error) {
      toast({
        title: "Erro no depósito",
        description: "Não foi possível processar o depósito. Tente novamente.",
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
        setTransactions(data.filter((t: any) => t.type === 'deposit'));
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
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[85vh] overflow-y-auto p-0 sm:max-w-md ml-[0px] mr-[0px] pl-[12px] pr-[12px] pt-[30px] pb-[30px]">
        <DialogHeader className="p-4 pb-2 sm:p-4 sm:pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-center leading-tight">{t('Make Deposit')}</DialogTitle>
          <DialogDescription className="text-gray-400 text-sm sm:text-base text-center leading-tight mt-1">
            {t('Add balance to your account')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'pix' ? 'default' : 'secondary'}
              className={`flex-1 h-10 text-sm sm:h-12 sm:text-base touch-manipulation ${activeTab === 'pix' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('pix')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              PIX
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'secondary'}
              className={`flex-1 h-10 text-sm sm:h-12 sm:text-base touch-manipulation ${activeTab === 'history' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-2" />
              {t('History')}
            </Button>
          </div>

          {activeTab === 'pix' && (
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-2">{t('Deposit via PIX')}</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4">{t('Fast, secure and available 24h')}</p>
              
              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-sm sm:text-base text-green-400 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {quickAmounts.slice(0, 6).map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-white border-gray-600/50 h-9 text-sm sm:h-10 sm:text-base touch-manipulation"
                      onClick={() => handleQuickAmount(value)}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <Label className="text-sm sm:text-base text-gray-400 mb-2 block">{t('Deposit amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-10 text-base sm:h-12 sm:text-lg touch-manipulation"
                />
              </div>

              {/* Generate PIX Button */}
              <Button 
                onClick={handleDeposit}
                disabled={!amount || isProcessing}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 text-sm sm:h-12 sm:text-base touch-manipulation disabled:opacity-50"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processando...' : t('Generate PIX QR Code')}
              </Button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base text-gray-400 font-medium">{t('History')}</p>
                  <p className="text-sm text-gray-500 mt-2">Nenhum depósito encontrado</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">R$ {parseFloat(transaction.amount).toFixed(2).replace('.', ',')}</p>
                        <p className="text-gray-400 text-sm">{transaction.description}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(transaction.created_at || transaction.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
