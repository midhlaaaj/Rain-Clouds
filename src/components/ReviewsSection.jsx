import { useState, useEffect, useRef } from 'react';
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
        review_text: "I didn't expect to cry three times reading an ebook. Souda writes about loss with such gentleness that you feel understood before you even realize it.",
    },
    {
        id: 3,
        reviewer_name: 'Meera Nair',
        review_text: "This is the kind of writing that makes you want to sit with your thoughts. Poetic, unhurried, and profoundly human. A must-read for anyone who loves literary prose.",
    },
    {
        id: 4,
        reviewer_name: 'Aisha Fathima',
        review_text: "The way she captures the essence of coastal monsoons is truly magical. I could smell the wet earth through her words. A brilliant debut collection.",
    },
    {
        id: 5,
        reviewer_name: 'Karthik R',
        review_text: "A beautiful exploration of grief woven into the tapestry of everyday life. These 12 units felt like a warm embrace on a cold evening.",
    },
    {
        id: 6,
        reviewer_name: 'Sarah Thomas',
        review_text: "I read this in one sitting but haven't stopped thinking about it for a week. The simplicity of the language masks profound emotional depths.",
    }
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

    // Auto-scroll logic
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemsPerView = windowWidth <= 768 ? 1 : 3;
    const originalLength = reviews.length;

    // The main auto-scroll timer
    useEffect(() => {
        if (loading || originalLength <= itemsPerView || isHovered) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prev) => prev + 1);
        }, 5000); // Scroll every 5 seconds

        return () => clearInterval(interval);
    }, [loading, originalLength, isHovered, itemsPerView]);

    // The seamless wrap-around logic
    useEffect(() => {
        // When we reach the exact clone of the beginning
        if (currentIndex === originalLength) {
            const timeout = setTimeout(() => {
                // Disable transition and snap back to the real beginning
                setIsTransitioning(false);
                setCurrentIndex(0);
            }, 800); // 800ms matches the CSS transition duration

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, originalLength]);

    const extendedReviews = [...reviews, ...reviews];

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
                    <div
                        className={`reviews__carousel ${isTransitioning ? 'reviews__carousel--transitioning' : ''}`}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ '--current-index': currentIndex }}
                    >
                        <div className="reviews__carousel-track">
                            {extendedReviews.map((r, index) => (
                                <div className="reviews__carousel-item" key={`${r.id}-${index}`}>
                                    <ReviewCard name={r.reviewer_name} text={r.review_text} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
