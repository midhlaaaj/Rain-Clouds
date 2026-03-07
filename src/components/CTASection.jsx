import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './CTASection.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const AMOUNT = 14900;

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function CTASection() {
    const { user } = useAuth();
    const navigate = useNavigate();

    async function handleBuyNow() {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert('Could not load Razorpay. Please check your connection.');
            return;
        }

        const orderId = `order_demo_${Date.now()}`;

        const options = {
            key: RAZORPAY_KEY,
            amount: AMOUNT,
            currency: 'INR',
            name: 'Rain Clouds',
            description: 'മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ — A Collection of Emotions',
            order_id: orderId,
            prefill: { email: user?.email || '' },
            theme: { color: '#4a90d9' },
            handler: async function (response) {
                await supabase.from('payments').insert({
                    user_email: user?.email || 'guest',
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id || orderId,
                    amount: 149,
                    status: 'success',
                });
                navigate('/success');
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    }

    return (
        <section className="cta">
            <div className="cta__inner container">
                <div className="cta__content animate-fade-up">
                    <p className="cta__eyebrow">Ready to Read?</p>
                    <h2 className="cta__title">Your next favorite book<br />is one click away.</h2>
                    <p className="cta__desc">
                        Download <em>മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ</em> instantly and carry it with you everywhere.
                        A small price for a book that stays with you.
                    </p>

                    <div className="cta__price-wrap">
                        <span className="cta__price">₹149</span>
                        <span className="cta__price-tag">One-time • Instant PDF delivery</span>
                    </div>

                    <button className="btn-primary cta__btn" onClick={handleBuyNow}>
                        <span>Get the Ebook — ₹149</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <p className="cta__trust">🔒 Secured by Razorpay · No hidden charges</p>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="cta__decor cta__decor--left" />
            <div className="cta__decor cta__decor--right" />
        </section>
    );
}
