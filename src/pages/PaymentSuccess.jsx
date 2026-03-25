import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
    return (
        <div className="success-page">
            <div className="success-card glass animate-fade-up">
                <div className="success-card__cloud">☁</div>

                <h1 className="success-card__title">Payment Successful!</h1>
                <p className="success-card__subtitle">Thank you for your purchase</p>
                
                <p className="success-card__desc">
                    Your ebook has been confirmed. You can start reading instantly 
                    or access it later from your dashboard. Happy reading! 🌧
                </p>

                <div className="success-card__book-display">
                    <p className="book-display__title">മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ</p>
                    <p className="book-display__tagline">A Collection of Emotions</p>
                </div>

                <div className="success-card__actions">
                    <Link to="/read" className="btn-primary">
                        <span>Start Reading Now</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Rain animation */}
            <div className="success-page__rain">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="raindrop"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${1.5 + Math.random() * 2}s`,
                            animationDelay: `${Math.random() * 3}s`,
                            height: `${40 + Math.random() * 40}px`,
                            opacity: Math.random() * 0.3 + 0.1,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
