import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
    const { user, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayments() {
            const { data } = await supabase
                .from('payments')
                .select('*')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false });
            setPayments(data || []);
            setLoading(false);
        }
        fetchPayments();
    }, [user]);

    const hasPurchased = payments.some(p => p.status === 'success');

    return (
        <div className="dashboard">
            <div className="dashboard__inner container">
                <Link to="/" className="dashboard__back-link animate-fade-up">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
                
                {/* Header */}
                <div className="dashboard__header animate-fade-up">
                    <div className="dashboard__avatar">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="dashboard__title">My Dashboard</h1>
                        <p className="dashboard__email">{user.email}</p>
                    </div>
                    <div className="dashboard__header-right">
                        {isAdmin && (
                            <Link to="/admin" className="dashboard__admin-link">
                                ⚙ Admin Panel
                            </Link>
                        )}
                        <button 
                            className="dashboard__logout-btn" 
                            onClick={async () => { await signOut(); navigate('/'); }}
                            title="Log out"
                        >
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                {/* Status card */}
                <div className={`dashboard__status-card animate-fade-up delay-1 ${hasPurchased ? 'dashboard__status-card--purchased' : ''}`}>
                    {hasPurchased ? (
                        <>
                            <span className="dashboard__status-icon">📘</span>
                            <div>
                                <p className="dashboard__status-title">Rain Clouds — Purchased ✅</p>
                                <p className="dashboard__status-desc">
                                    Your ebook is ready. Continue from where you left off.
                                </p>
                                <Link to="/read" className="btn-primary dashboard__read-link" style={{ marginTop: '16px' }}>
                                    <span>Read Ebook</span>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '8px' }}>
                                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="dashboard__status-icon">🛒</span>
                            <div>
                                <p className="dashboard__status-title">You haven't purchased Rain Clouds yet</p>
                                <p className="dashboard__status-desc">
                                    Get the ebook for just ₹149 and start reading today.
                                </p>
                            </div>
                            <Link to="/" className="btn-primary dashboard__buy-link">
                                <span>Buy Now</span>
                            </Link>
                        </>
                    )}
                </div>

                {!hasPurchased && (
                    <div className="dashboard__section animate-fade-up delay-2">
                        <h2 className="dashboard__section-title">Purchase History</h2>
                        {loading ? (
                            <div className="dashboard__loading"><div className="spinner" /></div>
                        ) : payments.length === 0 ? (
                            <div className="dashboard__empty">
                                <p>No purchases yet. <Link to="/">Buy Rain Clouds →</Link></p>
                            </div>
                        ) : (
                            <div className="dashboard__table-wrap">
                                <table className="dashboard__table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Payment ID</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id}>
                                                <td>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                                                <td className="dashboard__payment-id">{p.payment_id}</td>
                                                <td>₹{p.amount}</td>
                                                <td>
                                                    <span className={`dashboard__badge dashboard__badge--${p.status}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
