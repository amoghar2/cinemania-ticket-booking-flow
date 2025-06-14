
import { supabase } from "@/integrations/supabase/client";

export class PaymentsService {
  async initiatePayment(bookingId: string, amount: number) {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("[Mock]: initiatePayment called", { bookingId, amount, transactionId });

    // Simulate payment creation in the DB
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount,
        payment_method: 'card',
        transaction_id: transactionId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[Mock] Failed to initiate payment:', error);
      // Still return a payment object for mocking success
      return {
        booking_id: bookingId,
        amount,
        payment_method: 'card',
        transaction_id: transactionId,
        status: 'pending',
        id: null,
        created_at: new Date().toISOString(),
      };
    }

    console.log("[Mock]: Payment initiated (pending), moving to confirmed.");
    return data;
  }

  async confirmPayment(transactionId: string, _status: 'pending' | 'completed' | 'failed' | 'refunded') {
    // Always set as completed regardless of input (pure mock)
    const status: 'completed' = 'completed';
    console.log('[Mock]: confirmPayment called for', transactionId, 'setting status to', status);

    // Attempt update but ignore error as this is a pure mock
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('[Mock] Error in confirmPayment, but still returning completed:', error);
      // Still return a payment object for mocking success
      return {
        transaction_id: transactionId,
        status,
        id: null,
        created_at: new Date().toISOString(),
      };
    }

    // Update bookings table to confirmed (payment_id = transactionId)
    if (payment && payment.booking_id) {
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_id: transactionId
        })
        .eq('id', payment.booking_id);
    }
    console.log('[Mock]: Payment successfully confirmed');
    return payment;
  }
}

export const paymentsService = new PaymentsService();
