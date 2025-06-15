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

      // Create transaction record in our database
      const dbTransactionResponse = await fetch('/api/zyonpay/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Use a fixed user ID for now since our storage expects numeric IDs
          amount: parseFloat(amount),
          zyonPayTransactionId: result.id,
          zyonPaySecureId: result.secureId,
          zyonPaySecureUrl: result.secureUrl,
          zyonPayPixQrCode: null,
          zyonPayPixUrl: null,
          zyonPayPixExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          zyonPayStatus: result.status
        })
      });

      if (!dbTransactionResponse.ok) {
        throw new Error('Failed to create transaction record');
      }

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
    const pixCode = pixData?.pixCode || pixData?.url;
    if (!pixCode) return;

    try {
      await navigator.clipboard.writeText(pixCode);
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
              url: transaction.pixCode,
              pixCode: transaction.pixCode
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
          
          // Map ZyonPay statuses to our payment stages
          if (transaction.status === "waiting_payment") {
            setPaymentStage("waiting");
          } else if (transaction.status === "paid") {
            setPaymentStage("completed");
            setPaymentCompleted(true);
            
            // Wait 2-3 seconds to show success message, then redirect to home
            setTimeout(() => {
              onClose();
              window.location.href = "/"; // Redirect to home page
            }, 2500);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 10000); // Check every 10 seconds as requested

    return () => clearInterval(interval);
  }, [showPixPayment, pixData?.transactionId, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-md mx-auto rounded-2xl h-[90vh] max-h-[600px] overflow-hidden p-0 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-gray-900/98 backdrop-blur-md border-b border-gray-700/30 z-10">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-xl font-bold text-center leading-tight">{t('Make Deposit')}</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm text-center leading-tight mt-1">
              {t('Add balance to your account')}
            </DialogDescription>
          </DialogHeader>
          
          {/* Fixed Tabs */}
          <div className="px-4 pb-3">
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'pix' ? 'default' : 'secondary'}
                className={`flex-1 h-12 text-base touch-manipulation ${activeTab === 'pix' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
                onClick={() => setActiveTab('pix')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                PIX
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'secondary'}
                className={`flex-1 h-12 text-base touch-manipulation ${activeTab === 'history' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'}`}
                onClick={() => setActiveTab('history')}
              >
                <History className="w-4 h-4 mr-2" />
                {t('History')}
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="py-2"></div>

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
                // PIX Payment Display - Exact design from example
                <div className="space-y-6">
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
                    <div className="space-y-6">
                      {/* Header Section */}
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <QrCode className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">QR Code PIX Gerado</h3>
                        <p className="text-gray-300 mb-4">
                          Valor: <span className="text-green-400 font-semibold">{amount}</span>
                        </p>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-2xl shadow-lg">
                          <img
                            src={pixData.qrCode}
                            alt="QR Code PIX"
                            className="w-32 h-32 rounded-lg"
                            onError={(e) => {
                              console.error('QR Code failed to load');
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjZjNmNGY2Ii8+CiAgICA8dGV4dCB4PSI2NCIgeT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2Nzg5ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG88L3RleHQ+Cjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      </div>

                      {/* PIX Code Section */}
                      <div className="space-y-3">
                        <Label className="block text-sm font-medium text-gray-300">Código PIX (Copia e Cola)</Label>
                        <div className="flex space-x-3">
                          <Input
                            readOnly
                            value={pixData.pixCode || pixData.url || ''}
                            className="flex-1 bg-gray-800/50 border-gray-600 text-white text-xs font-mono"
                          />
                          <Button
                            onClick={copyPixCode}
                            className={`bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 transition-all duration-300 ${
                              isCopied ? "bg-green-500 text-white" : ""
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Payment Status Tracker */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-300 font-medium text-sm">Status do Pagamento</span>
                          <div className={`flex items-center space-x-2 ${
                            paymentStage === "waiting" ? "text-yellow-400" : "text-green-400"
                          }`}>
                            {paymentStage === "waiting" ? (
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            ) : (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                            <span className="text-xs font-medium">
                              {paymentStage === "waiting" ? "Verificando..." : "Confirmado"}
                            </span>
                          </div>
                        </div>

                        {/* Status Steps */}
                        <div className="space-y-3">
                          {/* Step 1: Aguardando pagamento */}
                          <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                            paymentStage === "waiting" 
                              ? "bg-yellow-500/10 border border-yellow-500/30" 
                              : "bg-green-500/10 border border-green-500/30"
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              paymentStage === "waiting" 
                                ? "bg-yellow-400 animate-pulse" 
                                : "bg-green-400"
                            }`}>
                              {paymentStage === "waiting" ? (
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                              ) : (
                                <Check className="w-3 h-3 text-gray-900" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                paymentStage === "waiting" ? "text-yellow-400" : "text-green-400"
                              }`}>
                                {paymentStage === "waiting" ? "Aguardando pagamento" : "Pagamento detectado"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {paymentStage === "waiting" 
                                  ? "Realize o pagamento via PIX para continuar" 
                                  : "Transação confirmada com sucesso"
                                }
                              </p>
                            </div>
                          </div>

                          {/* Step 2: Pagamento concluído */}
                          {paymentStage === "completed" && (
                            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-gray-900" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-green-400">Pagamento concluído</p>
                                  <p className="text-xs text-gray-400">Redirecionando em alguns segundos...</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info text */}
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500">
                            {paymentStage === "waiting" 
                              ? "Verificamos automaticamente o status do seu pagamento a cada 10 segundos"
                              : "Saldo creditado em sua conta com sucesso!"
                            }
                          </p>
                        </div>
                      </div>

                      {/* Instructions Section */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone w-4 h-4 mr-2 text-blue-400" aria-hidden="true">
                            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
                            <path d="M12 18h.01"></path>
                          </svg>
                          Instruções:
                        </h4>
                        <ul className="text-sm text-gray-300 space-y-2">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            Abra o app do seu banco
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            Escaneie o QR Code ou cole o código PIX
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            Confirme o pagamento
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            O saldo será creditado automaticamente
                          </li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => {
                            setShowPixPayment(false);
                            setPixData(null);
                            setAmount('');
                          }}
                        >
                          Gerar Novo QR Code
                        </Button>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          onClick={onClose}
                        >
                          Concluído
                        </Button>
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