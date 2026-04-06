const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const User = require('../models/User');
const IndustryData = require('../models/IndustryData');

// Get Dashboard Data
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await User.countDocuments({ role: 'Faculty' });
        const totalCompanies = await Company.countDocuments();
        const placedStudents = await Student.find({ isPlaced: true });
        const placedCount = placedStudents.length;

        // Calculate dynamic packages
        let highestPackage = 0;
        let avgPackage = 0;

        if (placedCount > 0) {
            const packages = placedStudents.map(s => {
                const val = parseFloat(s.placementData.package);
                return isNaN(val) ? 0 : val;
            });
            highestPackage = Math.max(...packages);
            avgPackage = packages.reduce((a, b) => a + b, 0) / placedCount;
        }

        const dashboardData = {
            totalStudents: totalStudents || 0,
            totalFaculty: totalFaculty || 0,
            totalCompanies: totalCompanies || 0,
            placedCount: placedCount || 0,
            notPlacedCount: (totalStudents - placedCount) || 0,
            avgPackage: avgPackage > 0 ? `${avgPackage.toFixed(1)} LPA` : "0 LPA",
            highestPackage: highestPackage > 0 ? `${highestPackage.toFixed(1)} LPA` : "0 LPA"
        };

        res.json(dashboardData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Notifications
router.get('/notifications', async (req, res) => {
    try {
        const role = req.query.role || 'All';
        const notifications = await Notification.find({
            $or: [{ role: 'All' }, { role: role }]
        }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Activities
router.get('/activities', async (req, res) => {
    try {
        const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all students (for Placement Officer/Admin)
router.get('/all-students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Student Data
router.get('/student/:username', async (req, res) => {
    try {
        const student = await Student.findOne({ name: new RegExp(`^${req.params.username}$`, 'i') });
        if (!student) {
            return res.json({
                cgpa: 8.4,
                skills: ["Java", "Python", "Node.js"],
                requiredSkills: ["React", "MongoDB", "AWS"],
                status: "Eligible"
            });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Student Profile & Registration ---

// Register or Update Student Placement Profile
router.post('/register-placement', async (req, res) => {
    const { registerNumber, name, email, phone, department, batch, cgpa, skills } = req.body;
    console.log('📝 Received Placement Registration Request:', req.body);

    try {
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        let student = await Student.findOne({ name: new RegExp(`^${name}$`, 'i') });

        if (student) {
            console.log(`Updating existing student: ${name}`);

            // Track newly added skills for progress history
            const oldSkills = student.skills || [];
            const newSkills = skills || [];
            const addedSkills = newSkills.filter(s => !oldSkills.includes(s));

            if (!student.progressHistory) student.progressHistory = [];
            addedSkills.forEach(skill => {
                student.progressHistory.push({ skillAdded: skill, date: new Date() });
            });

            student.registerNumber = registerNumber || student.registerNumber;
            student.email = email;
            student.phone = phone;
            student.department = department;
            student.batch = batch;
            student.cgpa = cgpa;
            student.skills = skills;
            await student.save();
        } else {
            console.log(`Creating new student record: ${name}`);
            student = new Student({ registerNumber, name, email, phone, department, batch, cgpa, skills });
            await student.save();
        }

        console.log('✅ Student Profile Saved Successfully');

        // Log Activity
        await Activity.create({
            user: name,
            action: 'Updated Profile',
            details: `Updated placement profile for ${department}`,
            role: 'Student'
        });

        // Create Notifications for Faculty and Placement Officer
        await Notification.create([
            {
                title: 'New Student Registration',
                message: `${name} (${department}) has updated their placement profile.`,
                role: 'Faculty',
                createdBy: 'System'
            },
            {
                title: 'Placement Profile Update',
                message: `Student ${name} is now ready for placement drives.`,
                role: 'Placement Officer',
                createdBy: 'System'
            }
        ]);

        console.log('✅ Student Profile and Notifications Saved');
        res.json({ success: true, message: 'Profile updated successfully!', student });
    } catch (err) {
        console.error('❌ Error saving student profile:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
    }
});

// Get All Students (for Placement Officer)
router.get('/all-students', async (req, res) => {
    try {
        const students = await Student.find().sort({ name: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Placement Status
router.post('/update-placement-status', async (req, res) => {
    const { studentId, isPlaced, company, package } = req.body;
    try {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        student.isPlaced = isPlaced;
        if (isPlaced) {
            student.placementData = {
                company,
                package,
                year: new Date().getFullYear()
            };
        }
        await student.save();

        // Log Activity
        await Activity.create({
            user: 'System',
            action: isPlaced ? 'Marked as Placed' : 'Updated Status',
            details: isPlaced ? `${student.name} placed at ${company}` : `Updated status for ${student.name}`,
            role: 'Placement Officer'
        });

        res.json({ success: true, message: 'Status updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add Student Directly (by Placement Officer/Admin)
router.post('/add-student', async (req, res) => {
    const { registerNumber, name, email, phone, batch, department, cgpa, skills, isPlaced, placementData } = req.body;
    try {
        const student = new Student({ registerNumber, name, email, phone, batch, department, cgpa, skills, isPlaced, placementData });
        await student.save();

        await Activity.create({
            user: 'System',
            action: 'Added Student',
            details: `Manually added student ${name}`,
            role: 'Placement Officer'
        });

        res.json({ success: true, message: 'Student added successfully!', student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Student Record (PUT)
router.put('/student/:id', async (req, res) => {
    try {
        const { registerNumber, name, email, phone, batch, department, cgpa, skills, isPlaced, placementData } = req.body;

        const updateFields = {};
        if (registerNumber !== undefined) updateFields.registerNumber = registerNumber;
        if (name !== undefined) updateFields.name = name;
        if (email !== undefined) updateFields.email = email;
        if (phone !== undefined) updateFields.phone = phone;
        if (batch !== undefined) updateFields.batch = batch;
        if (department !== undefined) updateFields.department = department;
        if (cgpa !== undefined && !isNaN(cgpa)) updateFields.cgpa = cgpa;
        if (skills !== undefined) updateFields.skills = skills;
        if (isPlaced !== undefined) updateFields.isPlaced = isPlaced;
        // Update placementData only if placed and data provided
        if (isPlaced && placementData) {
            updateFields['placementData.company'] = placementData.company || '';
            updateFields['placementData.package'] = placementData.package || '';
        } else if (!isPlaced) {
            updateFields.placementData = null;
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        await Activity.create({
            user: 'System',
            action: 'Updated Student Record',
            details: `Modified details for ${student.name}`,
            role: 'Placement Officer'
        });

        res.json({ success: true, message: 'Student updated successfully!', student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Student
router.delete('/student/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const studentName = student.name;
        const userId = student.userId;

        // Delete associated User account if it exists
        if (userId) {
            await User.findByIdAndDelete(userId);
        }

        // Delete Student record
        await Student.findByIdAndDelete(req.params.id);

        // Log Activity
        await Activity.create({
            user: 'System',
            action: 'Deleted Student',
            details: `Removed record and account for ${studentName}`,
            role: 'Placement Officer'
        });

        res.json({ success: true, message: 'Student and associated account deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Company Management Routes ---

// Get all companies
router.get('/companies', async (req, res) => {
    try {
        const companies = await Company.find().sort({ driveDate: 1 });
        res.json(companies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add or Update a company
router.post('/companies', async (req, res) => {
    const { name, role, package, driveDate, status } = req.body;
    try {
        let company = await Company.findOne({ name });
        if (company) {
            company.role = role;
            company.package = package;
            company.driveDate = driveDate;
            company.status = status;
            await company.save();
        } else {
            company = new Company({ name, role, package, driveDate, status });
            await company.save();
        }
        res.json({ success: true, company });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Industry Trends & Analysis ---

router.get('/industry-trends', async (req, res) => {
    try {
        let trends = await IndustryData.find();
        if (trends.length === 0) {
            const seedData = [
                { jobRole: 'Software Engineer', requiredSkills: ['Java', 'Python', 'Data Structures', 'System Design'], averagePackage: '12 LPA', demandLevel: 'High' },
                { jobRole: 'Data Scientist', requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'], averagePackage: '15 LPA', demandLevel: 'High' },
                { jobRole: 'Frontend Developer', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'], averagePackage: '8 LPA', demandLevel: 'Medium' },
                { jobRole: 'Cloud Architect', requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux'], averagePackage: '18 LPA', demandLevel: 'High' }
            ];
            await IndustryData.insertMany(seedData);
            trends = await IndustryData.find();
        }
        res.json(trends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add or Update Industry Trend
router.post('/industry-trends', async (req, res) => {
    const { jobRole, requiredSkills, averagePackage, demandLevel, _id } = req.body;
    try {
        let trend;
        if (_id) {
            trend = await IndustryData.findById(_id);
            if (trend) {
                trend.jobRole = jobRole;
                trend.requiredSkills = requiredSkills;
                trend.averagePackage = averagePackage;
                trend.demandLevel = demandLevel;
                await trend.save();
            }
        } else {
            trend = new IndustryData({ jobRole, requiredSkills, averagePackage, demandLevel });
            await trend.save();
        }

        // Log Activity
        await Activity.create({
            user: 'System',
            action: _id ? 'Updated Industry Trend' : 'Added Industry Trend',
            details: `Trend for ${jobRole}`,
            role: 'Admin'
        });

        res.json({ success: true, trend });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Industry Trend
router.delete('/industry-trends/:id', async (req, res) => {
    try {
        const trend = await IndustryData.findByIdAndDelete(req.params.id);
        if (!trend) return res.status(404).json({ success: false, message: 'Trend not found' });

        // Log Activity
        await Activity.create({
            user: 'System',
            action: 'Deleted Industry Trend',
            details: `Removed trend for ${trend.jobRole}`,
            role: 'Admin'
        });

        res.json({ success: true, message: 'Industry Trend deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/student-analysis/:username', async (req, res) => {
    try {
        let student = await Student.findOne({ name: new RegExp(`^${req.params.username}$`, 'i') });

        // Use a mock student if not registered yet so the dashboard doesn't break
        if (!student) {
            student = {
                name: req.params.username,
                skills: ["Java", "Python", "Node.js"]
            };
        }

        let trends = await IndustryData.find();
        if (trends.length === 0) {
            const seedData = [
                { jobRole: 'Software Engineer', requiredSkills: ['Java', 'Python', 'Data Structures', 'System Design'], averagePackage: '12 LPA', demandLevel: 'High' },
                { jobRole: 'Data Scientist', requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'], averagePackage: '15 LPA', demandLevel: 'High' },
                { jobRole: 'Frontend Developer', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'], averagePackage: '8 LPA', demandLevel: 'Medium' },
                { jobRole: 'Cloud Architect', requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux'], averagePackage: '18 LPA', demandLevel: 'High' }
            ];
            await IndustryData.insertMany(seedData);
            trends = await IndustryData.find();
        }

        const studentSkills = (student.skills || []).map(s => s.toLowerCase());

        let recommendations = trends.map(job => {
            const reqSkills = job.requiredSkills.map(s => s.toLowerCase());
            const matchedSkills = reqSkills.filter(s => studentSkills.includes(s));
            const missingSkills = reqSkills.filter(s => !studentSkills.includes(s));
            const matchPercentage = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) * 100 : 0;

            return {
                jobRole: job.jobRole,
                matchPercentage: Math.round(matchPercentage),
                matchedSkills: job.requiredSkills.filter(s => studentSkills.includes(s.toLowerCase())),
                missingSkills: job.requiredSkills.filter(s => !studentSkills.includes(s.toLowerCase())),
                averagePackage: job.averagePackage,
                demandLevel: job.demandLevel
            };
        });

        recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
        const bestMatch = recommendations[0] || null;

        res.json({
            studentDetails: student,
            recommendations: recommendations,
            bestMatch: bestMatch
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
