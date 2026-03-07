import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_LINKS = [
    {
        to: '/',
        label: 'Home',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        to: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
            </svg>
        )
    },
    {
        to: '/signin',
        label: 'Sign In',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
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
                    <span className="sidebar__brand">Rain Clouds</span>
                    <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>


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
                            <span className="sidebar__link-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
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
