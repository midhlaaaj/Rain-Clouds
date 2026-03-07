import './AboutAuthor.css';

export default function AboutAuthor() {
    return (
        <section className="about">
            <div className="about__inner container">
                <div className="about__image-col">
                    <div className="about__image-wrap">
                        <img src="/author-photo.png" alt="Author of Rain Clouds" className="about__image" />
                        <div className="about__image-badge">
                            <span>✍️</span>
                            <span>Author</span>
                        </div>
                    </div>
                </div>

                <div className="about__content">
                    <p className="about__eyebrow">About the Author</p>
                    <h2 className="about__name">Ananya Rajan</h2>
                    <div className="about__divider" />
                    <p className="about__bio">
                        Ananya Rajan is a poet and storyteller from the coastal town of Mangalore, where
                        the monsoon rains shaped her earliest memories. Her writing lives in the space
                        between the whispered and the unspoken — intimate, sincere, and deeply human.
                    </p>
                    <p className="about__bio">
                        <em>Rain Clouds</em> is her debut ebook, a carefully curated collection of poems
                        and prose essays exploring love, grief, memory, and the quiet beauty of
                        everyday moments. It is a book for those who find solace in soft rain
                        and the smell of wet earth.
                    </p>
                    <div className="about__stats">
                        <div className="about__stat">
                            <span className="about__stat-number">60+</span>
                            <span className="about__stat-label">Pages</span>
                        </div>
                        <div className="about__stat">
                            <span className="about__stat-number">24</span>
                            <span className="about__stat-label">Poems</span>
                        </div>
                        <div className="about__stat">
                            <span className="about__stat-number">8</span>
                            <span className="about__stat-label">Prose Essays</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
