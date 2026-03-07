import './ReviewCard.css';

export default function ReviewCard({ name, text, delay = 0 }) {
    return (
        <div className="review-card" style={{ animationDelay: `${delay}s` }}>
            <div className="review-card__quote review-card__quote--open">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.75 3C14.75 3 17.5 5.5 17.5 9c0 4-3.5 10-8.5 12l-1.5-1.5c4-2 6-6 6-9h-4.5V3h11.75zM2.75 3C5.75 3 8.5 5.5 8.5 9c0 4-3.5 10-8.5 12L-1.5 19.5c4-2 6-6 6-9H0V3h2.75z" />
                </svg>
            </div>
            <p className="review-card__text">{text}</p>
            <div className="review-card__quote review-card__quote--close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.25 21c-3-0-5.75-2.5-5.75-6 0-4 3.5-10 8.5-12l1.5 1.5c-4 2-6 6-6 9h4.5v7.5H12.25zM21.25 21c-3 0-5.75-2.5-5.75-6 0-4 3.5-10 8.5-12l1.5 1.5c-4 2-6 6-6 9H17v7.5h4.25z" />
                </svg>
            </div>
            <div className="review-card__footer">
                <div className="review-card__avatar">
                    {name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="review-card__name">{name}</span>
            </div>
        </div>
    );
}
