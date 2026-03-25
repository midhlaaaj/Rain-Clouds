import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingBag, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './SalesDashboard.css';

export default function SalesDashboard() {
    const { user } = useAuth();
    const [allPayments, setAllPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [dateFilter, setDateFilter] = useState('all'); // all, daily, weekly, monthly, custom
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchPayments();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:payments')
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'payments' }, 
                (payload) => {
                    console.log('New payment detected:', payload.new);
                    if (payload.new.status === 'success') {
                        showToast('New purchase received! ✨');
                        fetchPayments();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        applyFilters();
    }, [dateFilter, customDates, allPayments]);

    async function fetchPayments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('status', 'success')
            .order('created_at', { ascending: false });
        
        if (data) {
            setAllPayments(data);
            setFilteredPayments(data);
        }
        setLoading(false);
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    function applyFilters() {
        let filtered = [...allPayments];
        const now = new Date();

        if (dateFilter === 'daily') {
            const today = new Date(now.setHours(0,0,0,0));
            filtered = allPayments.filter(p => new Date(p.created_at) >= today);
        } else if (dateFilter === 'weekly') {
            const lastWeek = new Date(now.setDate(now.getDate() - 7));
            filtered = allPayments.filter(p => new Date(p.created_at) >= lastWeek);
        } else if (dateFilter === 'monthly') {
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
            filtered = allPayments.filter(p => new Date(p.created_at) >= lastMonth);
        } else if (dateFilter === 'custom') {
            if (customDates.start) {
                const start = new Date(customDates.start);
                filtered = filtered.filter(p => new Date(p.created_at) >= start);
            }
            if (customDates.end) {
                const end = new Date(customDates.end);
                end.setHours(23, 59, 59, 999);
                filtered = filtered.filter(p => new Date(p.created_at) <= end);
            }
        }
        setFilteredPayments(filtered);
    }

    const totalRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalSales = filteredPayments.length;

    return (
        <div className="sales-dash">
            <div className="container sales-dash__inner">
                <div className="sales-dash__header animate-fade-up">
                    <div>
                        <Link to="/admin" className="sales-dash__back-link">
                            <ArrowLeft size={16} />
                            Back to Admin Panel
                        </Link>
                        <p className="sales-dash__eyebrow">Analytics</p>
                        <h1 className="sales-dash__title">Sales Dashboard</h1>
                    </div>
                    <div className="sales-dash__user">
                        <div className="sales-dash__user-info">
                            <p className="sales-dash__user-email">{user.email}</p>
                            <p className="sales-dash__user-role">Administrator</p>
                        </div>
                    </div>
                </div>

                {toast && <div className="sales-dash__toast">{toast}</div>}

                {/* Stats Cards */}
                <div className="sales-dash__stats-grid animate-fade-up">
                    <div className="sales-dash__stat-card">
                        <div className="sales-dash__stat-icon sales-dash__stat-icon--revenue">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="sales-dash__stat-label">Total Revenue</p>
                            <p className="sales-dash__stat-value">₹{totalRevenue.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="sales-dash__stat-trend up">
                             <TrendingUp size={14} /> <span>Live</span>
                        </div>
                    </div>
                    <div className="sales-dash__stat-card">
                        <div className="sales-dash__stat-icon sales-dash__stat-icon--sales">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="sales-dash__stat-label">Total Sales</p>
                            <p className="sales-dash__stat-value">{totalSales}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="sales-dash__card animate-fade-up delay-1">
                    <div className="sales-dash__card-header">
                        <div className="sales-dash__card-title-wrap">
                            <BarChart2 size={20} className="sales-dash__card-icon" />
                            <h2 className="sales-dash__card-title">Transaction History</h2>
                        </div>
                        <div className="sales-dash__filters">
                            <button className={`sales-dash__filter-btn ${dateFilter === 'all' ? 'active' : ''}`} onClick={() => setDateFilter('all')}>All Time</button>
                            <button className={`sales-dash__filter-btn ${dateFilter === 'daily' ? 'active' : ''}`} onClick={() => setDateFilter('daily')}>Daily</button>
                            <button className={`sales-dash__filter-btn ${dateFilter === 'weekly' ? 'active' : ''}`} onClick={() => setDateFilter('weekly')}>Weekly</button>
                            <button className={`sales-dash__filter-btn ${dateFilter === 'monthly' ? 'active' : ''}`} onClick={() => setDateFilter('monthly')}>Monthly</button>
                            <button className={`sales-dash__filter-btn ${dateFilter === 'custom' ? 'active' : ''}`} onClick={() => setDateFilter('custom')}>Custom</button>
                        </div>
                    </div>

                    {dateFilter === 'custom' && (
                        <div className="sales-dash__custom-dates animate-fade-in">
                            <div className="sales-dash__form-group">
                                <label>Start Date</label>
                                <input type="date" value={customDates.start} onChange={(e) => setCustomDates(d => ({ ...d, start: e.target.value }))} />
                            </div>
                            <div className="sales-dash__form-group">
                                <label>End Date</label>
                                <input type="date" value={customDates.end} onChange={(e) => setCustomDates(d => ({ ...d, end: e.target.value }))} />
                            </div>
                        </div>
                    )}

                    <div className="sales-dash__table-wrap">
                        {loading && allPayments.length === 0 ? (
                            <div className="sales-dash__loading"><div className="spinner" /></div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="sales-dash__empty">
                                <ShoppingBag size={48} className="sales-dash__empty-icon" />
                                <p>No transactions found for this period.</p>
                            </div>
                        ) : (
                            <table className="sales-dash__table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer Email</th>
                                        <th>Amount</th>
                                        <th>Transaction ID</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="sales-dash__date-cell">
                                                    <span className="sales-dash__date-primary">{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                    <span className="sales-dash__date-secondary">{new Date(p.created_at).getFullYear()}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="sales-dash__email-cell">
                                                    {p.user_email}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="sales-dash__amount-cell">₹{p.amount}</span>
                                            </td>
                                            <td>
                                                <code className="sales-dash__id-cell">{p.payment_id}</code>
                                            </td>
                                            <td>
                                                <span className="sales-dash__status-tag">Success</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
