import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, History, QrCode, DollarSign, Copy, Check, AlertCircle, RotateCcw, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { zyonPayService } from '@/lib/zyonPayService';
import { formatDateTimeBrazil } from '@shared/timezone';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { t, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  

  const [activeTab, setActiveTab] = useState<'pix' | 'history'>('pix');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pixData, setPixData] = useState<{
    transactionId: number;
    qrCode: string;
    url: string;
    pixCode: string;
    isTemporary?: boolean;
  } | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [paymentStage, setPaymentStage] = useState<"waiting" | "processing" | "completed">("waiting");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const quickAmounts = [1, 5, 10, 50, 100, 500];

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
    if (numericAmount < 1) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para depósito é R$ 1,00",
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
    
    // Show PIX loading screen immediately
    setShowPixPayment(true);
    
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));

    try {
      // Use fast PIX endpoint for instant QR code generation
      const response = await fetch('/api/zyonpay/fast-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numericAmount,
          userEmail: user.email || '',
          userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          userPhone: user.user_metadata?.phone,
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PIX transaction');
      }

      const result = await response.json();

      // Display PIX code immediately
      if (result.pixCode && result.qrCodeUrl) {
        setPixData({
          transactionId: result.id,
          qrCode: result.qrCodeUrl,
          url: result.pixCode,
          pixCode: result.pixCode,
          isTemporary: false
        });
        setIsGeneratingPix(false);
        
        toast({
          title: language === 'en' ? "PIX Ready!" : "PIX Pronto!",
          description: language === 'en' ? "Your PIX code is ready for payment" : "Seu código PIX está pronto para pagamento",
          duration: 2000,
        });
      } else {
        // Fallback to polling if PIX code not immediately available
        pollForPixCode(result.id);
      }
    } catch (error) {
      console.error('Error generating PIX:', error);
      setPixError('Erro ao gerar PIX. Tente novamente.');
      setShowPixPayment(false);
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
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/zyonpay/transaction/${transactionId}`);
        if (response.ok) {
          const transaction = await response.json();
          if (transaction.pixCode) {
            // Display real PIX code from ZyonPay
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transaction.pixCode)}`;
            setPixData({
              transactionId: transactionId,
              qrCode: qrCodeUrl,
              url: transaction.pixCode,
              pixCode: transaction.pixCode,
              isTemporary: false
            });
            
            setIsGeneratingPix(false);
            
            toast({
              title: language === 'en' ? "PIX Ready!" : "PIX Pronto!",
              description: language === 'en' ? "Your PIX code is ready for payment" : "Seu código PIX está pronto para pagamento",
              duration: 2000,
            });
            
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 200); // Very fast polling - 200ms
        } else {
          setPixError('Tempo esgotado para gerar código PIX. Tente novamente.');
          setIsGeneratingPix(false);
        }
      } catch (error) {
        console.error('Error polling for PIX code:', error);
        setPixError('Erro ao obter código PIX. Tente novamente.');
        setIsGeneratingPix(false);
      }
    };

    // Start polling immediately
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
        setTransactions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadTransactions();
    }
  }, [activeTab]);

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
            
            // Calculate deposit amount from the original transaction
            const depositAmount = parseFloat(amount.replace(/[^\d]/g, '')) || 1;
            
            // Dispatch payment success event for balance animation
            window.dispatchEvent(new CustomEvent('paymentSuccess', {
              detail: { amount: depositAmount }
            }));
            
            // Show success message and refresh user profile
            toast({
              title: language === 'en' ? "Payment Successful!" : "Pagamento Aprovado!",
              description: language === 'en' ? "Your balance has been updated" : "Seu saldo foi atualizado",
              duration: 4000,
            });
            
            // Refresh user profile to get updated balance
            if (refreshProfile) {
              refreshProfile();
            }
            
            // Close modal smoothly after showing success
            setTimeout(() => {
              onClose();
              resetPixPayment();
            }, 2000);
            
            // Clear polling interval since payment is complete
            clearInterval(interval);
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
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
                        {language === 'en' ? 'Generating PIX...' : 'Gerando PIX...'}
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
                        {language === 'en' ? 'Try Again' : 'Tentar Novamente'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Loading State or PIX Content */}
                      {isGeneratingPix && !pixData ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {language === 'en' ? 'Generating PIX QR Code...' : 'Gerando QR Code PIX...'}
                          </h3>
                          <p className="text-gray-300 mb-4">
                            {language === 'en' ? 'Amount: ' : 'Valor: '}<span className="text-green-400 font-semibold">{amount}</span>
                          </p>
                          <p className="text-gray-400 text-sm">
                            {language === 'en' ? 'Please wait while we process your request...' : 'Aguarde enquanto processamos sua solicitação...'}
                          </p>
                        </div>
                      ) : pixData ? (
                        <>
                          {/* Header Section */}
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <QrCode className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {language === 'en' ? 'PIX QR Code Generated' : 'QR Code PIX Gerado'}
                            </h3>
                            <p className="text-gray-300 mb-4">
                              {language === 'en' ? 'Amount: ' : 'Valor: '}<span className="text-green-400 font-semibold">{amount}</span>
                            </p>
                          </div>

                      {/* QR Code */}
                      <div className="flex justify-center">
                        <div className="relative bg-white p-4 rounded-2xl shadow-lg">
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
                        <Label className="block text-sm font-medium text-gray-300">
                          {language === 'en' ? 'PIX Code (Copy and Paste)' : 'Código PIX (Copia e Cola)'}
                        </Label>
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
                                {language === 'en' ? 'Copied' : 'Copiado'}
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                {language === 'en' ? 'Copy' : 'Copiar'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Payment Status Tracker */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-300 font-medium text-sm">
                            {language === 'en' ? 'Payment Status' : 'Status do Pagamento'}
                          </span>
                          <div className={`flex items-center space-x-2 ${
                            paymentStage === "waiting" ? "text-yellow-400" : "text-green-400"
                          }`}>
                            {paymentStage === "waiting" ? (
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            ) : (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
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
                                {paymentStage === "waiting" 
                                  ? (language === 'en' ? "Waiting for payment" : "Aguardando pagamento")
                                  : (language === 'en' ? "Payment detected" : "Pagamento detectado")
                                }
                              </p>
                              <p className="text-xs text-gray-400">
                                {paymentStage === "waiting" 
                                  ? (language === 'en' ? "Make the PIX payment to continue" : "Realize o pagamento via PIX para continuar")
                                  : (language === 'en' ? "Transaction confirmed successfully" : "Transação confirmada com sucesso")
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
                                  <p className="text-sm font-medium text-green-400">
                                    {language === 'en' ? 'Payment completed' : 'Pagamento concluído'}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {language === 'en' ? 'Redirecting in a few seconds...' : 'Redirecionando em alguns segundos...'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info text */}
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500">
                            {paymentStage === "waiting" 
                              ? (language === 'en' ? "We automatically check your payment status every 10 seconds" : "Verificamos automaticamente o status do seu pagamento a cada 10 segundos")
                              : (language === 'en' ? "Balance credited to your account successfully!" : "Saldo creditado em sua conta com sucesso!")
                            }
                          </p>
                        </div>
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
                          {language === 'en' ? 'Generate New QR Code' : 'Gerar Novo QR Code'}
                        </Button>
                        <Button 
                          className="flex-1 bg-[#312152] hover:bg-[#3a2960] text-white"
                          onClick={onClose}
                        >
                          {language === 'en' ? 'Close' : 'Fechar'}
                        </Button>
                      </div>

                      {/* Instructions Section */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/30">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone w-4 h-4 mr-2 text-blue-400" aria-hidden="true">
                            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
                            <path d="M12 18h.01"></path>
                          </svg>
                          {language === 'en' ? 'Instructions:' : 'Instruções:'}
                        </h4>
                        <ul className="text-sm text-gray-300 space-y-2">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            {language === 'en' ? 'Open your bank app' : 'Abra o app do seu banco'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            {language === 'en' ? 'Scan the QR Code or paste the PIX code' : 'Escaneie o QR Code ou cole o código PIX'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            {language === 'en' ? 'Confirm the payment' : 'Confirme o pagamento'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                            {language === 'en' ? 'Balance will be credited automatically' : 'O saldo será creditado automaticamente'}
                          </li>
                        </ul>
                      </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history w-8 h-8 text-purple-400" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M12 7v5l4 2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {language === 'en' ? 'Deposit History' : 'Histórico de Depósitos'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'en' ? 'Track all your transactions' : 'Acompanhe todas as suas transações'}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-2 sm:p-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1 sm:mb-2" aria-hidden="true">
                    <path d="M16 7h6v6"></path>
                    <path d="m22 7-8.5 8.5-5-5L2 17"></path>
                  </svg>
                  <div className="text-lg sm:text-2xl font-bold text-white">{transactions.length}</div>
                  <div className="text-xs text-blue-300">{language === 'en' ? 'Total' : 'Total'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-2 sm:p-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big w-4 h-4 sm:w-6 sm:h-6 text-green-400 mx-auto mb-1 sm:mb-2" aria-hidden="true">
                    <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                    <path d="m9 11 3 3L22 4"></path>
                  </svg>
                  <div className="text-lg sm:text-2xl font-bold text-white">{transactions.filter(t => t.status === 'completed').length}</div>
                  <div className="text-xs text-green-300">{language === 'en' ? 'Completed' : 'Concluídos'}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-2 sm:p-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2" aria-hidden="true">
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <div className="text-sm sm:text-lg font-bold text-white">
                    R$ {transactions.reduce((total, t) => total + parseFloat(t.amount), 0).toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-xs text-yellow-300">{language === 'en' ? 'Total Value' : 'Valor Total'}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <button 
                  onClick={loadTransactions}
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:text-white h-9 rounded-md px-3 border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw w-4 h-4 mr-2" aria-hidden="true">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                  {language === 'en' ? 'Refresh' : 'Atualizar'}
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-funnel w-4 h-4" aria-hidden="true">
                    <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path>
                  </svg>
                  <span>{language === 'en' ? 'Page' : 'Página'} 1</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="bg-gray-800/30 rounded-xl p-6 sm:p-8 text-center border border-gray-700/30">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-inbox w-6 h-6 text-gray-400" aria-hidden="true">
                        <polyline points="22,12 16,12 14,15 10,15 8,12 2,12"></polyline>
                        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                      </svg>
                    </div>
                    <h4 className="text-white font-medium mb-2 text-sm sm:text-base">
                      {language === 'en' ? 'No transactions found' : 'Nenhuma transação encontrada'}
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {language === 'en' ? 'Your transactions will appear here after making deposits' : 'Suas transações aparecerão aqui após realizar depósitos'}
                    </p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-3 sm:p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card w-4 h-4 text-blue-400" aria-hidden="true">
                                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                <line x1="2" x2="22" y1="10" y2="10"></line>
                              </svg>
                            </div>
                            <span className="text-white font-medium text-base whitespace-nowrap">
                              R$ {parseFloat(transaction.amount).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                            transaction.status === 'completed' 
                              ? 'text-green-400 bg-green-400/10 border-green-400/30' 
                              : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                          }`} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`} style={{ flexShrink: 0 }}>
                              {transaction.status === 'completed' ? (
                                <path d="m9 12 2 2 4-4"></path>
                              ) : (
                                <>
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </>
                              )}
                            </svg>
                            <span style={{ marginLeft: '4px', flexShrink: 0 }}>
                              {transaction.status === 'completed' ? 
                                (language === 'en' ? 'Completed' : 'Concluído') : 
                                (language === 'en' ? 'Pending' : 'Pendente')
                              }
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-1 text-gray-400 min-w-0 flex-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-3 h-3 flex-shrink-0" aria-hidden="true">
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                              </svg>
                              <span className="text-xs truncate">
                                {formatDateTimeBrazil(transaction.created_at || transaction.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-400 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card w-3 h-3 text-blue-400" aria-hidden="true">
                                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                <line x1="2" x2="22" y1="10" y2="10"></line>
                              </svg>
                              <span className="text-xs whitespace-nowrap">PIX</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-mono text-right">
                            #{(transaction.zyonpay_transaction_id || transaction.id).toString().slice(-8)}...
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card w-4 h-4 text-blue-400" aria-hidden="true">
                              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                              <line x1="2" x2="22" y1="10" y2="10"></line>
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">
                                R$ {parseFloat(transaction.amount).toFixed(2).replace('.', ',')}
                              </span>
                              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                transaction.status === 'completed' 
                                  ? 'text-green-400 bg-green-400/10 border-green-400/30' 
                                  : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                              }`} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`} style={{ flexShrink: 0 }}>
                                  {transaction.status === 'completed' ? (
                                    <path d="m9 12 2 2 4-4"></path>
                                  ) : (
                                    <>
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <polyline points="12 6 12 12 16 14"></polyline>
                                    </>
                                  )}
                                </svg>
                                <span style={{ marginLeft: '4px', flexShrink: 0 }}>
                                  {transaction.status === 'completed' ? 
                                    (language === 'en' ? 'Completed' : 'Concluído') : 
                                    (language === 'en' ? 'Pending' : 'Pendente')
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                              <div className="flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-3 h-3" aria-hidden="true">
                                  <path d="M8 2v4"></path>
                                  <path d="M16 2v4"></path>
                                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                  <path d="M3 10h18"></path>
                                </svg>
                                <span>
                                  {new Date(transaction.created_at || transaction.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}, {new Date(transaction.created_at || transaction.createdAt).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card w-4 h-4 text-blue-400" aria-hidden="true">
                                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                  <line x1="2" x2="22" y1="10" y2="10"></line>
                                </svg>
                                <span>PIX</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 font-mono">
                            #{(transaction.zyonpay_transaction_id || transaction.id).toString().padStart(24, '684e')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:text-white h-9 rounded-md px-3 border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto" disabled>
                  {language === 'en' ? 'Previous' : 'Anterior'}
                </button>
                <div className="hidden sm:block text-sm text-gray-400 px-4">{language === 'en' ? 'Page' : 'Página'} 1</div>
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:text-white h-9 rounded-md px-3 border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto">
                  {language === 'en' ? 'Next' : 'Próxima'}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}