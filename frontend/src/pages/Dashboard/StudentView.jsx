import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { 
    Radar, 
    Bar, 
    Doughnut 
} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement
} from 'chart.js';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    BookOpen, 
    Trophy,
    Save
} from 'lucide-react';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement
);

const StudentView = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        department: 'Computer Science',
        batch: '',
        cgpa: '',
        skills: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, analysisRes, companiesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/data/student/${user.username}`),
                    axios.get(`${API_BASE_URL}/data/student-analysis/${user.username}`),
                    axios.get(`${API_BASE_URL}/data/companies`)
                ]);
                
                setStudent(studentRes.data);
                setAnalysis(analysisRes.data);
                setCompanies(companiesRes.data);
                
                if (studentRes.data) {
                    setFormData({
                        email: studentRes.data.email || '',
                        phone: studentRes.data.phone || '',
                        department: studentRes.data.department || 'Computer Science',
                        batch: studentRes.data.batch || '',
                        cgpa: studentRes.data.cgpa || '',
                        skills: studentRes.data.skills ? studentRes.data.skills.join(', ') : ''
                    });
                }
            } catch (err) {
                console.error('Error fetching student data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.username]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                name: user.username,
                cgpa: parseFloat(formData.cgpa),
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
            };
            const res = await axios.post(`${API_BASE_URL}/data/register-placement`, dataToSave);
            if (res.data.success) {
                alert('Profile updated successfully!');
                
                // Immediately refresh student and analysis data to reflect changes in UI cards
                const [studentRes, analysisRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/data/student/${user.username}`),
                    axios.get(`${API_BASE_URL}/data/student-analysis/${user.username}`)
                ]);
                
                setStudent(studentRes.data);
                setAnalysis(analysisRes.data);
            }
        } catch (err) {
            console.error('Save error details:', err.response?.data || err.message);
            const msg = err.response?.data?.message || 'Failed to save profile. Please check if the backend server is running.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading your analytics...</div>;

    const radarData = {
        labels: ["Technical", "Communication", "Problem Solving", "Teamwork", "Projects"],
        datasets: [
            {
                label: 'Your Profile',
                data: [
                    student?.skills ? Math.min(student.skills.length * 20, 100) : 40,
                    70,
                    student?.cgpa ? (student.cgpa / 10) * 100 : 50,
                    85,
                    60
                ],
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: '#4f46e5',
                pointBackgroundColor: '#4f46e5',
            },
            {
                label: 'Industry Target',
                data: [80, 80, 85, 80, 75],
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10b981',
                borderDash: [5, 5],
            }
        ]
    };

    const bestMatch = analysis?.bestMatch;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)' }}>Student Analytics</h2>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-label"><Trophy size={18} /> Current CGPA</div>
                    <div className="stat-card-value">{student?.cgpa || 'N/A'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label"><BookOpen size={18} /> Department</div>
                    <div className="stat-card-value" style={{ fontSize: '20px' }}>{student?.department || 'Not Set'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label"><CheckCircle size={18} /> Placement Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '14px', 
                            fontWeight: '700',
                            background: student?.isPlaced ? 'var(--success)' : 'var(--gray-100)',
                            color: student?.isPlaced ? 'white' : 'var(--gray-500)'
                        }}>
                            {student?.isPlaced ? 'Placed' : 'Eligible'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Career Match Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '40px' }}>
                <div className="chart-card">
                    <h3>Top Career Match & Skill Gap</h3>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{bestMatch?.jobRole || 'No Data'}</div>
                            <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '8px' }}>
                                Match Score: <span style={{ fontWeight: '700', color: 'var(--success)' }}>{bestMatch?.matchPercentage || 0}%</span>
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>
                                Avg. Package: <span style={{ fontWeight: '700', color: 'var(--gray-900)' }}>{bestMatch?.averagePackage || 'N/A'}</span>
                            </div>
                            
                            <div style={{ marginTop: '24px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Missing Skills to Acquire:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {bestMatch?.missingSkills?.map((skill, idx) => (
                                        <span key={idx} style={{ 
                                            padding: '6px 12px', 
                                            background: 'rgba(239, 68, 68, 0.1)', 
                                            color: 'var(--danger)', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600' 
                                        }}>
                                            {skill}
                                        </span>
                                    )) || <span>Saving your profile will generate analysis.</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '200px' }}>
                            <Doughnut 
                                data={{
                                    labels: ['Matched', 'Missing'],
                                    datasets: [{
                                        data: [bestMatch?.matchedSkills?.length || 0, bestMatch?.missingSkills?.length || 0],
                                        backgroundColor: ['#10b981', '#ef4444'],
                                        borderWidth: 0
                                    }]
                                }}
                                options={{ cutout: '70%', plugins: { legend: { display: false } } }}
                            />
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Skill Profile Radar</h3>
                    <Radar data={radarData} options={{ scales: { r: { beginAtZero: true, max: 100 } } }} />
                </div>
            </div>

            {/* Registration Form */}
            <div className="chart-card" style={{ marginBottom: '40px' }}>
                <h3>Complete Your Placement Profile</h3>
                <form onSubmit={handleFormSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="email@university.edu" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="9876543210" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <select 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                required
                            >
                                <option value="Computer Science">Computer Science</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Mechanical">Mechanical</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Batch Year</label>
                            <input 
                                type="number" 
                                value={formData.batch}
                                onChange={(e) => setFormData({...formData, batch: e.target.value})}
                                placeholder="2026" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Current CGPA</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={formData.cgpa}
                                onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                                placeholder="8.5" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Skills (Comma separated)</label>
                            <input 
                                type="text" 
                                value={formData.skills}
                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                placeholder="Java, Python, SQL" 
                                required 
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ marginTop: '12px' }}
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Placement Profile'}
                    </button>
                </form>
            </div>

            {/* Upcoming Drives */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Upcoming Placement Drives</h3>
                <div className="stats-grid">
                    {companies.map(company => (
                        <div key={company._id} className="stat-card" style={{ borderLeft: `4px solid ${company.status === 'Upcoming' ? 'var(--primary)' : 'var(--success)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase' }}>{company.status}</span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>{company.package}</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '12px' }}>{company.name}</div>
                            <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '4px' }}>{company.role}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: 'var(--gray-500)' }}>
                                <Clock size={14} />
                                {new Date(company.driveDate).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentView;
