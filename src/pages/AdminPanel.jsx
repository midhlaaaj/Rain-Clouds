import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
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
    
    // Sales Summary States
    const [salesSummary, setSalesSummary] = useState({ totalSales: 0, totalRevenue: 0 });
    const [salesLoading, setSalesLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
        fetchPrice();
        fetchSalesSummary();
    }, []);

    async function fetchPrice() {
        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'book_price')
            .maybeSingle();
        if (data) setBookPrice(Number(data.value));
    }

    async function fetchSalesSummary() {
        setSalesLoading(true);
        const { data, error } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'success');
        
        if (data) {
            const totalRevenue = data.reduce((sum, p) => sum + Number(p.amount), 0);
            setSalesSummary({
                totalSales: data.length,
                totalRevenue: totalRevenue
            });
        }
        setSalesLoading(false);
    }


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
                        <Link to="/dashboard" className="admin__back-link">
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>
                        <p className="admin__eyebrow">Admin Area</p>
                        <h1 className="admin__title">Manage Reviews</h1>
                    </div>
                    <p className="admin__user">Signed in as <strong>{user.email}</strong></p>
                </div>

                {/* Toast */}
                {toast && <div className="admin__toast">{toast}</div>}

                {/* Sales Dashboard Summary Card */}
                <div className="admin__card admin__card--sales-summary animate-fade-up">
                    <div className="admin__card-header">
                        <div className="admin__card-title-wrap">
                            <BarChart2 size={20} className="admin__card-icon" />
                            <h2 className="admin__card-title">Sales Overview</h2>
                        </div>
                        <Link to="/admin/sales" className="admin__view-all">
                            View Full Dashboard
                        </Link>
                    </div>

                    <div className="admin__summary-grid">
                        <div className="admin__summary-item">
                            <div className="admin__summary-icon admin__summary-icon--sales">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <p className="admin__summary-label">Total Sales</p>
                                <p className="admin__summary-value">{salesLoading ? '...' : salesSummary.totalSales}</p>
                            </div>
                        </div>
                        <div className="admin__summary-item">
                            <div className="admin__summary-icon admin__summary-icon--revenue">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="admin__summary-label">Total Revenue</p>
                                <p className="admin__summary-value">₹{salesLoading ? '...' : salesSummary.totalRevenue.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
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
