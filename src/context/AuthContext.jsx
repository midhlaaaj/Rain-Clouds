import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);

    // Internal check functions moved above effects for clarity
    async function checkAdmin(userId) {
        if (!userId) return;
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

    async function checkPurchase(email) {
        if (!email) return;
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('checkPurchase timeout')), 5000)
        );
        const query = supabase
            .from('payments')
            .select('status')
            .eq('user_email', email)
            .eq('status', 'success')
            .limit(1);

        try {
            const { data } = await Promise.race([query, timeout]);
            setHasPurchased(data && data.length > 0);
        } catch (e) {
            console.warn('checkPurchase failed:', e.message);
            setHasPurchased(false);
        }
    }

    useEffect(() => {
        // Initial session check with safety timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));

        Promise.race([sessionPromise, timeoutPromise]).then((result) => {
            const session = result?.data?.session;
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false); 

            if (currentUser) {
                checkAdmin(currentUser.id);
                checkPurchase(currentUser.email);
            }
        });

        // Background listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                checkAdmin(currentUser.id);
                checkPurchase(currentUser.email);
            } else {
                setIsAdmin(false);
                setHasPurchased(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function signOut() {
        await supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, hasPurchased, checkPurchase, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

