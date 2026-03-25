import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import './SignIn.css';

export default function SignIn() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

    if (user) return <Navigate to="/dashboard" replace />;

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (mode === 'signin') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
            else navigate('/dashboard');
        } else if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setError(error.message);
            else setSuccess('Check your email to confirm your account!');
        } else {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/signin`,
            });
            if (error) setError(error.message);
            else setSuccess('Password reset link sent to your email!');
        }
        setLoading(false);
    }

    return (
        <div className="signin-page">
            {/* Background effects */}
            <div className="rain-container" ref={rainRef} />
            
            <svg className="cloud-decoration cloud-decoration--1" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" width="320">
                <path d="M30 60 C10 60 0 45 15 38 C12 22 32 10 50 18 C58 8 80 6 90 20 C105 10 130 18 125 35 C140 32 155 45 140 60 Z" />
            </svg>
            <svg className="cloud-decoration cloud-decoration--2" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" width="200">
                <path d="M30 60 C10 60 0 45 15 38 C12 22 32 10 50 18 C58 8 80 6 90 20 C105 10 130 18 125 35 C140 32 155 45 140 60 Z" />
            </svg>

            <div className="signin-card glass animate-fade-up">
                <div className="signin-card__top">
                    <div className="signin-card__icon">☁</div>
                    <h1 className="signin-card__title">
                        {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Join Rain Clouds' : 'Reset Password'}
                    </h1>
                    <p className="signin-card__subtitle">
                        {mode === 'signin'
                            ? 'Sign in to access your dashboard and purchase history.'
                            : mode === 'signup'
                            ? 'Create an account to purchase and access your ebook.'
                            : 'Enter your email to receive a password reset link.'}
                    </p>
                </div>

                <form className="signin-form" onSubmit={handleSubmit}>
                    <div className="signin-form__group">
                        <label className="signin-form__label">Email Address</label>
                        <input
                            type="email"
                            className="signin-form__input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {mode !== 'forgot' && (
                        <div className="signin-form__group">
                            <div className="signin-form__label-row">
                                <label className="signin-form__label">Password</label>
                                {mode === 'signin' && (
                                    <button 
                                        type="button" 
                                        className="signin-form__forgot-btn"
                                        onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="signin-form__password-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="signin-form__input signin-form__input--password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={mode !== 'forgot'}
                                />
                                <button 
                                    type="button" 
                                    className="signin-form__toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="signin-form__error">⚠ {error}</p>}
                    {success && <p className="signin-form__success">✅ {success}</p>}

                    <button className="btn-primary signin-form__submit" type="submit" disabled={loading}>
                        <span>
                            {loading 
                                ? 'Please wait…' 
                                : mode === 'signin' 
                                ? 'Sign In' 
                                : mode === 'signup' 
                                ? 'Create Account' 
                                : 'Send Reset Link'}
                        </span>
                    </button>
                </form>

                <div className="signin-card__toggle">
                    {mode === 'signin' ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            {mode === 'signup' ? 'Already have an account?' : 'Remembered your password?'}
                            {' '}
                            <button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>
                                Sign In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
