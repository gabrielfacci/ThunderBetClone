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
  const [paymentStage, setPaymentStage] = useState<"waiting" | "processing" | "completed">("waiting");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

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

      // Poll for PIX code from webhook
      await pollForPixCode(result.id);
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

  const pollForPixCode = async (transactionId: number) => {
    const maxAttempts = 30; // 30 seconds of polling
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/zyonpay/transaction/${transactionId}`);
        if (response.ok) {
          const transaction = await response.json();
          if (transaction.pixCode) {
            // PIX code received, generate QR code and display
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transaction.pixCode)}`;
            setPixData({
              transactionId,
              qrCode: qrCodeUrl,
              url: transaction.pixCode
            });
            setShowPixPayment(true);
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // Poll every second
        } else {
          setPixError('Timeout: Não foi possível obter o código PIX. Tente novamente.');
        }
      } catch (error) {
        console.error('Error polling for PIX code:', error);
        setPixError('Erro ao buscar código PIX. Tente novamente.');
      }
    };

    poll();
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

  // Monitor payment status when PIX payment is shown
  useEffect(() => {
    if (!showPixPayment || !pixData?.transactionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/zyonpay/transaction/${pixData.transactionId}`);
        if (response.ok) {
          const transaction = await response.json();
          
          if (transaction.status === "processing") {
            setPaymentStage("processing");
          } else if (transaction.status === "completed") {
            setPaymentStage("completed");
            setPaymentCompleted(true);
            
            // Wait 3 seconds to show success message, then close and refresh
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [showPixPayment, pixData?.transactionId, onClose]);

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
                // PIX Payment Display - Compact style like the example
                <div className="space-y-4">
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
                      {/* QR Code with white background - compact */}
                      <div className="flex justify-center">
                        <div className="bg-white rounded-lg p-2 inline-block">
                          <img
                            src={pixData.qrCode}
                            alt="QR Code PIX"
                            className="w-40 h-40 block"
                            onError={(e) => {
                              console.error('QR Code failed to load');
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjZjNmNGY2Ii8+CiAgICA8dGV4dCB4PSI4MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2Nzg5ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG88L3RleHQ+Cjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      </div>

                      {/* Amount and Status */}
                      <div className="text-center">
                        <h3 className="text-white font-bold text-xl">
                          {amount}
                        </h3>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Clock className={`w-4 h-4 ${
                            paymentStage === "waiting" ? "text-yellow-400 animate-pulse" :
                            paymentStage === "processing" ? "text-blue-400 animate-pulse" :
                            "text-green-400"
                          }`} />
                          <span className={`text-sm ${
                            paymentStage === "waiting" ? "text-yellow-400 animate-pulse" :
                            paymentStage === "processing" ? "text-blue-400 animate-pulse" :
                            "text-green-400"
                          }`}>
                            {paymentStage === "waiting" ? "Aguardando..." :
                             paymentStage === "processing" ? "Processando..." :
                             "Concluído!"}
                          </span>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`flex items-center gap-1 ${
                            paymentStage === "waiting" ? "text-yellow-400" : "text-green-400"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              paymentStage === "waiting" ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                            }`}></div>
                            <span className="text-xs">Aguardando</span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            paymentStage === "processing" ? "text-blue-400" : 
                            paymentStage === "completed" ? "text-green-400" : "text-gray-500"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              paymentStage === "processing" ? "bg-blue-400 animate-pulse" :
                              paymentStage === "completed" ? "bg-green-400" : "bg-gray-500"
                            }`}></div>
                            <span className="text-xs">Processando</span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            paymentStage === "completed" ? "text-green-400" : "text-gray-500"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              paymentStage === "completed" ? "bg-green-400" : "bg-gray-500"
                            }`}></div>
                            <span className="text-xs">Concluído</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div className={`h-1 rounded-full transition-all duration-500 ${
                            paymentStage === "waiting" ? "w-1/3 bg-yellow-400" :
                            paymentStage === "processing" ? "w-2/3 bg-blue-400" :
                            "w-full bg-green-400"
                          }`}></div>
                        </div>
                      </div>

                      {/* PIX Code */}
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-300 text-xs mb-2 font-medium">Código PIX:</p>
                        <div className="bg-black/50 rounded p-2 mb-3 overflow-x-auto">
                          <code className="text-white text-xs font-mono whitespace-nowrap select-all block">
                            {pixData.url || ''}
                          </code>
                        </div>
                      </div>

                      {/* Copy Button */}
                      <Button
                        onClick={copyPixCode}
                        className={`w-full font-medium py-3 transition-all duration-300 ${
                          isCopied 
                            ? "bg-green-500 text-white" 
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Código Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Código PIX
                          </>
                        )}
                      </Button>

                      {/* Info */}
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-400 text-xs text-center">
                          PIX expira em 24h. Saldo creditado automaticamente.
                        </p>
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