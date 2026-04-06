// Dashboard logic for AIAD

const dummyData = {
    student: {
        cgpa: 8.2,
        skills: ["Java", "Python", "Data Analysis"],
        requiredSkills: ["Java", "Python", "Machine Learning", "SQL"],
        placed: 75,
        notPlaced: 25,
    },
    faculty: {
        studentPerformance: [
            { name: "Alice", cgpa: 8.5 },
            { name: "Bob", cgpa: 7.2 },
            { name: "Carol", cgpa: 9.1 },
            { name: "David", cgpa: 6.8 },
            { name: "Eve", cgpa: 8.9 }
        ],
        skillTrends: [
            { label: 'Jan', coverage: 65 },
            { label: 'Feb', coverage: 68 },
            { label: 'Mar', coverage: 75 },
            { label: 'Apr', coverage: 82 },
            { label: 'May', coverage: 88 }
        ],
        curriculumSkills: ["Java", "Python", "SQL", "Web Dev", "ML"],
        skillGapData: [85, 90, 70, 60, 40]
    },
    placement: {
        placedStudents: 120,
        companiesVisited: 30,
        highestPackage: "20 LPA",
        averagePackage: "8 LPA",
        yearlyTrends: [
            { year: 2018, count: 80 },
            { year: 2019, count: 90 },
            { year: 2020, count: 100 },
            { year: 2021, count: 110 },
            { year: 2022, count: 120 }
        ]
    },
    admin: {
        totalStudents: 500,
        totalFaculty: 30,
        placedStudents: 300,
        notPlacedStudents: 200,
        usage: [
            { label: 'Logins', value: 1200 },
            { label: 'Reports Generated', value: 80 },
            { label: 'Notifications Sent', value: 45 }
        ],
        recentActivity: [
            { user: "John Doe", action: "Registered for Placement", time: "10m ago" },
            { user: "Jane Smith", action: "Updated Profile", time: "45m ago" },
            { user: "Alex Wong", action: "Marked as Placed", time: "2h ago" }
        ]
    },
    notifications: [
        { title: "Placement Drive", msg: "New placement drive scheduled for next Monday.", time: "2h ago" },
        { title: "Academic Audit", msg: "Annual academic audit will take place next week.", time: "1d ago" },
        { title: "Maintenance", msg: "System maintenance scheduled for tonight at 12:00 AM.", time: "3d ago" }
    ],
    reports: [
        { student: "Alice", cgpa: 8.5, placed: true },
        { student: "Bob", cgpa: 7.2, placed: false },
        { student: "Carol", cgpa: 9.1, placed: true }
    ]
};

let activeCharts = [];

function checkAuth() {
    const user = localStorage.getItem('aiad_user');
    const role = localStorage.getItem('aiad_role');

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name-display').innerText = user;
    document.getElementById('user-role-display').innerText = role;

    // Filter sidebar based on role
    if (role === 'Student') {
        document.getElementById('nav-placement').classList.add('hidden');
        document.getElementById('nav-admin').classList.add('hidden');
    } else if (role === 'Placement Officer') {
        document.getElementById('nav-student').classList.add('hidden');
        document.getElementById('nav-admin').classList.add('hidden');
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.page-content').forEach(section => {
        section.classList.add('hidden');
    });

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
    }

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.section === sectionId) {
            nav.classList.add('active');
            document.getElementById('page-title').innerText = nav.innerText.trim();
        }
    });

    // Populate data
    populateData(sectionId);
}

// Smart API URL Detection
const getApiUrl = () => {
    const backendHost = 'http://127.0.0.1:5000';
    const base = '/api/data';

    // If opened via file:// OR from a different port (like Live Server 5500)
    if (window.location.protocol === 'file:' || window.location.port !== '5000') {
        return backendHost + base;
    }
    return base;
};

const API_URL = getApiUrl();
console.log('AIAD: Using API URL ->', API_URL);

async function populateData(section) {
    if (section === 'student-overview') {
        try {
            const username = localStorage.getItem('aiad_user');
            const url = `${API_URL}/student/${username}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
            const data = await response.json();

            // Populate summary stats
            document.getElementById('student-cgpa').innerText = data.cgpa || '-';
            document.getElementById('student-skills').innerText = data.skills ? data.skills.join(', ') : '-';
            document.getElementById('student-eligibility').innerText = data.isPlaced ? 'Placed' : 'Eligible';
            document.getElementById('student-dept').innerText = data.department || 'Not Set';

            // Pre-fill registration form
            if (data.email) document.getElementById('reg-email').value = data.email;
            if (data.phone) document.getElementById('reg-phone').value = data.phone;
            if (data.department) document.getElementById('reg-dept').value = data.department;
            if (data.batch) document.getElementById('reg-batch').value = data.batch;
            if (data.cgpa) document.getElementById('reg-cgpa').value = data.cgpa;
            if (data.skills) document.getElementById('reg-skills').value = data.skills.join(', ');

            renderStudentCharts();
            renderStudentRadar(data);
            fetchCompanies('student-company-list');

            // Fetch AI Analysis and Career Match
            try {
                const analysisUrl = `${API_URL}/student-analysis/${username}`;
                const analysisRes = await fetch(analysisUrl);
                if (analysisRes.ok) {
                    const analysis = await analysisRes.json();
                    window.currentStudentAnalysis = analysis;

                    if (analysis.bestMatch) {
                        const bMatch = analysis.bestMatch;
                        document.getElementById('best-match-role').innerText = bMatch.jobRole;
                        document.getElementById('best-match-score').innerText = `${bMatch.matchPercentage}%`;
                        document.getElementById('best-match-pkg').innerText = bMatch.averagePackage;

                        const missingContainer = document.getElementById('missing-skills-list');
                        missingContainer.innerHTML = bMatch.missingSkills.map(s =>
                            `<span class="user-badge" style="background: var(--danger); color: white;">${s}</span>`
                        ).join('') || '<span style="font-size: 13px; color: var(--success);">You have all required skills!</span>';

                        const othersContainer = document.getElementById('other-roles-list');
                        othersContainer.innerHTML = analysis.recommendations.slice(1, 4).map(r =>
                            `<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-200); padding-bottom: 8px;">
                                <div>
                                    <div style="font-weight: 600;">${r.jobRole}</div>
                                    <div style="font-size: 12px; color: var(--gray-500);">Missing: ${r.missingSkills.length} skills</div>
                                </div>
                                <div style="font-weight: 700; color: ${r.matchPercentage > 50 ? 'var(--success)' : 'var(--gray-500)'}">${r.matchPercentage}%</div>
                            </div>`
                        ).join('');

                        // Override static student chart using real data
                        renderStudentAnalysisCharts(analysis);
                    } else {
                        document.getElementById('best-match-role').innerText = "No Data Available";
                        document.getElementById('best-match-score').innerText = "0%";
                    }
                } else {
                    document.getElementById('best-match-role').innerText = "Error Loading Data";
                    document.getElementById('best-match-score').innerText = "0%";
                    console.error("Analysis HTTP Error:", analysisRes.status);
                }
            } catch (err) {
                console.error("Failed to load student analysis:", err);
                document.getElementById('best-match-role').innerText = "System Error";
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }
    // Faculty section removed
    if (section === 'placement-overview') {
        fetchStudentsForPlacement();
    }
    if (section === 'admin-overview') {
        fetchActivities();
        fetchIndustryTrendsForAdmin();
    }
    if (section === 'placement-overview' || section === 'admin-overview') {
        try {
            const url = `${API_URL}/dashboard-stats`;
            const response = await fetch(url);

            // JSON Guard
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Server returned HTML for ${url}. Connectivity check failed.`);
            }

            const data = await response.json();

            if (section === 'placement-overview') {
                document.getElementById('placed-count').innerText = data.placedCount || 0;
                document.getElementById('company-count').innerText = data.totalCompanies || 0;
                document.getElementById('highest-pack').innerText = data.highestPackage || "0 LPA";
                document.getElementById('avg-pack').innerText = data.avgPackage || "0 LPA";
                renderPlacementCharts();
                fetchCompanies('placement-company-list');
            } else {
                document.getElementById('total-students').innerText = data.totalStudents || 0;
                document.getElementById('total-faculty').innerText = data.totalFaculty || 0;
                document.getElementById('total-placed').innerText = data.placedCount || 0;
                document.getElementById('total-not-placed').innerText = data.notPlacedCount || 0;
                renderAdminCharts();
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }
    if (section === 'reports') {
        const tbody = document.getElementById('reports-table-body');
        tbody.innerHTML = dummyData.reports.map(r => `
            <tr>
                <td>${r.student}</td>
                <td>${r.cgpa}</td>
                <td style="color: ${r.placed ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                    ${r.placed ? 'Placed' : 'Not Placed'}
                </td>
            </tr>
        `).join('');
    }
    if (section === 'notifications') {
        fetchNotifications();
    }
}

async function fetchCompanies(containerId) {
    try {
        const response = await fetch(`${API_URL}/companies`);
        const companies = await response.json();
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = companies.map(c => `
            <div class="stat-card">
                <div class="stat-card-label">${c.status} Drive</div>
                <div class="stat-card-value" style="font-size: 20px;">${c.name}</div>
                <div style="font-size: 14px; color: var(--gray-500); margin-top: 8px;">
                    Role: ${c.role}<br>
                    Package: ${c.package}<br>
                    Date: ${new Date(c.driveDate).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching companies:', err);
    }
}

async function fetchNotifications() {
    try {
        const role = localStorage.getItem('aiad_role');
        const response = await fetch(`${API_URL}/notifications?role=${role}`);
        const notifications = await response.json();
        const list = document.getElementById('notifications-list');
        if (!list) return;

        if (notifications.length === 0) {
            list.innerHTML = '<div class="notification-item">No new notifications</div>';
            return;
        }

        list.innerHTML = notifications.map(n => `
            <div class="notification-item">
                <div>
                    <div style="font-weight: 700; color: var(--gray-900);">${n.title}</div>
                    <div style="color: var(--gray-500); font-size: 14px;">${n.message}</div>
                </div>
                <div style="font-size: 12px; color: var(--gray-400);">${new Date(n.createdAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}

async function fetchActivities() {
    try {
        const response = await fetch(`${API_URL}/activities`);
        const activities = await response.json();
        const list = document.getElementById('recent-reg-activity');
        if (!list) return;

        if (activities.length === 0) {
            list.innerHTML = '<div class="notification-item">No recent activity</div>';
            return;
        }

        list.innerHTML = activities.map(a => `
            <div class="notification-item">
                <div>
                    <span style="font-weight: 700;">${a.user}</span> ${a.action}
                    <div style="font-size: 13px; color: var(--gray-500);">${a.details || ''}</div>
                </div>
                <div style="font-size: 12px; color: var(--gray-400);">${new Date(a.createdAt).toLocaleTimeString()}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching activities:', err);
    }
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerHTML;

    // UI Improvements: Loading State
    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> Saving...';

    const studentData = {
        name: localStorage.getItem('aiad_user'),
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        department: document.getElementById('reg-dept').value,
        batch: document.getElementById('reg-batch').value,
        cgpa: parseFloat(document.getElementById('reg-cgpa').value),
        skills: document.getElementById('reg-skills').value.split(',').map(s => s.trim()).filter(s => s !== "")
    };

    try {
        const response = await fetch(`${API_URL}/register-placement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (result.success) {
            btn.innerHTML = '✅ Success!';
            btn.style.background = 'var(--success)';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalBtnText;
                btn.style.background = '';
                populateData('student-dashboard');
            }, 2000);
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        console.error('Registration error:', err);
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        const fullUrl = targetUrl.startsWith('http') ? targetUrl : window.location.origin + targetUrl;
        alert(`Could not save profile. Error: ${err.message}\n\nTarget URL: ${fullUrl}\n\nTIP: Ensure the backend server is running on http://127.0.0.1:5000`);
    }
}

let allRegisteredStudents = []; // Cache for filtering

async function fetchStudentsForPlacement() {
    try {
        const response = await fetch(`${API_URL}/all-students`);
        allRegisteredStudents = await response.json();
        renderStudentTable(allRegisteredStudents, 'placement-students-list', true);
    } catch (err) {
        console.error('Error fetching students:', err);
    }
}

async function fetchStudentsForFaculty() {
    try {
        const response = await fetch(`${API_URL}/all-students`);
        const students = await response.json();
        renderStudentTable(students, 'faculty-students-list', false);
    } catch (err) {
        console.error('Error fetching students:', err);
    }
}

function renderStudentTable(students, containerId, canUpdate) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;

    tbody.innerHTML = students.map(s => `
        <tr>
            <td>${s.name || '-'}</td>
            <td>${s.department || '-'}</td>
            <td>${s.cgpa != null && s.cgpa !== '' ? s.cgpa : '-'}</td>
            <td style="font-size: 11px; color: var(--primary);">${(s.skills && s.skills.length > 0) ? s.skills.join(', ') : '-'}</td>
            <td>${(s.isPlaced && s.placementData && s.placementData.company) ? s.placementData.company : '-'}</td>
            <td>${(s.isPlaced && s.placementData && s.placementData.package) ? s.placementData.package : '-'}</td>
            <td>
                <span class="user-badge" style="background: ${s.isPlaced ? 'var(--success)' : 'var(--gray-200)'}; color: ${s.isPlaced ? 'white' : 'var(--gray-700)'}">
                    ${s.isPlaced ? 'Placed' : 'Not Placed'}
                </span>
            </td>
            ${canUpdate ? `
            <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="openEditStudentModal('${s._id}')">
                        Edit
                    </button>
                    <button class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; background: #4f46e5; border: none; border-radius: 20px;" onclick="promptStatusUpdate('${s._id}', '${s.name}')">
                        Update Status
                    </button>
                    <button class="btn" style="padding: 6px 12px; font-size: 12px; background: var(--danger); color: white; border-radius: 6px;" onclick="deleteStudent('${s._id}', '${s.name}')">
                        Delete
                    </button>
                </div>
            </td>` : ''}
        </tr>
    `).join('');
}

function filterStudents() {
    const query = document.getElementById('student-search').value.toLowerCase();
    const statusFilter = document.getElementById('student-status-filter').value;

    const filtered = allRegisteredStudents.filter(s => {
        const matchesQuery = s.name.toLowerCase().includes(query) ||
            (s.skills && s.skills.some(skill => skill.toLowerCase().includes(query))) ||
            (s.department && s.department.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Placed' && s.isPlaced) ||
            (statusFilter === 'Not Placed' && !s.isPlaced);

        return matchesQuery && matchesStatus;
    });
    renderStudentTable(filtered, 'placement-students-list', true);
}

async function promptStatusUpdate(id, name) {
    const choice = prompt(`Update status for ${name}:\nEnter "1" for PLACED\nEnter "2" for NOT PLACED`);

    if (choice === "1") {
        const company = prompt(`Enter company name for ${name}:`);
        if (!company) return;
        const pkg = prompt(`Enter package (e.g. 10 LPA):`);
        if (!pkg) return;

        try {
            const response = await fetch(`${API_URL}/update-placement-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: id,
                    isPlaced: true,
                    company,
                    package: pkg
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('Student marked as Placed!');
                populateData('placement-overview');
            }
        } catch (err) {
            console.error('Status update error:', err);
        }
    } else if (choice === "2") {
        try {
            const response = await fetch(`${API_URL}/update-placement-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: id,
                    isPlaced: false
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('Student marked as Not Placed!');
                populateData('placement-overview');
            }
        } catch (err) {
            console.error('Status update error:', err);
        }
    }
}

async function deleteStudent(id, name) {
    if (!confirm("Are you sure you want to delete this student record?")) return;

    try {
        const response = await fetch(`${API_URL}/student/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            alert('Student record deleted successfully');
            populateData('placement-overview');
        } else {
            alert('Error deleting student: ' + result.message);
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    const companyData = {
        name: document.getElementById('comp-name').value,
        role: document.getElementById('comp-role').value,
        package: document.getElementById('comp-package').value,
        driveDate: document.getElementById('comp-date').value,
        status: document.getElementById('comp-status').value
    };

    try {
        const response = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
        });
        const result = await response.json();
        if (result.success) {
            alert('Company updated successfully!');
            document.getElementById('company-form').reset();
            fetchCompanies('placement-company-list');
        }
    } catch (err) {
        console.error('Error updating company:', err);
    }
}

function destroyCharts() {
    activeCharts.forEach(chart => chart.destroy());
    activeCharts = [];
}

function renderStudentRadar(student) {
    const canvas = document.getElementById('student-radar-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Skill names for the radar
    const labels = ["Technical", "Communication", "Problem Solving", "Teamwork", "Projects"];

    // Logic to map student skills to radar values (mock logic for demo)
    const technical = student.skills ? Math.min(student.skills.length * 20, 100) : 40;
    const cgpaScore = student.cgpa ? (student.cgpa / 10) * 100 : 50;

    activeCharts.push(new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Your Profile',
                data: [technical, 70, cgpaScore, 85, 60],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                pointBackgroundColor: '#6366f1'
            }, {
                label: 'Industry Target',
                data: [80, 80, 85, 80, 75],
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10b981',
                borderDash: [5, 5]
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    }));
}

function renderStudentAnalysisCharts(analysis) {
    const student = analysis.studentDetails;
    const bestMatch = analysis.bestMatch;
    if (!student || !bestMatch) return;

    // We already have destroying logic inside the below functions, but to be sure:
    // We update the global dummyData with real values so renderStudentCharts() uses real data
    dummyData.student.requiredSkills = bestMatch.requiredSkills || [];

    // Actually, let's just create a completely new bar chart config that replaces the "Skill Proficiency vs Demand" one.
    const canvas = document.getElementById('skill-chart');
    if (!canvas) return;

    // Manually push to activeCharts to track
    const matched = bestMatch.matchedSkills.length;
    const missing = bestMatch.missingSkills.length;

    const ctx1 = canvas.getContext('2d');
    // We will clear existing chart context
    // Chart js instances are usually attached to canvas. We need to find and destroy it properly instead.
    activeCharts.forEach(chart => {
        if (chart.canvas && chart.canvas.id === 'skill-chart') {
            chart.destroy();
        }
    });

    const newChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Skills You Have', 'Skills to Learn'],
            datasets: [{
                data: [matched, missing],
                backgroundColor: ['#10b981', '#f43f5e']
            }]
        },
        options: { responsive: true, plugins: { title: { display: true, text: `Target Role: ${bestMatch.jobRole}` } } }
    });
    activeCharts.push(newChart);
}

function renderStudentCharts() {
    destroyCharts();
    const ctx1 = document.getElementById('skill-chart').getContext('2d');
    activeCharts.push(new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: dummyData.student.requiredSkills,
            datasets: [{
                label: 'Student Skill Level',
                data: [85, 90, 60, 75],
                backgroundColor: '#4f46e5',
                borderRadius: 6
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    }));

    const ctx2 = document.getElementById('placement-chart').getContext('2d');
    activeCharts.push(new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Placed', 'In Progress'],
            datasets: [{
                data: [75, 25],
                backgroundColor: ['#10b981', '#6366f1']
            }]
        }
    }));
}

function renderFacultyCharts() {
    destroyCharts();

    // Chart 1: Student CGPA Distribution
    const ctx1 = document.getElementById('curriculum-gap-chart').getContext('2d');
    activeCharts.push(new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: dummyData.faculty.studentPerformance.map(s => s.name),
            datasets: [{
                label: 'Student CGPA',
                data: dummyData.faculty.studentPerformance.map(s => s.cgpa),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Student Academic Performance Overview'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    grid: { display: false }
                },
                x: { grid: { display: false } }
            }
        }
    }));

    // Chart 2: Skill Coverage Trend (Adding a second chart for better insight)
    const facultySection = document.getElementById('faculty-overview');
    const chartGrid = facultySection.querySelector('.chart-grid');

    // Check if we already added the second chart container
    if (!document.getElementById('skill-trend-chart')) {
        const newChartCard = document.createElement('div');
        newChartCard.className = 'chart-card';
        newChartCard.innerHTML = `
            <h3>Skill Coverage vs Industry Demand (Trend)</h3>
            <canvas id="skill-trend-chart"></canvas>
        `;
        chartGrid.appendChild(newChartCard);
        chartGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
    }

    const ctx2 = document.getElementById('skill-trend-chart').getContext('2d');
    activeCharts.push(new Chart(ctx2, {
        type: 'line',
        data: {
            labels: dummyData.faculty.skillTrends.map(t => t.label),
            datasets: [{
                label: 'Curriculum Match %',
                data: dummyData.faculty.skillTrends.map(t => t.coverage),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Curriculum Alignment Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    }));
}

function renderPlacementCharts() {
    destroyCharts();
    const ctx = document.getElementById('placement-trend-chart').getContext('2d');
    activeCharts.push(new Chart(ctx, {
        type: 'line',
        data: {
            labels: dummyData.placement.yearlyTrends.map(y => y.year),
            datasets: [{
                label: 'Placed Students',
                data: dummyData.placement.yearlyTrends.map(y => y.count),
                borderColor: '#4f46e5',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.1)'
            }]
        }
    }));

    const ctxSalary = document.getElementById('salary-trend-chart').getContext('2d');
    activeCharts.push(new Chart(ctxSalary, {
        type: 'bar',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Average Package (LPA)',
                data: [6.5, 7.2, 8.0, 8.5, 9.2],
                backgroundColor: '#10b981',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    }));
}

function renderAdminCharts() {
    destroyCharts();
    const ctx = document.getElementById('usage-chart').getContext('2d');
    activeCharts.push(new Chart(ctx, {
        type: 'pie',
        data: {
            labels: dummyData.admin.usage.map(u => u.label),
            datasets: [{
                data: dummyData.admin.usage.map(u => u.value),
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b']
            }]
        }
    }));
}

function generateReport() {
    alert('Report generation triggered! Your report is being prepared.');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            showSection(item.dataset.section);
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('aiad_user');
        localStorage.removeItem('aiad_role');
        window.location.href = 'index.html';
    });

    const companyForm = document.getElementById('company-form');
    if (companyForm) {
        companyForm.addEventListener('submit', handleCompanySubmit);
    }

    const regForm = document.getElementById('student-reg-form');
    if (regForm) {
        regForm.addEventListener('submit', handleRegistrationSubmit);
    }

    const studentModalForm = document.getElementById('student-modal-form');
    if (studentModalForm) {
        studentModalForm.addEventListener('submit', handleModalSubmit);
    }

    // Initial connection check
    (async () => {
        const statusEl = document.getElementById('system-status');
        if (!statusEl) return;

        try {
            const healthUrl = API_URL.replace('/api/data', '/api/health');
            const response = await fetch(healthUrl);
            if (response.ok) {
                statusEl.innerText = '● Backend Connected';
                statusEl.className = 'status-badge online';
            } else {
                throw new Error();
            }
        } catch (err) {
            statusEl.innerText = '● Backend Offline';
            statusEl.className = 'status-badge offline';
        }
    })();

    // Default section based on role
    const role = localStorage.getItem('aiad_role');
    if (role === 'Student') showSection('student-overview');
    else if (role === 'Placement Officer') showSection('placement-overview');
    else showSection('overview');
});

// --- Student Modal Management ---

function toggleModalPlacementFields() {
    const status = document.getElementById('modal-status').value;
    const fields = document.getElementById('modal-placement-fields');
    if (status === 'Placed') {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}

function openAddStudentModal() {
    document.getElementById('modal-title').innerText = 'Add New Student';
    document.getElementById('modal-student-id').value = '';
    document.getElementById('student-modal-form').reset();
    document.getElementById('modal-status').value = 'Not Placed';
    toggleModalPlacementFields();
    document.getElementById('student-modal').classList.remove('hidden');
}

async function openEditStudentModal(id) {
    // Try from cache first, otherwise fetch fresh from backend
    let student = allRegisteredStudents.find(s => s._id === id);
    if (!student) {
        try {
            const res = await fetch(`${API_URL}/all-students`);
            allRegisteredStudents = await res.json();
            student = allRegisteredStudents.find(s => s._id === id);
        } catch (err) {
            console.error('Could not fetch student:', err);
        }
    }
    if (!student) { alert('Student not found.'); return; }

    document.getElementById('modal-title').innerText = 'Edit Student Details';
    document.getElementById('modal-student-id').value = student._id;
    document.getElementById('modal-name').value = student.name || '';
    document.getElementById('modal-email').value = student.email || '';
    document.getElementById('modal-dept').value = student.department || 'Computer Science';
    document.getElementById('modal-cgpa').value = student.cgpa || '';
    document.getElementById('modal-phone').value = student.phone || '';
    document.getElementById('modal-batch').value = student.batch || '';
    document.getElementById('modal-skills').value = student.skills ? student.skills.join(', ') : '';

    // Status and placement details
    const status = student.isPlaced ? 'Placed' : 'Not Placed';
    document.getElementById('modal-status').value = status;
    document.getElementById('modal-company').value = (student.placementData && student.placementData.company) ? student.placementData.company : '';
    document.getElementById('modal-package').value = (student.placementData && student.placementData.package) ? student.placementData.package : '';

    toggleModalPlacementFields();
    document.getElementById('student-modal').classList.remove('hidden');
}

function closeStudentModal() {
    document.getElementById('student-modal').classList.add('hidden');
}

async function handleModalSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modal-student-id').value;
    const isEdit = !!id;
    const status = document.getElementById('modal-status').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const studentData = {
        name: document.getElementById('modal-name').value,
        email: document.getElementById('modal-email').value,
        phone: document.getElementById('modal-phone').value,
        batch: document.getElementById('modal-batch').value,
        department: document.getElementById('modal-dept').value,
        cgpa: parseFloat(document.getElementById('modal-cgpa').value),
        skills: document.getElementById('modal-skills').value.split(',').map(s => s.trim()).filter(s => s !== ""),
        isPlaced: status === 'Placed',
        placementData: status === 'Placed' ? {
            company: document.getElementById('modal-company').value,
            package: document.getElementById('modal-package').value
        } : null
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Saving...'; }

    try {
        const url = isEdit ? `${API_URL}/student/${id}` : `${API_URL}/add-student`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server error ${response.status}: ${errText}`);
        }

        const result = await response.json();
        if (result.success) {
            closeStudentModal();

            // Immediately update local cache with latest data from backend
            const updatedStudent = result.student;
            if (updatedStudent) {
                if (isEdit) {
                    const idx = allRegisteredStudents.findIndex(s => s._id === updatedStudent._id);
                    if (idx !== -1) allRegisteredStudents[idx] = updatedStudent;
                    else allRegisteredStudents.unshift(updatedStudent);
                } else {
                    allRegisteredStudents.unshift(updatedStudent);
                }
                // Re-render table immediately with updated data
                renderStudentTable(allRegisteredStudents, 'placement-students-list', true);
            }

            // Show success toast
            const toast = document.createElement('div');
            toast.innerText = isEdit ? '✅ Student updated successfully!' : '✅ Student added successfully!';
            toast.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#10b981;color:white;padding:14px 24px;border-radius:10px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:opacity 0.5s;';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);

            // Refresh overview stats in background
            populateData('placement-overview');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (err) {
        console.error('Error saving student:', err);
        alert('Failed to save student: ' + err.message);
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Save Student'; }
    }
}

// --- Industry Trends Management (Admin) ---

async function fetchIndustryTrendsForAdmin() {
    try {
        const response = await fetch(`${API_URL}/industry-trends`);
        const trends = await response.json();
        const tbody = document.getElementById('admin-trends-list');
        if (!tbody) return;

        tbody.innerHTML = trends.map(t => `
            <tr>
                <td><strong>${t.jobRole}</strong></td>
                <td style="font-size: 13px;">${t.requiredSkills ? t.requiredSkills.join(', ') : '-'}</td>
                <td>${t.averagePackage || '-'}</td>
                <td>
                    <span class="user-badge" style="background: ${t.demandLevel === 'High' ? 'var(--success)' : (t.demandLevel === 'Medium' ? 'var(--warning)' : 'var(--danger)')}; color: white; border: none;">
                        ${t.demandLevel || 'Unknown'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" style="padding: 4px 10px; font-size: 12px;" onclick="editTrend('${t._id}', '${t.jobRole}', '${t.requiredSkills ? t.requiredSkills.join(', ') : ''}', '${t.averagePackage || ''}', '${t.demandLevel || 'High'}')">Edit</button>
                        <button class="btn" style="padding: 4px 10px; font-size: 12px; background: var(--danger); color: white; border: none;" onclick="deleteTrend('${t._id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error fetching industry trends:', err);
    }
}

async function handleTrendSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('trend-submit-btn');
    const originalText = btn.innerText;

    const data = {
        _id: document.getElementById('trend-id').value,
        jobRole: document.getElementById('trend-role').value,
        requiredSkills: document.getElementById('trend-skills').value.split(',').map(s => s.trim()).filter(s => s !== ""),
        averagePackage: document.getElementById('trend-package').value,
        demandLevel: document.getElementById('trend-demand').value
    };

    btn.disabled = true;
    btn.innerText = 'Saving...';

    try {
        const response = await fetch(`${API_URL}/industry-trends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            resetTrendForm();
            fetchIndustryTrendsForAdmin();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (err) {
        console.error('Submit trend error:', err);
        alert('Failed to save trend.');
    } finally {
        if(btn) { btn.disabled = false; btn.innerText = originalText; }
    }
}

function editTrend(id, role, skills, pkg, demand) {
    document.getElementById('trend-id').value = id;
    document.getElementById('trend-role').value = role;
    document.getElementById('trend-skills').value = skills;
    document.getElementById('trend-package').value = pkg;
    document.getElementById('trend-demand').value = demand;
    
    document.getElementById('trend-submit-btn').innerText = 'Update Trend';
    document.getElementById('trend-cancel-btn').style.display = 'block';
    
    // Scroll to form smoothly
    const form = document.getElementById('trend-form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetTrendForm() {
    document.getElementById('trend-form').reset();
    document.getElementById('trend-id').value = '';
    document.getElementById('trend-submit-btn').innerText = 'Add Trend';
    document.getElementById('trend-cancel-btn').style.display = 'none';
}

async function deleteTrend(id) {
    if (!confirm('Are you sure you want to delete this Industry Trend?')) return;
    try {
        const response = await fetch(`${API_URL}/industry-trends/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            fetchIndustryTrendsForAdmin();
        } else {
            alert('Error deleting: ' + result.message);
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
}

// --- View All Matched Roles Modal ---
function openRolesModal() {
    const analysis = window.currentStudentAnalysis;
    if (!analysis || !analysis.recommendations) {
        alert('Wait for analysis to finish loading first or save your profile.');
        return;
    }

    const list = document.getElementById('all-roles-container');
    list.innerHTML = analysis.recommendations.map(r => `
        <div style="border: 1px solid var(--gray-200); padding: 16px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 8px;">
                <div>
                    <h4 style="margin: 0; font-size: 18px; color: var(--gray-900);">${r.jobRole}</h4>
                    <span class="user-badge" style="background: var(--primary); color: white; border: none; margin-top: 8px; display: inline-block;">Avg Package: ${r.averagePackage || 'N/A'}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700; color: ${r.matchPercentage > 50 ? 'var(--success)' : (r.matchPercentage > 20 ? 'var(--warning)' : 'var(--danger)')};">
                        ${r.matchPercentage}%
                    </div>
                    <div style="font-size: 12px; color: var(--gray-500);">Match Score</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                <div>
                    <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--success);">Matched Skills:</div>
                    <div style="font-size: 13px; color: var(--gray-600); line-height: 1.5;">
                        ${r.matchedSkills.length > 0 ? r.matchedSkills.join(', ') : 'None'}
                    </div>
                </div>
                <div>
                    <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--danger);">Missing Skills:</div>
                    <div style="font-size: 13px; color: var(--gray-600); line-height: 1.5;">
                        ${r.missingSkills.length > 0 ? r.missingSkills.join(', ') : 'None'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const modal = document.getElementById('roles-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeRolesModal() {
    const modal = document.getElementById('roles-modal');
    if (modal) modal.classList.add('hidden');
}
