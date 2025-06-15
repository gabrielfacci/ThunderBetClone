import { generateValidCPF } from './cpfGenerator';

const ZYONPAY_API_URL = 'https://api.zyonpay.com/v1/transactions';
const ZYONPAY_SECRET_KEY = 'sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG';

interface ZyonPayCustomer {
  name: string;
  email: string;
  phone: string;
  document: {
    number: string;
    type: 'cpf';
  };
  address: {
    street: string;
    streetNumber: string;
    zipCode: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
  };
}

interface ZyonPayTransaction {
  amount: number;
  paymentMethod: 'pix';
  customer: ZyonPayCustomer;
  items: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
    tangible: boolean;
  }>;
  pix: {
    expiresInDays: number;
  };
  splits: Array<{
    recipientId: number;
    amount: number;
  }>;
  postbackUrl?: string;
}

interface ZyonPayResponse {
  id: number;
  status: string;
  amount: number;
  paymentMethod: string;
  pix: {
    qrcode: string;
    url: string;
    expirationDate: string;
    createdAt: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    document: {
      number: string;
      type: string;
    };
  };
  secureId: string;
  secureUrl: string;
  createdAt: string;
  updatedAt: string;
}

export class ZyonPayService {
  private getAuthHeader(): string {
    // ZyonPay requires :x suffix after secret key
    const secretKey = 'sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG';
    const authString = `${secretKey}:x`;
    return 'Basic ' + btoa(authString);
  }

  private generatePhoneNumber(): string {
    // Generate a valid Brazilian phone number
    const areaCodes = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '91'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const number = '9' + Math.floor(Math.random() * 90000000 + 10000000).toString();
    return `${areaCode}${number}`;
  }

  async createPixTransaction(
    amount: number,
    userEmail: string,
    userName: string,
    userPhone?: string
  ): Promise<ZyonPayResponse> {
    // Convert amount from reais to centavos
    const amountInCentavos = Math.round(amount * 100);

    // Generate or use provided data
    const cpf = generateValidCPF();
    const phone = userPhone || this.generatePhoneNumber();

    const transactionData = {
      paymentMethod: 'pix',
      amount: amountInCentavos,
      splits: [
        {
          recipientId: 106198,
          amount: amountInCentavos
        }
      ],
      customer: {
        name: userName || 'Usuario ThunderBet',
        email: userEmail,
        document: {
          number: cpf,
          type: 'cpf'
        },
        phone: phone,
        address: {
          street: "Rua Fictícia",
          streetNumber: "123",
          zipCode: "40000000",
          neighborhood: "Centro",
          city: "Salvador",
          state: "BA",
          country: "BR"
        }
      },
      items: [
        {
          title: 'Crédito Appflix',
          unitPrice: amountInCentavos,
          quantity: 1,
          tangible: false
        }
      ]
    };

    console.log('Creating ZyonPay PIX transaction with data:', {
      amount: amountInCentavos,
      customer: transactionData.customer.name,
      email: transactionData.customer.email,
      recipientId: 106198
    });
    
    console.log('Auth header format:', this.getAuthHeader().substring(0, 20) + '...');
    console.log('Full transaction payload:', JSON.stringify(transactionData, null, 2));

    try {
      const response = await fetch(ZYONPAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('ZyonPay API Error:', response.status, errorData);
        throw new Error(`ZyonPay API Error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      console.log('ZyonPay transaction created successfully:', result.id);
      console.log('Full ZyonPay response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error creating PIX transaction:', error);
      throw error;
    }
  }

  private async storeTransactionInDatabase(zyonPayResponse: ZyonPayResponse, amount: number, userEmail: string): Promise<void> {
    try {
      // Get user ID from current session or user context
      const response = await fetch('/api/zyonpay/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // This should be dynamic based on logged user
          amount: amount,
          zyonPayTransactionId: zyonPayResponse.id,
          zyonPaySecureId: zyonPayResponse.secureId,
          zyonPaySecureUrl: zyonPayResponse.secureUrl,
          zyonPayPixQrCode: zyonPayResponse.pix.qrcode,
          zyonPayPixUrl: zyonPayResponse.pix.url,
          zyonPayPixExpiration: zyonPayResponse.pix.expirationDate,
          zyonPayStatus: zyonPayResponse.status
        }),
      });

      if (!response.ok) {
        console.error('Failed to store transaction in database');
      }
    } catch (error) {
      console.error('Error storing transaction:', error);
    }
  }

  generateQRCodeImageUrl(qrCodeData: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;
  }

  async checkTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${ZYONPAY_API_URL}/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check transaction status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw error;
    }
  }
}

export const zyonPayService = new ZyonPayService();