import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, QrCode, Clock, X, AlertCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { zyonPayService } from '@/lib/zyonPayService';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  userEmail: string;
  userName: string;
  userPhone?: string;
  onPaymentSuccess?: () => void;
}

interface PixData {
  qrcode: string;
  url: string;
  expirationDate: string;
  transactionId: string;
  amount: number;
}

export function PixPaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  userEmail, 
  userName, 
  userPhone,
  onPaymentSuccess 
}: PixPaymentModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'paid' | 'expired'>('pending');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Generate PIX when modal opens
  useEffect(() => {
    if (isOpen && !pixData && !isLoading) {
      generatePixPayment();
    }
  }, [isOpen]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const generatePixPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await zyonPayService.createPixTransaction(
        amount,
        userEmail,
        userName,
        userPhone
      );

      // Store transaction data in backend
      await fetch('/api/zyonpay/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // This should be the actual logged user ID
          amount: amount,
          zyonPayTransactionId: response.id,
          zyonPaySecureId: response.secureId,
          zyonPaySecureUrl: response.secureUrl,
          zyonPayPixQrCode: response.pix.qrcode,
          zyonPayPixUrl: response.pix.url,
          zyonPayPixExpiration: response.pix.expirationDate,
          zyonPayStatus: response.status
        }),
      });

      setPixData({
        qrcode: response.pix.qrcode,
        url: response.pix.url,
        expirationDate: response.pix.expirationDate,
        transactionId: response.id.toString(),
        amount: response.amount / 100 // Convert back to reais
      });

      // Start monitoring payment status every 10 seconds
      const interval = setInterval(async () => {
        try {
          // Check status via our backend API
          const statusResponse = await fetch(`/api/zyonpay/transaction/${response.id}`);
          if (statusResponse.ok) {
            const transaction = await statusResponse.json();
            setPaymentStatus(transaction.zyonPayStatus || 'pending');
            
            if (transaction.zyonPayStatus === 'paid') {
              clearInterval(interval);
              setPaymentStatus('paid');
              toast({
                title: "Pagamento aprovado!",
                description: `Depósito de R$ ${amount.toFixed(2).replace('.', ',')} confirmado`,
              });
              onPaymentSuccess?.();
              setTimeout(() => onClose(), 2000);
            } else if (transaction.zyonPayStatus === 'expired' || transaction.zyonPayStatus === 'canceled') {
              clearInterval(interval);
              setPaymentStatus('expired');
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 10000);

      setStatusCheckInterval(interval);

    } catch (error) {
      console.error('Error generating PIX:', error);
      setError('Não foi possível gerar o PIX. Tente novamente.');
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente selecionar manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    setPixData(null);
    setError(null);
    setPaymentStatus('pending');
    onClose();
  };

  const getStatusInfo = () => {
    switch (paymentStatus) {
      case 'pending':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          icon: <Clock className="w-4 h-4" />,
          text: 'Aguardando pagamento'
        };
      case 'processing':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          icon: <Clock className="w-4 h-4" />,
          text: 'Processando pagamento'
        };
      case 'paid':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: <Check className="w-4 h-4" />,
          text: 'Pagamento aprovado!'
        };
      case 'expired':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'PIX expirado'
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          icon: <Clock className="w-4 h-4" />,
          text: 'Aguardando pagamento'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col text-white p-0">
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Fazer Depósito</h2>
              <p className="text-gray-400 text-sm mt-1">Adicione saldo à sua conta via PIX</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Amount Display */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-3">
                  <QrCode className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">
                    PIX - R$ {amount.toFixed(2).replace('.', ',')}
                  </h3>
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  Escaneie o QR Code ou copie o código PIX
                </p>
              </div>
            </div>

            {/* Status */}
            <div className={`flex items-center justify-center gap-3 p-4 rounded-xl ${statusInfo.bgColor} border border-opacity-30`}>
              <span className={statusInfo.color}>{statusInfo.icon}</span>
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-lg font-medium">Gerando PIX...</p>
                <p className="text-gray-400 text-sm mt-2">Aguarde alguns segundos</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-red-300 mb-2">Erro ao gerar PIX</h4>
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                  <Button
                    onClick={generatePixPayment}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}

            {pixData && !isLoading && (
              <div className="space-y-6">
                {/* QR Code Section */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-4">QR Code PIX</h4>
                    <div className="bg-white p-6 rounded-xl inline-block shadow-lg">
                      <img
                        src={zyonPayService.generateQRCodeImageUrl(pixData.qrcode)}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm mt-4 leading-relaxed">
                      Abra o app do seu banco e escaneie o código acima
                    </p>
                  </div>
                </div>

                {/* PIX Code Section */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Código PIX (Copia e Cola)</h4>
                  <div className="relative">
                    <textarea
                      value={pixData.url}
                      readOnly
                      className="w-full bg-gray-900/70 border border-gray-600/50 rounded-lg p-4 text-sm text-gray-100 resize-none h-24 font-mono leading-relaxed focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      onClick={(e) => e.currentTarget.select()}
                      placeholder="Código PIX será exibido aqui..."
                    />
                    <Button
                      onClick={copyPixCode}
                      className={`absolute top-3 right-3 h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isCopied 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado!
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

                {/* Payment Info */}
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        Válido até: {new Date(pixData.expirationDate).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-yellow-200/80 text-xs mt-1">
                        O pagamento será confirmado automaticamente após a transferência
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-t border-gray-700/50 p-6">
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white font-medium py-3 rounded-lg transition-all duration-200"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}