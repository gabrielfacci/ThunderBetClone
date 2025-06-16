import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, History, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { t } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'withdrawal' | 'history'>('withdrawal');
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    if (!user || !amount || !pixKey || !profile) return;
    
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    
    // Minimum withdrawal check (R$ 50)
    if (numericAmount < 50) {
      toast({
        title: t("Minimum amount"),
        description: "Minimum withdrawal amount is R$ 50.00",
        variant: "destructive",
      });
      return;
    }

    // Check sufficient balance
    if (numericAmount > profile.balance) {
      toast({
        title: t("Insufficient balance"),
        description: t("You do not have enough balance for this withdrawal"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount,
          pixKey,
          pixKeyType
        }),
      });

      if (response.ok) {
        const result = await response.json();
        await refreshProfile(); // Update balance immediately
        
        // Show success message
        setShowSuccessMessage(true);
        toast({
          title: "Withdrawal in Analysis",
          description: `R$ ${numericAmount.toFixed(2).replace('.', ',')} withdrawal is being processed`,
        });
        
        // Reset form
        setAmount('');
        setPixKey('');
        
        // Switch to history after 3 seconds
        setTimeout(() => {
          setActiveTab('history');
          loadWithdrawals();
          setShowSuccessMessage(false);
        }, 3000);
        
      } else {
        const error = await response.json();
        throw new Error(error.error || t('Could not process withdrawal'));
      }
    } catch (error) {
      toast({
        title: t("Withdrawal error"),
        description: error instanceof Error ? error.message : t("Could not process withdrawal"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadWithdrawals = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/${user.id}/withdrawals`);
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadWithdrawals();
    }
  }, [isOpen, activeTab, user]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-md mx-auto rounded-2xl h-[90vh] max-h-[600px] overflow-hidden p-0 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-gray-900/98 backdrop-blur-md border-b border-gray-700/30 z-10">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-xl font-bold text-center leading-tight">{t('Request Withdrawal')}</DialogTitle>
            <p className="text-gray-400 text-sm text-center leading-tight mt-1">
              {t('Withdraw your winnings via PIX')}
            </p>
          </DialogHeader>
          
          {/* Fixed Tabs */}
          <div className="px-3 sm:px-4 pb-3">
            <div className="flex space-x-1.5 sm:space-x-2">
              <Button
                variant={activeTab === 'withdrawal' ? 'default' : 'secondary'}
                className={`flex-1 h-10 sm:h-12 text-xs sm:text-base touch-manipulation ${activeTab === 'withdrawal' ? 'bg-red-600 text-white font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
                onClick={() => setActiveTab('withdrawal')}
              >
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {t('Request Withdrawal')}
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'secondary'}
                className={`flex-1 h-10 sm:h-12 text-xs sm:text-base touch-manipulation ${activeTab === 'history' ? 'bg-red-600 text-white font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
                onClick={() => setActiveTab('history')}
              >
                <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {t('History')}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6">

          {activeTab === 'withdrawal' && (
            <div>
              {/* Available Balance */}
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm sm:text-base">{t('Available balance:')}</span>
                  <span className="text-green-400 font-bold text-lg">
                    {formatBalance((profile as any)?.balance || 0)}
                  </span>
                </div>
              </div>
              
              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-sm sm:text-base text-green-400 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t('Quick amounts')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {quickAmounts.map((value) => (
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
              <div className="mb-3 sm:mb-4">
                <Label className="text-sm sm:text-base text-gray-400 mb-1.5 sm:mb-2 block">{t('Withdrawal amount')}</Label>
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="bg-gray-800/50 border-gray-600/50 text-white h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>

              {/* PIX Key Type */}
              <div className="mb-3 sm:mb-4">
                <Label className="text-sm sm:text-base text-gray-400 mb-1.5 sm:mb-2 block">{t('PIX key type')}</Label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white h-10 sm:h-11">
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

              {/* PIX Key Input */}
              <div className="mb-4 sm:mb-6">
                <Label className="text-sm sm:text-base text-gray-400 mb-1.5 sm:mb-2 block">{t('PIX key')}</Label>
                <Input
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder={t('Enter PIX key')}
                  className="bg-gray-800/50 border-gray-600/50 text-white h-10 sm:h-11"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleWithdrawal}
                disabled={isProcessing || !amount || !pixKey}
                className="w-full h-10 sm:h-11 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50 text-sm sm:text-base touch-manipulation"
              >
                {isProcessing ? t('modal.deposit.processing') : t('Request Withdrawal')}
              </Button>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {showSuccessMessage && (
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4 text-center">
                  <div className="text-green-400 font-bold mb-2">✅ Withdrawal in Analysis</div>
                  <p className="text-sm text-gray-300">Your withdrawal has been submitted and is being processed</p>
                </div>
              )}
              
              {withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">{t('History')}</p>
                  <p className="text-sm text-gray-500 mt-2">{t('No withdrawals found')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-base font-bold mb-3">{t('Withdrawal History')}</h3>
                  {withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">
                            {formatBalance(parseFloat(withdrawal.amount))}
                          </p>
                          <p className="text-xs text-gray-400">
                            PIX: {withdrawal.pix_key_type.toUpperCase()} - {withdrawal.pix_key}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            withdrawal.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                            withdrawal.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {withdrawal.status === 'pending' ? 'Pending' :
                             withdrawal.status === 'completed' ? 'Completed' : 'Rejected'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
