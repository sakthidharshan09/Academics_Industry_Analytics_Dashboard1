import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { 
    Activity, 
    TrendingUp, 
    Settings2, 
    Trash2, 
    Edit2, 
    PlusCircle,
    BarChart,
    PieChart,
    Users,
    Download
} from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';

const AdminView = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Trend form state
    const [trendForm, setTrendForm] = useState({
        jobRole: '', 
        requiredSkills: '', 
        averagePackage: '', 
        demandLevel: 'High',
        _id: null
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, activityRes, trendRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/data/dashboard-stats`),
                axios.get(`${API_BASE_URL}/data/activities`),
                axios.get(`${API_BASE_URL}/data/industry-trends`)
            ]);
            setStats(statsRes.data);
            setActivities(activityRes.data);
            setTrends(trendRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTrendSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...trendForm,
                requiredSkills: trendForm.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '')
            };
            await axios.post(`${API_BASE_URL}/data/industry-trends`, data);
            alert(trendForm._id ? 'Trend updated' : 'Trend added');
            setTrendForm({ jobRole: '', requiredSkills: '', averagePackage: '', demandLevel: 'High', _id: null });
            fetchAdminData();
        } catch (err) {
            alert('Error saving trend.');
        }
    };

    const deleteTrend = async (id) => {
        if (!window.confirm('Delete this industry trend?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/data/industry-trends/${id}`);
            fetchAdminData();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    const editTrend = (trend) => {
        setTrendForm({
            ...trend,
            requiredSkills: trend.requiredSkills.join(', ')
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const exportAuditReport = () => {
        const headers = "Date,Time,User,Role,Action,Details\n";
        const rows = activities.map(act => {
            const date = new Date(act.createdAt).toLocaleDateString();
            const time = new Date(act.createdAt).toLocaleTimeString();
            return `"${date}","${time}","${act.user}","${act.role}","${act.action}","${act.details}"`;
        }).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'system_activity_audit.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div>Loading system administration...</div>;

    const usageData = {
        labels: ['Placed', 'Not Placed', 'Faculty', 'Admins'],
        datasets: [{
            data: [stats?.placedCount || 0, stats?.notPlacedCount || 0, stats?.totalFaculty || 0, 2],
            backgroundColor: ['#10b981', '#ef4444', '#4f46e5', '#f59e0b'],
            borderWidth: 0
        }]
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)' }}>System Administration</h2>
                    <p style={{ color: 'var(--gray-500)' }}>Manage industry data trends and monitor system activity.</p>
                </div>
                <button className="btn btn-primary" onClick={exportAuditReport}>
                    <Download size={18} />
                    Export Activity Audit
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-label"><Users size={18} /> Total Users</div>
                    <div className="stat-card-value">{stats?.totalStudents + stats?.totalFaculty || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label"><Activity size={18} /> Recent Activities</div>
                    <div className="stat-card-value">{activities.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label"><TrendingUp size={18} /> Industry Roles</div>
                    <div className="stat-card-value">{trends.length}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                <div className="chart-card">
                    <h3>System Usage Distribution</h3>
                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                        <Pie data={usageData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
                
                <div className="chart-card">
                    <h3>Recent System Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activities.slice(0, 6).map((act, idx) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '12px',
                                background: 'var(--gray-50)',
                                borderRadius: '12px',
                                borderLeft: `3px solid ${act.role === 'Student' ? 'var(--primary)' : 'var(--accent)'}`
                            }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{act.user}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{act.action}: {act.details}</div>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Manage Industry Trends */}
            <div className="chart-card" style={{ marginBottom: '40px' }}>
                <h3>{trendForm._id ? 'Edit Industry Trend' : 'Add New Industry Trend'}</h3>
                <form onSubmit={handleTrendSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="form-group">
                            <label>Job Role</label>
                            <input 
                                type="text" 
                                value={trendForm.jobRole} 
                                onChange={e => setTrendForm({...trendForm, jobRole: e.target.value})} 
                                placeholder="e.g. AI Engineer" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Avg. Package</label>
                            <input 
                                type="text" 
                                value={trendForm.averagePackage} 
                                onChange={e => setTrendForm({...trendForm, averagePackage: e.target.value})} 
                                placeholder="e.g. 18 LPA" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Demand Level</label>
                            <select 
                                value={trendForm.demandLevel} 
                                onChange={e => setTrendForm({...trendForm, demandLevel: e.target.value})}
                            >
                                <option value="High">High Demand</option>
                                <option value="Medium">Medium Demand</option>
                                <option value="Low">Low Demand</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Required Skills (Comma separated)</label>
                            <input 
                                type="text" 
                                value={trendForm.requiredSkills} 
                                onChange={e => setTrendForm({...trendForm, requiredSkills: e.target.value})} 
                                placeholder="e.g. PyTorch, TensorFlow, Mathematics" 
                                required 
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button type="submit" className="btn btn-primary">
                            {trendForm._id ? <Settings2 size={18} /> : <PlusCircle size={18} />}
                            {trendForm._id ? 'Update Trend' : 'Create Trend'}
                        </button>
                        {trendForm._id && (
                            <button type="button" className="btn" onClick={() => setTrendForm({ jobRole: '', requiredSkills: '', averagePackage: '', demandLevel: 'High', _id: null })}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Job Role</th>
                            <th>Required Skills</th>
                            <th>Avg. Package</th>
                            <th>Demand</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trends.map(trend => (
                            <tr key={trend._id}>
                                <td style={{ fontWeight: '700' }}>{trend.jobRole}</td>
                                <td style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                                    {trend.requiredSkills?.join(', ')}
                                </td>
                                <td style={{ fontWeight: '700' }}>{trend.averagePackage}</td>
                                <td>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '11px', 
                                        fontWeight: '700',
                                        background: trend.demandLevel === 'High' ? 'rgba(16, 185, 129, 0.1)' : (trend.demandLevel === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                        color: trend.demandLevel === 'High' ? 'var(--success)' : (trend.demandLevel === 'Medium' ? 'var(--accent)' : 'var(--danger)')
                                    }}>
                                        {trend.demandLevel.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn" style={{ padding: '6px', background: 'var(--primary-light)', color: 'var(--primary)' }} onClick={() => editTrend(trend)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn" style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={() => deleteTrend(trend._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminView;
