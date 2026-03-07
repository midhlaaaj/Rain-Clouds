import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <span className="footer__brand-icon">☁</span>
                        <span className="footer__brand-name">Rain Clouds</span>
                    </div>
                    <p className="footer__tagline">
                        Words that drift like clouds,<br />feelings that fall like rain.
                    </p>
                </div>

                <div className="footer__divider" />

                <div className="footer__bottom">
                    <p className="footer__copy">© 2025 Rain Clouds. All rights reserved.</p>
                    <nav className="footer__nav">
                        <Link to="/">Home</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/signin">Sign In</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
