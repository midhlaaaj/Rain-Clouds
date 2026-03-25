import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_SECRET_KEY;
    const signature = req.headers['x-razorpay-signature'];

    // Verify signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    if (expectedSignature !== signature) {
        console.error('Invalid signature');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    // We only care about successful payments
    if (event !== 'payment.captured' && event !== 'order.paid') {
        return res.status(200).json({ status: 'ignored_event' });
    }

    const payment = payload.payment.entity;
    const userEmail = payment.email;
    const amount = payment.amount / 100; // Razorpay amounts are in paise
    const paymentId = payment.id;
    const orderId = payment.order_id;

    console.log(`Processing ${event} for ${userEmail}, amount: ${amount}`);

    // Initialize Supabase with SERVICE_ROLE_KEY to bypass RLS
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY // Service role is preferred
    );

    try {
        // Check if payment already exists to avoid duplicates
        const { data: existing } = await supabase
            .from('payments')
            .select('id')
            .eq('payment_id', paymentId)
            .maybeSingle();

        if (existing) {
            return res.status(200).json({ status: 'already_recorded' });
        }

        // Insert payment record
        const { error } = await supabase
            .from('payments')
            .insert({
                user_email: userEmail,
                payment_id: paymentId,
                order_id: orderId,
                amount: amount,
                status: 'success',
            });

        if (error) {
            throw error;
        }

        console.log('Payment recorded successfully via webhook');
        return res.status(200).json({ status: 'success' });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
