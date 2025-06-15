import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, History, QrCode, DollarSign, Copy, Check, AlertCircle, RotateCcw, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { zyonPayService } from '@/lib/zyonPayService';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { t } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pix' | 'history'>('pix');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pixData, setPixData] = useState<any>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);

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

    await generatePixPayment();
  };

  const generatePixPayment = async () => {
    if (!user || !amount) return;

    setIsGeneratingPix(true);
    setPixError(null);
    setPixData(null);

    try {
      const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));

      const result = await zyonPayService.createPixTransaction(
        numericAmount,
        user.email || '',
        user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        user.user_metadata?.phone
      );

      setPixData(result);
      setShowPixPayment(true);
    } catch (error) {
      console.error('Error generating PIX:', error);
      setPixError('Erro ao gerar PIX. Tente novamente.');
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixData?.url) return;

    try {
      await navigator.clipboard.writeText(pixData.url);
      setIsCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código PIX foi copiado para a área de transferência",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código",
        variant: "destructive",
      });
    }
  };

  const resetPixPayment = () => {
    setPixData(null);
    setPixError(null);
    setShowPixPayment(false);
    setIsCopied(false);
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
              {!showPixPayment ? (
                <>
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
                    disabled={!amount || isGeneratingPix}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 text-sm sm:h-12 sm:text-base touch-manipulation disabled:opacity-50"
                  >
                    {isGeneratingPix ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Gerando PIX...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        {t('Generate PIX QR Code')}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                // PIX Payment Display
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Button
                        onClick={resetPixPayment}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <h3 className="text-lg font-bold flex-1">Pagamento PIX</h3>
                    </div>
                    <p className="text-sm text-gray-400">Valor: {amount}</p>
                  </div>

                  {pixError ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 text-sm">{pixError}</p>
                      <Button
                        onClick={generatePixPayment}
                        className="mt-3 bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : pixData ? (
                    <div className="space-y-4">
                      {/* QR Code */}
                      <div className="relative w-full max-w-[280px] mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                        <div className="bg-white rounded-xl p-4 shadow-inner">
                          <img 
                            src={pixData.qrCode} 
                            alt="QR Code PIX" 
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </div>

                      {/* PIX Code */}
                      <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">Código PIX:</span>
                          <Button
                            onClick={copyPixCode}
                            variant="ghost"
                            size="sm"
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                          >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/30">
                          <p className="text-xs text-gray-300 font-mono break-all leading-relaxed">
                            {pixData.url}
                          </p>
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-700/30">
                        <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Como pagar:
                        </h4>
                        <ol className="text-sm text-gray-300 space-y-1">
                          <li>1. Abra o app do seu banco</li>
                          <li>2. Escaneie o QR Code ou cole o código PIX</li>
                          <li>3. Confirme o pagamento</li>
                          <li>4. Aguarde a confirmação automática</li>
                        </ol>
                      </div>

                      {/* Transaction Info */}
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>ID da Transação: {pixData.transactionId}</p>
                          <p>Status: Aguardando pagamento</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
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