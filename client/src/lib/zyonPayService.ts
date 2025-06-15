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
  customer: ZyonPayCustomer;
  secureId: string;
  secureUrl: string;
  createdAt: string;
  updatedAt: string;
}

export class ZyonPayService {
  private getAuthHeader(): string {
    const credentials = `${ZYONPAY_SECRET_KEY}:x`;
    return `Basic ${btoa(credentials)}`;
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

    const transactionData: ZyonPayTransaction = {
      amount: amountInCentavos,
      paymentMethod: 'pix',
      customer: {
        name: userName || 'Usuario ThunderBet',
        email: userEmail,
        phone: phone,
        document: {
          number: cpf,
          type: 'cpf'
        }
      },
      items: [
        {
          title: 'Depósito ThunderBet',
          unitPrice: amountInCentavos,
          quantity: 1,
          tangible: false
        }
      ],
      pix: {
        expiresInDays: 1
      },
      splits: [
        {
          recipientId: 106198,
          amount: amountInCentavos
        }
      ]
    };

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
      return result;
    } catch (error) {
      console.error('Error creating PIX transaction:', error);
      throw error;
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