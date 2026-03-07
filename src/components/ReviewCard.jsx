import './ReviewCard.css';

export default function ReviewCard({ name, text, delay = 0 }) {
    return (
        <div className="review-card" style={{ animationDelay: `${delay}s` }}>
            <div className="review-card__quote review-card__quote--open">"</div>
            <p className="review-card__text">{text}</p>
            <div className="review-card__quote review-card__quote--close">"</div>
            <div className="review-card__footer">
                <div className="review-card__avatar">
                    {name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="review-card__name">{name}</span>
            </div>
        </div>
    );
}
