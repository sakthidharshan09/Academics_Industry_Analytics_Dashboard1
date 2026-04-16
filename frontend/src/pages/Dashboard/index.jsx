import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, ChevronDown, Circle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import Overview from './Overview';
import StudentView from './StudentView';
import PlacementView from './PlacementView';
import AdminView from './AdminView';

const Dashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/data/notifications?role=${user.role}`);
                setNotifications(res.data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };
        fetchNotifications();
        
        // Optional: Polling every 30s could be added here, but leaving as mount-only for demo
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('overview')) return 'Platform Overview';
        if (path.includes('student')) return 'Student Profile & Analytics';
        if (path.includes('placement')) return 'Placement Officer Dashboard';
        if (path.includes('admin')) return 'System Administration';
        return 'Dashboard';
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="main-content">
                <header style={{ 
                    height: '80px', 
                    background: 'white', 
                    borderBottom: '1px solid var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gray-900)' }}>
                        {getPageTitle()}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        
                        {/* Notifications Dropdown */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: showNotifications ? 'var(--primary)' : 'var(--gray-400)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s'
                                }}
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: '-4px', 
                                        right: '-4px', 
                                        background: 'var(--danger)', 
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        minWidth: '16px',
                                        height: '16px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid white'
                                    }}>
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '40px',
                                    right: '-10px',
                                    width: '320px',
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--gray-200)',
                                    overflow: 'hidden',
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Notifications</h3>
                                        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => setNotifications([])}>Clear All</span>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>
                                                No new notifications.
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif._id} style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-light">
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }}></div>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-900)' }}>{notif.title}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px', lineHeight: '1.4' }}>{notif.message}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '6px', fontWeight: '600' }}>
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--gray-100)', fontSize: '13px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', background: 'var(--gray-50)' }}>
                                        View All Activity
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }} className="user-profile-btn">
                            <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                background: 'var(--primary-light)', 
                                color: 'var(--primary)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <User size={20} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-900)', lineHeight: '1' }}>{user?.username}</div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)', marginTop: '4px' }}>{user?.role}</div>
                            </div>
                            <ChevronDown size={14} color="var(--gray-400)" />
                        </div>
                    </div>
                </header>

                <div className="content-body">
                    <Routes>
                        <Route path="overview" element={<Overview />} />
                        <Route path="student" element={<StudentView />} />
                        <Route path="placement" element={<PlacementView />} />
                        <Route path="admin" element={<AdminView />} />
                        <Route path="/" element={<Navigate to="overview" />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
