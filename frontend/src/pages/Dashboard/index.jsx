import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, ChevronDown } from 'lucide-react';
import Overview from './Overview';
import StudentView from './StudentView';
import PlacementView from './PlacementView';
import AdminView from './AdminView';

const Dashboard = () => {
    const { user } = useAuth();

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
                        Performance Overview
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--gray-400)',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <Bell size={20} />
                            <span style={{ 
                                position: 'absolute', 
                                top: '-2px', 
                                right: '-2px', 
                                width: '8px', 
                                height: '8px', 
                                background: 'var(--danger)', 
                                borderRadius: '50%',
                                border: '2px solid white'
                            }}></span>
                        </button>
                        
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
