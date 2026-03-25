import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@supabase/supabase-js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'api-sync-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/sync') {
              try {
                const RAZORPAY_KEY = env.VITE_RAZORPAY_KEY_ID;
                const RAZORPAY_SECRET = env.RAZORPAY_SECRET_KEY;
                const SUPABASE_URL = env.VITE_SUPABASE_URL;
                const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

                if (!RAZORPAY_KEY || !RAZORPAY_SECRET || !SUPABASE_URL) {
                  throw new Error('Missing credentials in .env');
                }

                const auth = Buffer.from(`${RAZORPAY_KEY}:${RAZORPAY_SECRET}`).toString('base64');
                const response = await fetch('https://api.razorpay.com/v1/payments?count=100', {
                  headers: { 'Authorization': `Basic ${auth}` }
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.description || 'Razorpay error');
                
                const successful = data.items.filter(p => (p.status === 'captured' || p.status === 'paid'));
                const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
                
                let synced = 0;
                for (const p of successful) {
                  const { data: existing } = await supabase.from('payments').select('id').eq('payment_id', p.id).maybeSingle();
                  if (existing) continue;

                  await supabase.from('payments').insert({
                    user_email: p.email,
                    payment_id: p.id,
                    order_id: p.order_id,
                    amount: p.amount / 100,
                    status: 'success',
                    created_at: new Date(p.created_at * 1000).toISOString()
                  });
                  synced++;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: `Successfully synced ${synced} payments.` }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ]
  }
})
