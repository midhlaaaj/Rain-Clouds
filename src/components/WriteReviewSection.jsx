import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './WriteReviewSection.css';

export default function WriteReviewSection() {
    const [form, setForm] = useState({ reviewer_name: '', review_text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.reviewer_name.trim() || !form.review_text.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const { error: supabaseError } = await supabase
                .from('reviews')
                .insert({
                    reviewer_name: form.reviewer_name,
                    review_text: form.review_text
                });

            if (supabaseError) throw supabaseError;

            setSubmitted(true);
            setForm({ reviewer_name: '', review_text: '' });
            
            // Reset submission state after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="write-review">
            <div className="write-review__inner container">
                <div className="write-review__header animate-fade-up">
                    <p className="write-review__eyebrow">Share Your Thoughts</p>
                    <h2 className="write-review__title">Write a Review</h2>
                    <p className="write-review__subtitle">
                        Please share your valuable review. Your feedback helps other readers find their way to these pages. 
                        Whether it's a specific story that stayed with you or the overall emotional journey, 
                        we'd love to hear how these words resonated with your own experiences.
                    </p>
                    <p className="write-review__subtitle" style={{ marginTop: '1.2rem' }}>
                        Writing about the quiet moments or the grander themes of loss and resilience help create a bridge between the author's world and yours. 
                        We truly appreciate you taking the time to share your perspective with our community of readers.
                    </p>
                </div>

                <div className="write-review__content animate-fade-up delay-1">
                    {submitted ? (
                        <div className="write-review__success">
                            <div className="write-review__success-icon">✓</div>
                            <h3 className="write-review__success-title">Thank You!</h3>
                            <p className="write-review__success-text">
                                Your review has been submitted successfully and will appear in our collection soon.
                            </p>
                            <button 
                                className="write-review__reset" 
                                onClick={() => setSubmitted(false)}
                            >
                                Write another review
                            </button>
                        </div>
                    ) : (
                        <form className="write-review__form" onSubmit={handleSubmit}>
                            <div className="write-review__form-group">
                                <label htmlFor="reviewer_name">Full Name</label>
                                <input
                                    type="text"
                                    id="reviewer_name"
                                    placeholder="e.g. Priya Menon"
                                    value={form.reviewer_name}
                                    onChange={(e) => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className="write-review__form-group">
                                <label htmlFor="review_text">Your Review</label>
                                <textarea
                                    id="review_text"
                                    rows={5}
                                    placeholder="What did you think of the book? How did it make you feel?"
                                    value={form.review_text}
                                    onChange={(e) => setForm(f => ({ ...f, review_text: e.target.value }))}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            
                            {error && <p className="write-review__error">{error}</p>}
                            
                            <button 
                                className="btn-primary write-review__submit" 
                                type="submit" 
                                disabled={submitting}
                            >
                                <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
