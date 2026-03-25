import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './CTASection.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

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
    const { user, hasPurchased, checkPurchase } = useAuth();
    const navigate = useNavigate();
    const [price, setPrice] = useState(1);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const { data } = await supabase.from('settings').select('value').eq('key', 'book_price').maybeSingle();
                if (data?.value) setPrice(Number(data.value));
            } catch (e) {
                console.warn('Failed to fetch price:', e);
            }
        };
        fetchPrice();
    }, []);

    async function handleBuyNow() {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert('Could not load Razorpay. Please check your connection.');
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: price * 100,
            currency: 'INR',
            name: 'Rain Clouds',
            description: 'മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ — A Collection of Emotions',
            prefill: { email: user?.email || '' },
            theme: { color: '#4a90d9' },
            handler: async function (response) {
                await supabase.from('payments').insert({
                    user_email: user?.email || 'guest',
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    amount: price,
                    status: 'success',
                });
                await checkPurchase(user?.email);
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

                    {!hasPurchased && (
                        <div className="cta__price-wrap">
                            <span className="cta__price">₹{price}</span>
                            <span className="cta__price-tag">One-time • Instant PDF delivery</span>
                        </div>
                    )}

                    <button className="btn-primary cta__btn" onClick={hasPurchased ? () => navigate('/read') : handleBuyNow}>
                        <span>{hasPurchased ? 'Start Reading Now' : `Get the Ebook — ₹${price}`}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {!hasPurchased && (
                        <p className="cta__trust">🔒 Secured by Razorpay · No hidden charges</p>
                    )}
                </div>
            </div>

            {/* Decorative elements */}
            <div className="cta__decor cta__decor--left" />
            <div className="cta__decor cta__decor--right" />
        </section>
    );
}
