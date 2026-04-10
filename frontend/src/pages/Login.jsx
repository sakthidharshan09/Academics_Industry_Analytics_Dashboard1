import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Server, LogIn } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');
    const { login, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await axios.get('/api/health');
                if (res.data.status === 'ok') setServerStatus('online');
                else setServerStatus('offline');
            } catch (err) {
                setServerStatus('offline');
            }
        };
        checkHealth();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsConnecting(true);
        const success = await login(username, password, role);
        setIsConnecting(false);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        padding: '12px', 
                        background: 'rgba(79, 70, 229, 0.1)', 
                        borderRadius: '16px',
                        color: 'var(--primary)',
                        marginBottom: '16px'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)', marginBottom: '8px' }}>
                        AIAD Login
                    </h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '15px' }}>
                        Academic Industry Analytics Dashboard
                    </p>
                    
                    <div style={{ 
                        marginTop: '16px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: serverStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : (serverStatus === 'checking' ? 'var(--gray-100)' : 'rgba(239, 68, 68, 0.1)'),
                        color: serverStatus === 'online' ? 'var(--success)' : (serverStatus === 'checking' ? 'var(--gray-400)' : 'var(--danger)')
                    }}>
                        <Server size={12} />
                        {serverStatus === 'online' ? 'System Online' : (serverStatus === 'checking' ? 'Checking Status...' : 'System Offline')}
                    </div>
                </div>

                {error && (
                    <div style={{ 
                        padding: '12px 16px', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: 'var(--danger)', 
                        borderRadius: '12px', 
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '20px',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            placeholder="Enter your username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Select Role</label>
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="" disabled>Choose your role</option>
                            <option value="Student">Student</option>
                            <option value="Placement Officer">Placement Officer</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={isConnecting || serverStatus !== 'online'}
                    >
                        {isConnecting ? 'Signing In...' : 'Sign In'}
                        {!isConnecting && <LogIn size={18} />}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--gray-500)' }}>
                        <p>Auto-registration enabled for demo purposes.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
