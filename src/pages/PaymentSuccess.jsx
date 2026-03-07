import { Link } from 'react-router-dom';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
    return (
        <div className="success-page">
            <div className="success-card glass animate-fade-up">
                <div className="success-card__icon">
                    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="success-circle" cx="26" cy="26" r="25" stroke="#4caf50" strokeWidth="2" fill="none" />
                        <path className="success-check" d="M14 27l8 8 16-18" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="success-card__cloud">☁</div>

                <h1 className="success-card__title">Payment Successful!</h1>
                <p className="success-card__subtitle">Thank you for purchasing മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ</p>
                <p className="success-card__desc">
                    Your ebook purchase has been confirmed. You can access your purchase
                    history from your dashboard. Happy reading! 🌧
                </p>

                <div className="success-card__detail">
                    <span>📘</span>
                    <div>
                        <p className="success-card__detail-book">മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ — A Collection of Emotions</p>
                        <p className="success-card__detail-amount">₹149 · One-time purchase</p>
                    </div>
                </div>

                <div className="success-card__actions">
                    <Link to="/dashboard" className="btn-primary">
                        <span>Go to Dashboard</span>
                    </Link>
                    <Link to="/" className="success-card__home-link">
                        ← Back to Home
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
