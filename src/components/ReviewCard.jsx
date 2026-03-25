import './ReviewCard.css';

export default function ReviewCard({ name, text, delay = 0, onCardClick, isModal = false }) {
    const limit = 120;
    const isLong = text?.length > limit;
    const displayText = !isModal && isLong ? text.substring(0, limit) + "..." : text;

    return (
        <div 
            className={`review-card ${isModal ? 'review-card--modal' : ''}`} 
            style={{ animationDelay: `${delay}s` }}
            onClick={() => onCardClick && onCardClick()}
        >
            <div className="review-card__quote review-card__quote--open">
                &ldquo;
            </div>
            <p className="review-card__text">
                {displayText}
                {!isModal && isLong && (
                    <span className="review-card__read-more"> Read More</span>
                )}
            </p>
            <div className="review-card__quote review-card__quote--close">
                &rdquo;
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
