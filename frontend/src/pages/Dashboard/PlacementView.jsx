import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { 
    Users, 
    Building2, 
    Briefcase, 
    Download, 
    Search, 
    Plus, 
    Edit2, 
    Trash2,
    CheckCircle,
    XCircle,
    MoreVertical
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import '../../utils/chartSetup';

const PlacementView = () => {
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Company form state
    const [companyForm, setCompanyForm] = useState({
        name: '', role: '', package: '', driveDate: '', status: 'Upcoming'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, companiesRes, statsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/data/all-students`),
                axios.get(`${API_BASE_URL}/data/companies`),
                axios.get(`${API_BASE_URL}/data/dashboard-stats`)
            ]);
            setStudents(studentsRes.data);
            setCompanies(companiesRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching placement data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/data/companies`, companyForm);
            alert('Company updated!');
            setCompanyForm({ name: '', role: '', package: '', driveDate: '', status: 'Upcoming' });
            fetchData();
        } catch (err) {
            alert('Error updating company.');
        }
    };

    const deleteCompany = async (id) => {
        if (!window.confirm('Delete this placement drive?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/data/companies/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    const editCompany = (comp) => {
        setCompanyForm({
            name: comp.name,
            role: comp.role,
            package: comp.package,
            driveDate: comp.driveDate ? comp.driveDate.split('T')[0] : '',
            status: comp.status
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteStudent = async (id, name) => {
        if (!window.confirm(`Delete student record for ${name}?`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/data/student/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    const markPlaced = async (id, name) => {
        const company = prompt(`Enter company for ${name}:`);
        if (!company) return;
        const pkg = prompt(`Enter package (e.g. 12 LPA):`);
        if (!pkg) return;

        try {
            await axios.post(`${API_BASE_URL}/data/update-placement-status`, {
                studentId: id,
                isPlaced: true,
                company,
                package: pkg
            });
            fetchData();
        } catch (err) {
            alert('Update failed.');
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportCSV = () => {
        let csvContent = "";
        
        // Block 1: Placement Drives
        csvContent += "=== ACTIVE PLACEMENT DRIVES ===\n";
        csvContent += "Company Name,Role,Package,Drive Date,Status\n";
        companies.forEach(c => {
            const dDate = new Date(c.driveDate).toLocaleDateString();
            csvContent += `"${c.name}","${c.role}","${c.package}","${dDate}","${c.status}"\n`;
        });
        csvContent += "\n\n";

        // Block 2: Student Placements
        csvContent += "=== STUDENT PLACEMENT RECORDS ===\n";
        csvContent += "Name,Department,CGPA,Skills,Placement Status,Company,Package\n";
        students.forEach(s => {
            const skillsStr = s.skills ? s.skills.join(', ') : 'none';
            const status = s.isPlaced ? 'Placed' : 'Seeking';
            const comp = s.placementData?.company || '-';
            const pkg = s.placementData?.package || '-';
            csvContent += `"${s.name}","${s.department}","${s.cgpa}","${skillsStr}","${status}","${comp}","${pkg}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Comprehensive_Placement_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div>Loading records...</div>;

    const departmentCounts = students.reduce((acc, student) => {
        const dept = student.department || 'Unassigned';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});
    
    const barData = {
        labels: Object.keys(departmentCounts),
        datasets: [{
            label: 'Students Enrolled',
            data: Object.values(departmentCounts),
            backgroundColor: 'rgba(79, 70, 229, 0.6)',
            borderColor: '#4f46e5',
            borderWidth: 1
        }]
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gray-900)' }}>Placement Management</h2>
                    <p style={{ color: 'var(--gray-500)' }}>Manage company drives and monitor student placement status.</p>
                </div>
                <button className="btn btn-primary" onClick={exportCSV}>
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-label"><Users size={18} /> Students Placed</div>
                    <div className="stat-card-value">{stats?.placedCount || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label"><Building2 size={18} /> Partner Companies</div>
                    <div className="stat-card-value">{stats?.totalCompanies || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label"><Briefcase size={18} /> Average Package</div>
                    <div className="stat-card-value">{stats?.avgPackage || '0 LPA'}</div>
                </div>
            </div>

            {/* Department Distribution Chart */}
            <div className="chart-card" style={{ marginBottom: '40px' }}>
                <h3>Student Distribution by Department</h3>
                <div style={{ height: '250px', padding: '16px' }}>
                    <Bar 
                        data={barData} 
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 } }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Manage Companies */}
            <div className="chart-card" style={{ marginBottom: '40px' }}>
                <h3>Manage Placement Drives</h3>
                <form onSubmit={handleCompanySubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input type="text" value={companyForm.role} onChange={e => setCompanyForm({...companyForm, role: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Package</label>
                        <input type="text" value={companyForm.package} onChange={e => setCompanyForm({...companyForm, package: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" value={companyForm.driveDate} onChange={e => setCompanyForm({...companyForm, driveDate: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select value={companyForm.status} onChange={e => setCompanyForm({...companyForm, status: e.target.value})}>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center', marginTop: '10px' }}>
                        <Plus size={18} /> Save Drive
                    </button>
                </form>
            </div>

            {/* Active Placement Drives Table */}
            <div className="chart-card" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3>Active Placement Drives</h3>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Package</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(comp => (
                                <tr key={comp._id}>
                                    <td style={{ fontWeight: '700' }}>{comp.name}</td>
                                    <td>{comp.role}</td>
                                    <td style={{ fontWeight: '600' }}>{comp.package}</td>
                                    <td>{new Date(comp.driveDate).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            background: comp.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : (comp.status === 'Ongoing' ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary-light)'),
                                            color: comp.status === 'Completed' ? 'var(--success)' : (comp.status === 'Ongoing' ? 'var(--accent)' : 'var(--primary)')
                                        }}>
                                            {comp.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn" style={{ padding: '6px', background: 'var(--primary-light)', color: 'var(--primary)' }} onClick={() => editCompany(comp)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn" style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={() => deleteCompany(comp._id)}>
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

            {/* Students Table */}
            <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3>Registered Students</h3>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--gray-400)' }} size={18} />
                        <input 
                            className="form-group" 
                            style={{ paddingLeft: '40px', marginBottom: 0 }} 
                            placeholder="Search by name or skills..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>CGPA</th>
                                <th>Top Skills</th>
                                <th>Status</th>
                                <th>Placement</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student._id}>
                                    <td>
                                        <div style={{ fontWeight: '700' }}>{student.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{student.email}</div>
                                    </td>
                                    <td>{student.department}</td>
                                    <td style={{ fontWeight: '700' }}>{student.cgpa}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {student.skills?.slice(0, 2).map((s, i) => (
                                                <span key={i} style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', fontWeight: '700' }}>
                                                    {s}
                                                </span>
                                            ))}
                                            {student.skills?.length > 2 && <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>+{student.skills.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '11px', 
                                            fontWeight: '700',
                                            background: student.isPlaced ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-100)',
                                            color: student.isPlaced ? 'var(--success)' : 'var(--gray-500)'
                                        }}>
                                            {student.isPlaced ? 'PLACED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td>
                                        {student.isPlaced ? (
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '13px' }}>{student.placementData?.company}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{student.placementData?.package}</div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => markPlaced(student._id, student.name)}
                                                className="btn" 
                                                style={{ padding: '6px', background: 'var(--primary-light)', color: 'var(--primary)' }} 
                                                title="Mark as Placed"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteStudent(student._id, student.name)}
                                                className="btn" 
                                                style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} 
                                                title="Delete Record"
                                            >
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
        </div>
    );
};

export default PlacementView;
