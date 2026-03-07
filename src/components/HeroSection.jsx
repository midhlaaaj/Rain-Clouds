import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './HeroSection.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const AMOUNT = 14900; // ₹149 in paise

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

export default function HeroSection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const rainRef = useRef(null);

    // Generate raindrops on mount
    useEffect(() => {
        const container = rainRef.current;
        if (!container) return;
        const drops = [];
        for (let i = 0; i < 30; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${1.5 + Math.random() * 2}s`;
            drop.style.animationDelay = `${Math.random() * 3}s`;
            drop.style.height = `${40 + Math.random() * 40}px`;
            drop.style.opacity = Math.random() * 0.4 + 0.1;
            container.appendChild(drop);
            drops.push(drop);
        }
        return () => drops.forEach(d => d.remove());
    }, []);

    async function handleBuyNow() {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert('Could not load Razorpay. Please check your connection.');
            return;
        }

        // Create a fake order for demo (production: call Supabase Edge Function)
        const orderId = `order_demo_${Date.now()}`;

        const options = {
            key: RAZORPAY_KEY,
            amount: AMOUNT,
            currency: 'INR',
            name: 'Rain Clouds',
            description: 'Rain Clouds Ebook — A Collection of Emotions',
            order_id: orderId,
            prefill: {
                email: user?.email || '',
            },
            theme: {
                color: '#4a90d9',
            },
            handler: async function (response) {
                // Store payment record in Supabase
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
        <section className="hero">
            {/* Rain animation background */}
            <div className="rain-container" ref={rainRef} />

            {/* Decorative clouds */}
            <svg className="cloud-decoration cloud-decoration--1" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" width="320">
                <path d="M30 60 C10 60 0 45 15 38 C12 22 32 10 50 18 C58 8 80 6 90 20 C105 10 130 18 125 35 C140 32 155 45 140 60 Z" />
            </svg>
            <svg className="cloud-decoration cloud-decoration--2" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" width="200">
                <path d="M30 60 C10 60 0 45 15 38 C12 22 32 10 50 18 C58 8 80 6 90 20 C105 10 130 18 125 35 C140 32 155 45 140 60 Z" />
            </svg>

            <div className="hero__inner container">
                {/* Left: Content */}
                <div className="hero__content animate-fade-up">
                    <div className="hero__badge animate-fade delay-1">
                        ✨ Now Available
                    </div>
                    <h1 className="hero__title animate-fade-up delay-2">
                        Rain Clouds
                    </h1>
                    <p className="hero__subtitle animate-fade-up delay-2">
                        A Collection of Emotions
                    </p>
                    <p className="hero__desc animate-fade-up delay-3">
                        Drift through pages soaked in feeling. <em>Rain Clouds</em> is a poetic ebook
                        that captures the quiet storms within — love, loss, longing, and the gentle
                        peace that follows every rain.
                    </p>

                    <div className="hero__price-row animate-fade-up delay-3">
                        <span className="hero__price">₹149</span>
                        <span className="hero__price-note">One-time purchase • Instant download</span>
                    </div>

                    <div className="hero__actions animate-fade-up delay-4">
                        <button className="btn-primary" onClick={handleBuyNow}>
                            <span>Buy Now — ₹149</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <p className="hero__trust">
                            🔒 Secure payment via Razorpay
                        </p>
                    </div>
                </div>

                {/* Right: Ebook cover */}
                <div className="hero__cover-wrap animate-fade delay-2">
                    <div className="hero__cover-glow" />
                    <img
                        src="/ebook-cover.png"
                        alt="Rain Clouds ebook cover"
                        className="hero__cover"
                    />
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="hero__scroll">
                <span />
            </div>
        </section>
    );
}
