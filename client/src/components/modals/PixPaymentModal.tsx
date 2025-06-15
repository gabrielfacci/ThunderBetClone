import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, QrCode, Clock, X, AlertCircle } from 'lucide-react';
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

      setPixData({
        qrcode: response.pix.qrcode,
        url: response.pix.url,
        expirationDate: response.pix.expirationDate,
        transactionId: response.id.toString(),
        amount: response.amount / 100 // Convert back to reais
      });

      // Start checking payment status every 5 seconds
      const interval = setInterval(async () => {
        try {
          const status = await zyonPayService.checkTransactionStatus(response.id.toString());
          setPaymentStatus(status.status);
          
          if (status.status === 'paid') {
            clearInterval(interval);
            setPaymentStatus('paid');
            toast({
              title: "Pagamento aprovado!",
              description: `Depósito de R$ ${amount.toFixed(2).replace('.', ',')} confirmado`,
            });
            onPaymentSuccess?.();
            setTimeout(() => onClose(), 2000);
          } else if (status.status === 'expired' || status.status === 'canceled') {
            clearInterval(interval);
            setPaymentStatus('expired');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000);

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
      <DialogContent className="bg-gray-900/98 backdrop-blur-md border-gray-700/50 text-white w-[95%] max-w-sm mx-auto rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-yellow-500" />
            PIX - R$ {amount.toFixed(2).replace('.', ',')}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm text-center">
            Escaneie o QR Code ou copie o código PIX
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4">
          {/* Status */}
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${statusInfo.bgColor} mb-4`}>
            <span className={statusInfo.color}>{statusInfo.icon}</span>
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Gerando PIX...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                onClick={generatePixPayment}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {pixData && !isLoading && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img
                    src={zyonPayService.generateQRCodeImageUrl(pixData.qrcode)}
                    alt="QR Code PIX"
                    className="w-64 h-64 mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Abra o app do seu banco e escaneie o código
                </p>
              </div>

              {/* PIX Code */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Código PIX (Copia e Cola)
                </label>
                <div className="relative">
                  <textarea
                    value={pixData.url}
                    readOnly
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg p-3 text-sm text-white resize-none h-20"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={copyPixCode}
                    className={`absolute top-2 right-2 h-8 px-3 text-xs ${
                      isCopied 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Expiration Info */}
              <div className="text-center text-sm text-gray-400">
                <p>Válido até: {new Date(pixData.expirationDate).toLocaleString('pt-BR')}</p>
                <p className="mt-1">O pagamento será confirmado automaticamente</p>
              </div>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}