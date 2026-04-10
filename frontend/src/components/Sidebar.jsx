import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    GraduationCap, 
    Briefcase, 
    Settings, 
    BarChart3, 
    Bell, 
    LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard/overview' },
        { id: 'student', label: 'Student View', icon: <GraduationCap size={20} />, path: '/dashboard/student', roles: ['Student', 'Admin'] },
        { id: 'placement', label: 'Placement View', icon: <Briefcase size={20} />, path: '/dashboard/placement', roles: ['Placement Officer', 'Admin'] },
        { id: 'admin', label: 'Admin View', icon: <Settings size={20} />, path: '/dashboard/admin', roles: ['Admin'] },
        { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, path: '/dashboard/reports' },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/dashboard/notifications' },
    ];

    const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ 
                height: '80px', 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 24px',
                fontSize: '18px',
                fontWeight: '800',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
            }}>
                AIAD DASHBOARD
            </div>
            
            <nav style={{ flex: 1, padding: '24px 12px' }}>
                <div style={{ marginBottom: '12px', padding: '0 16px', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Main Menu
                </div>
                {filteredMenu.map(item => (
                    <NavLink 
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            marginBottom: '4px',
                            borderRadius: '12px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        activeStyle={{
                            background: 'var(--primary)',
                            color: 'white'
                        }}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button 
                    onClick={logout}
                    className="btn"
                    style={{ 
                        width: '100%', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: 'var(--danger)',
                        justifyContent: 'flex-start',
                        padding: '12px 16px'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
