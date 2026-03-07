import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ReviewCard from './ReviewCard';
import './ReviewsSection.css';

const FALLBACK_REVIEWS = [
    {
        id: 1,
        reviewer_name: 'Priya Menon',
        review_text: "Rain Clouds feels like curling up by a window during a monsoon. Every poem is a quiet thunderclap — it hits you softly but leaves an echo that stays for days.",
    },
    {
        id: 2,
        reviewer_name: 'Rohan Sharma',
        review_text: "I didn't expect to cry three times reading an ebook. Ananya writes about loss with such gentleness that you feel understood before you even realize it.",
    },
    {
        id: 3,
        reviewer_name: 'Meera Nair',
        review_text: "This is the kind of writing that makes you want to sit with your thoughts. Poetic, unhurried, and profoundly human. A must-read for anyone who loves literary prose.",
    },
];

export default function ReviewsSection() {
    const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                setReviews(data);
            }
            setLoading(false);
        }
        fetchReviews();
    }, []);

    return (
        <section className="reviews">
            <div className="reviews__inner container">
                <div className="reviews__header">
                    <p className="reviews__eyebrow">What Readers Say</p>
                    <h2 className="reviews__title">Loved by Readers</h2>
                    <p className="reviews__subtitle">
                        Join hundreds of readers who found something of themselves in these pages.
                    </p>
                </div>

                {loading ? (
                    <div className="reviews__loading">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="reviews__grid">
                        {reviews.map((r, i) => (
                            <ReviewCard
                                key={r.id}
                                name={r.reviewer_name}
                                text={r.review_text}
                                delay={i * 0.12}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
