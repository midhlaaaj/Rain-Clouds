import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

export default function AdminPanel() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ reviewer_name: '', review_text: '' });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [bookPrice, setBookPrice] = useState(1);
    const [priceSaving, setPriceSaving] = useState(false);
    
    // Sales Dashboard States
    const [allPayments, setAllPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [dateFilter, setDateFilter] = useState('all'); // all, daily, weekly, monthly, custom
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [salesLoading, setSalesLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
        fetchPrice();
        fetchPayments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [dateFilter, customDates, allPayments]);

    async function fetchPrice() {
        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'book_price')
            .maybeSingle();
        if (data) setBookPrice(Number(data.value));
    }

    async function fetchPayments() {
        setSalesLoading(true);
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('status', 'success')
            .order('created_at', { ascending: false });
        
        if (data) {
            setAllPayments(data);
            setFilteredPayments(data);
        }
        setSalesLoading(false);
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

    async function fetchReviews() {
        setLoading(true);
        const { data } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
        setReviews(data || []);
        setLoading(false);
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.reviewer_name.trim() || !form.review_text.trim()) return;
        setSaving(true);

        if (editingId) {
            const { error } = await supabase
                .from('reviews')
                .update({ reviewer_name: form.reviewer_name, review_text: form.review_text })
                .eq('id', editingId);
            if (!error) showToast('Review updated!');
        } else {
            const { error } = await supabase
                .from('reviews')
                .insert({ reviewer_name: form.reviewer_name, review_text: form.review_text });
            if (!error) showToast('Review added!');
        }

        setForm({ reviewer_name: '', review_text: '' });
        setEditingId(null);
        setSaving(false);
        fetchReviews();
    }

    function handleEdit(review) {
        setEditingId(review.id);
        setForm({ reviewer_name: review.reviewer_name, review_text: review.review_text });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this review?')) return;
        await supabase.from('reviews').delete().eq('id', id);
        showToast('Review deleted!');
        fetchReviews();
    }

    async function handlePriceUpdate(e) {
        e.preventDefault();
        setPriceSaving(true);
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'book_price', value: String(bookPrice) }, { onConflict: 'key' });
        
        if (error) showToast('Error updating price');
        else showToast('Price updated successfully!');
        setPriceSaving(false);
    }

    return (
        <div className="admin">
            <div className="admin__inner container">
                <div className="admin__header animate-fade-up">
                    <div>
                        <p className="admin__eyebrow">Admin Area</p>
                        <h1 className="admin__title">Manage Reviews</h1>
                    </div>
                    <p className="admin__user">Signed in as <strong>{user.email}</strong></p>
                </div>

                {/* Toast */}
                {toast && <div className="admin__toast">{toast}</div>}

                {/* Sales Dashboard */}
                <div className="admin__card admin__card--dashboard animate-fade-up">
                    <div className="admin__card-header">
                        <h2 className="admin__card-title">📊 Sales Dashboard</h2>
                        <div className="admin__filters">
                            <button className={`admin__filter-btn ${dateFilter === 'all' ? 'active' : ''}`} onClick={() => setDateFilter('all')}>All Time</button>
                            <button className={`admin__filter-btn ${dateFilter === 'daily' ? 'active' : ''}`} onClick={() => setDateFilter('daily')}>Daily</button>
                            <button className={`admin__filter-btn ${dateFilter === 'weekly' ? 'active' : ''}`} onClick={() => setDateFilter('weekly')}>Weekly</button>
                            <button className={`admin__filter-btn ${dateFilter === 'monthly' ? 'active' : ''}`} onClick={() => setDateFilter('monthly')}>Monthly</button>
                            <button className={`admin__filter-btn ${dateFilter === 'custom' ? 'active' : ''}`} onClick={() => setDateFilter('custom')}>Custom</button>
                        </div>
                    </div>

                    {dateFilter === 'custom' && (
                        <div className="admin__custom-dates animate-fade-in">
                            <div className="admin__form-group">
                                <label>Start Date</label>
                                <input type="date" value={customDates.start} onChange={(e) => setCustomDates(d => ({ ...d, start: e.target.value }))} />
                            </div>
                            <div className="admin__form-group">
                                <label>End Date</label>
                                <input type="date" value={customDates.end} onChange={(e) => setCustomDates(d => ({ ...d, end: e.target.value }))} />
                            </div>
                        </div>
                    )}

                    <div className="admin__stats-grid">
                        <div className="admin__stat-card">
                            <p className="admin__stat-label">Total Sales</p>
                            <p className="admin__stat-value">{totalSales}</p>
                        </div>
                        <div className="admin__stat-card">
                            <p className="admin__stat-label">Total Revenue</p>
                            <p className="admin__stat-value">₹{totalRevenue}</p>
                        </div>
                    </div>

                    <div className="admin__table-wrap">
                        {salesLoading ? (
                            <div className="admin__loading"><div className="spinner" /></div>
                        ) : filteredPayments.length === 0 ? (
                            <p className="admin__empty">No sales found for this period.</p>
                        ) : (
                            <table className="admin__table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer Email</th>
                                        <th>Amount</th>
                                        <th>Payment ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map(p => (
                                        <tr key={p.id}>
                                            <td>{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="admin__email-cell">{p.user_email}</td>
                                            <td>₹{p.amount}</td>
                                            <td className="admin__id-cell">{p.payment_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Price Management */}
                <div className="admin__card admin__card--price animate-fade-up">
                    <h2 className="admin__card-title">💰 Manage Book Price</h2>
                    <form className="admin__price-form" onSubmit={handlePriceUpdate}>
                        <div className="admin__form-group">
                            <label>Book Price (₹)</label>
                            <div className="admin__price-input-wrap">
                                <span className="admin__currency">₹</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={bookPrice}
                                    onChange={(e) => setBookPrice(e.target.value)}
                                    placeholder="e.g. 150"
                                    required
                                />
                            </div>
                            <p className="admin__help-text">This will update the price across the entire website instantly.</p>
                        </div>
                        <button className="btn-primary" type="submit" disabled={priceSaving}>
                            <span>{priceSaving ? 'Updating…' : 'Update Price'}</span>
                        </button>
                    </form>
                </div>

                {/* Form */}
                <div className="admin__card animate-fade-up delay-1">
                    <h2 className="admin__card-title">
                        {editingId ? '✏️ Edit Review' : '+ Add New Review'}
                    </h2>
                    <form className="admin__form" onSubmit={handleSubmit}>
                        <div className="admin__form-group">
                            <label>Reviewer Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Priya Menon"
                                value={form.reviewer_name}
                                onChange={(e) => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="admin__form-group">
                            <label>Review Text</label>
                            <textarea
                                rows={4}
                                placeholder="Write the review here..."
                                value={form.review_text}
                                onChange={(e) => setForm(f => ({ ...f, review_text: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="admin__form-actions">
                            <button className="btn-primary" type="submit" disabled={saving}>
                                <span>{saving ? 'Saving…' : editingId ? 'Update Review' : 'Add Review'}</span>
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="admin__cancel-btn"
                                    onClick={() => { setEditingId(null); setForm({ reviewer_name: '', review_text: '' }); }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Reviews list */}
                <div className="admin__card animate-fade-up delay-2">
                    <h2 className="admin__card-title">📋 All Reviews ({reviews.length})</h2>
                    {loading ? (
                        <div className="admin__loading"><div className="spinner" /></div>
                    ) : reviews.length === 0 ? (
                        <p className="admin__empty">No reviews yet. Add your first one above.</p>
                    ) : (
                        <div className="admin__reviews-list">
                            {reviews.map(r => (
                                <div key={r.id} className="admin__review-item">
                                    <div className="admin__review-content">
                                        <p className="admin__review-name">{r.reviewer_name}</p>
                                        <p className="admin__review-text">"{r.review_text}"</p>
                                    </div>
                                    <div className="admin__review-actions">
                                        <button
                                            className="admin__action-btn admin__action-btn--edit"
                                            onClick={() => handleEdit(r)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="admin__action-btn admin__action-btn--delete"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
