import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    Briefcase, 
    TrendingUp, 
    Award,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ 
                padding: '12px', 
                background: `${color}15`, 
                color: color, 
                borderRadius: '12px' 
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '12px', 
                    fontWeight: '700',
                    color: trend > 0 ? 'var(--success)' : 'var(--danger)'
                }}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div style={{ marginTop: '20px' }}>
            <div className="stat-card-label">{title}</div>
            <div className="stat-card-value">{value}</div>
        </div>
    </div>
);

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/data/dashboard-stats');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading statistics...</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)' }}>Welcome Back!</h2>
                <p style={{ color: 'var(--gray-500)', marginTop: '4px' }}>Here's an overview of the system performance today.</p>
            </div>

            <div className="stats-grid">
                <StatCard 
                    title="Total Students" 
                    value={stats?.totalStudents || 0} 
                    icon={<Users size={24} />} 
                    trend={12} 
                    color="#4f46e5" 
                />
                <StatCard 
                    title="Companies Visited" 
                    value={stats?.totalCompanies || 0} 
                    icon={<Briefcase size={24} />} 
                    trend={5} 
                    color="#0ea5e9" 
                />
                <StatCard 
                    title="Placed Count" 
                    value={stats?.placedCount || 0} 
                    icon={<Award size={24} />} 
                    trend={8} 
                    color="#10b981" 
                />
                <StatCard 
                    title="Average Package" 
                    value={stats?.avgPackage || '0 LPA'} 
                    icon={<TrendingUp size={24} />} 
                    trend={15} 
                    color="#f59e0b" 
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="chart-card">
                    <h3>Placement Success Rate</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', borderRadius: '12px', color: 'var(--gray-400)' }}>
                        Chart will be rendered here (Integrated in next step)
                    </div>
                </div>
                
                <div className="chart-card">
                    <h3>Recent Announcements</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>Upcoming Drive: Google Cloud</div>
                                <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>Registration ends by Friday. Ensure your profile is updated.</p>
                                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', marginTop: '8px', display: 'inline-block' }}>2 hours ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
