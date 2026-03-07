import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            try {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await checkAdmin(session.user.id);
                }
            } catch (e) {
                console.warn('Auth init error:', e);
            } finally {
                setLoading(false); // always unblock the app
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await checkAdmin(session.user.id);
                } else {
                    setIsAdmin(false);
                }
            } catch (e) {
                console.warn('Auth change error:', e);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Checks admin role with a 5-second timeout so it never hangs the app
    async function checkAdmin(userId) {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('checkAdmin timeout')), 5000)
        );
        const query = supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

        try {
            const { data } = await Promise.race([query, timeout]);
            setIsAdmin(data?.role === 'admin');
        } catch (e) {
            console.warn('checkAdmin failed:', e.message);
            setIsAdmin(false);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

