import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_LINKS = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/dashboard', label: 'Dashboard', icon: '📚' },
    { to: '/signin', label: 'Sign In', icon: '🔐' },
];

export default function Sidebar({ isOpen, onClose }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    async function handleSignOut() {
        onClose();
        await signOut();
        navigate('/');
    }

    return (
        <>
            {isOpen && <div className="overlay" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                {/* Header */}
                <div className="sidebar__header">
                    <span className="sidebar__brand">☁ Rain Clouds</span>
                    <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* User greeting */}
                {user && (
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="sidebar__user-email">{user.email}</p>
                            <p className="sidebar__user-label">Signed in</p>
                        </div>
                    </div>
                )}

                {/* Nav links */}
                <nav className="sidebar__nav">
                    {NAV_LINKS.filter(l => {
                        if (l.to === '/signin' && user) return false;
                        return true;
                    }).map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="sidebar__link"
                            onClick={onClose}
                        >
                            <span className="sidebar__link-icon">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}

                    {user && (
                        <button className="sidebar__link sidebar__link--signout" onClick={handleSignOut}>
                            <span className="sidebar__link-icon">🚪</span>
                            Sign Out
                        </button>
                    )}
                </nav>

                {/* Footer */}
                <div className="sidebar__footer">
                    <p>© 2025 Rain Clouds</p>
                    <p>All rights reserved</p>
                </div>
            </aside>
        </>
    );
}
