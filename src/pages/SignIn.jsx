import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';

export default function SignIn() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setError(error.message);
            else setSuccess('Check your email to confirm your account!');
        }
        setLoading(false);
    }

    return (
        <div className="signin-page">
            {/* Background rain */}
            <div className="signin-page__bg" />

            <div className="signin-card glass animate-fade-up">
                <div className="signin-card__top">
                    <div className="signin-card__icon">☁</div>
                    <h1 className="signin-card__title">
                        {mode === 'signin' ? 'Welcome Back' : 'Join Rain Clouds'}
                    </h1>
                    <p className="signin-card__subtitle">
                        {mode === 'signin'
                            ? 'Sign in to access your dashboard and purchase history.'
                            : 'Create an account to purchase and access your ebook.'}
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

                    <div className="signin-form__group">
                        <label className="signin-form__label">Password</label>
                        <input
                            type="password"
                            className="signin-form__input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="signin-form__error">⚠ {error}</p>}
                    {success && <p className="signin-form__success">✅ {success}</p>}

                    <button className="btn-primary signin-form__submit" type="submit" disabled={loading}>
                        <span>{loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
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
                            Already have an account?{' '}
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
