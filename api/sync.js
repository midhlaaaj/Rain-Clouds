import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_SECRET_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !SUPABASE_URL) {
        return res.status(500).json({ error: 'Missing environment variables on server' });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('Starting sync via API...');

    try {
        const response = await fetch('https://api.razorpay.com/v1/payments?count=100', {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.description || 'Razorpay error');
        
        const successful = data.items.filter(p => (p.status === 'captured' || p.status === 'paid'));
        let syncedCount = 0;
        let skippedCount = 0;
        let errors = [];

        for (const p of successful) {
            const { data: existing } = await supabase.from('payments').select('id').eq('payment_id', p.id).maybeSingle();
            if (existing) {
                skippedCount++;
                continue;
            }
            
            const { error: insertError } = await supabase.from('payments').insert({
                user_email: p.email,
                payment_id: p.id,
                order_id: p.order_id,
                amount: p.amount / 100,
                status: 'success',
                created_at: new Date(p.created_at * 1000).toISOString()
            });

            if (insertError) {
                errors.push(`${p.id}: ${insertError.message}`);
            } else {
                syncedCount++;
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: `Sync complete. ${syncedCount} synced, ${skippedCount} skipped.`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
