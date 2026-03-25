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
    const [selectedReview, setSelectedReview] = useState(null);

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
    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemsPerView = windowWidth <= 768 ? 1 : 3;
    const originalLength = reviews.length;

    // Multiply reviews to give a continuous feeling
    const extendedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

    // The main auto-scroll timer
    useEffect(() => {
        if (loading || originalLength <= itemsPerView || isHovered) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                
                // If we reach near the end, smooth scroll back to the start
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const itemElement = scrollRef.current.children[0];
                    if (itemElement) {
                         const itemWidth = itemElement.offsetWidth + 24; // 24px is gap
                         scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
                    }
                }
            }
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
    }, [loading, originalLength, isHovered, itemsPerView]);

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
                        className="reviews__carousel"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="reviews__carousel-track" ref={scrollRef}>
                            {extendedReviews.map((r, index) => (
                                <div className="reviews__carousel-item" key={`${r.id}-${index}`}>
                                    <ReviewCard 
                                        name={r.reviewer_name} 
                                        text={r.review_text} 
                                        onCardClick={() => setSelectedReview(r)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedReview && (
                <div className="reviews-modal" onClick={() => setSelectedReview(null)}>
                    <div className="reviews-modal__content" onClick={(e) => e.stopPropagation()}>
                        <ReviewCard 
                            name={selectedReview.reviewer_name} 
                            text={selectedReview.review_text} 
                            isModal={true} 
                        />
                        <button 
                            className="reviews-modal__close" 
                            onClick={() => setSelectedReview(null)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
