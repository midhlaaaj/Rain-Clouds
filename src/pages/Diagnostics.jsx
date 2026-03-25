import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, AlertCircle, CheckCircle } from 'lucide-react';

export default function Diagnostics() {
    const { user } = useAuth();
    const [status, setStatus] = useState({
        userLoading: true,
        roleCheck: 'waiting',
        paymentsCheck: 'waiting',
        paymentsCount: 0,
        error: null
    });

    useEffect(() => {
        if (!user) return;
        runDiagnostics();
    }, [user]);

    async function runDiagnostics() {
        try {
            // 1. Check Role
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            
            // 2. Check Payments (Raw count, ignore status filter)
            const { count, error: payError } = await supabase
                .from('payments')
                .select('*', { count: 'exact', head: true });

            setStatus({
                userLoading: false,
                roleCheck: roleError ? 'error' : (roleData ? `Success: ${roleData.role}` : 'Not found in user_roles'),
                paymentsCheck: payError ? `Error: ${payError.message}` : 'Success',
                paymentsCount: count || 0,
                error: (roleError || payError)?.message || null
            });
        } catch (err) {
            setStatus(s => ({ ...s, error: err.message }));
        }
    }

    if (!user) return <div className="container">Please sign in to run diagnostics.</div>;

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to Admin
            </Link>
            <h1 style={{ marginBottom: '30px' }}>System Diagnostics</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Shield size={20} color="#4a90d9" /> Authentication & Roles
                    </h3>
                    <p><strong>Signed in as:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> <code>{user.id}</code></p>
                    <p><strong>Role in Database:</strong> {status.roleCheck}</p>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Database size={20} color="#10b981" /> Database Status
                    </h3>
                    <p><strong>Total Rows in `payments` table:</strong> {status.paymentsCount}</p>
                    <p><strong>Connection Status:</strong> {status.paymentsCheck}</p>
                    {status.error && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#fff5f5', color: '#e53e3e', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} />
                            <span><strong>Error:</strong> {status.error}</span>
                        </div>
                    )}
                </div>

                {status.paymentsCount === 0 && !status.error && (
                    <div style={{ background: '#e6fffa', padding: '24px', borderRadius: '16px', border: '1px solid #b2f5ea' }}>
                        <h4 style={{ color: '#2c7a7b', marginBottom: '10px' }}>Analysis:</h4>
                        <p style={{ margin: 0 }}>
                            The connection is working, but the `payments` table is **empty**. 
                            This means the record synchronization from Razorpay hasn't happened yet.
                        </p>
                        <Link to="/api/sync" target="_blank" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                            Run Data Sync Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
