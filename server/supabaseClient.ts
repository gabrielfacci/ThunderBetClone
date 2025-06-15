import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpmvqfehzkeyrtexdkb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable not found');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          userId: 1, // Use a default numeric user ID since our schema expects integer
          type: 'deposit',
          amount: transactionData.amount,
          status: 'pending',
          description: `Depósito PIX via ZyonPay - R$ ${transactionData.amount.toFixed(2)}`,
          balanceBefore: 0,
          balanceAfter: 0,
          zyonPayTransactionId: transactionData.zyonPayTransactionId,
          zyonPaySecureId: transactionData.zyonPaySecureId,
          zyonPaySecureUrl: transactionData.zyonPaySecureUrl,
          zyonPayPixQrCode: transactionData.zyonPayPixQrCode,
          zyonPayPixUrl: transactionData.zyonPayPixUrl,
          zyonPayPixExpiration: transactionData.zyonPayPixExpiration,
          zyonPayStatus: transactionData.zyonPayStatus,
          metadata: JSON.stringify({
            ...JSON.parse(transactionData.metadata),
            supabaseUserId: transactionData.userId,
            userEmail: transactionData.userEmail
          }),
          createdAt: new Date(),
          updatedAt: new Date()
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