import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kgpmvqfehzkeyrtexdkb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  throw new Error('Supabase service key not found');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Transaction storage functions using Supabase API
export async function storeTransactionInSupabase(transactionData: {
  userId: string;
  userEmail: string;
  amount: number;
  zyonPayTransactionId: string;
  zyonPaySecureId: string;
  zyonPaySecureUrl: string;
  zyonPayPixQrCode: string | null;
  zyonPayPixUrl: string | null;
  zyonPayPixExpiration: string;
  zyonPayStatus: string;
  metadata: string;
}) {
  try {
    console.log('💾 Storing transaction in Supabase:', {
      userEmail: transactionData.userEmail,
      amount: transactionData.amount,
      zyonPayId: transactionData.zyonPayTransactionId
    });

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: transactionData.userId,
          type: 'deposit',
          amount: transactionData.amount,
          status: 'pending',
          description: `Depósito PIX via ZyonPay - R$ ${transactionData.amount.toFixed(2)}`,
          balance_before: 0,
          balance_after: 0,
          zyonpay_transaction_id: transactionData.zyonPayTransactionId,
          zyonpay_secure_id: transactionData.zyonPaySecureId,
          zyonpay_secure_url: transactionData.zyonPaySecureUrl,
          zyonpay_pix_qrcode: transactionData.zyonPayPixQrCode,
          zyonpay_pix_url: transactionData.zyonPayPixUrl,
          zyonpay_pix_expiration: transactionData.zyonPayPixExpiration,
          zyonpay_status: transactionData.zyonPayStatus,
          metadata: transactionData.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase error storing transaction:', error);
      throw error;
    }

    console.log('✅ Transaction successfully stored in Supabase:', data[0].id);
    return data[0];
  } catch (error) {
    console.error('❌ Error storing transaction in Supabase:', error);
    throw error;
  }
}

export async function getAllTransactionsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error fetching transactions:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching transactions from Supabase:', error);
    throw error;
  }
}

export async function getUserTransactionsFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error fetching user transactions:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching user transactions from Supabase:', error);
    throw error;
  }
}