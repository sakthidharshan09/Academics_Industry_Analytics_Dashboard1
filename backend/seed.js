import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Company from './models/Company.js';
import User from './models/User.js';
import IndustryData from './models/IndustryData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aiad_db';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Student.deleteMany({});
        await Company.deleteMany({});
        await User.deleteMany({});
        await IndustryData.deleteMany({});

        // Add Admin User
        await User.create({
            username: 'admin',
            password: 'password123',
            role: 'Admin'
        });

        // Add Companies
        await Company.create([
            { name: 'Google', role: 'Software Engineer', package: '25 LPA', driveDate: '2024-10-15', status: 'Upcoming' },
            { name: 'Microsoft', role: 'Data Scientist', package: '22 LPA', driveDate: '2024-09-20', status: 'Completed' },
            { name: 'Amazon', role: 'Cloud Architect', package: '20 LPA', driveDate: '2024-11-05', status: 'Upcoming' }
        ]);

        // Add Students
        await Student.create([
            {
                name: 'John Doe',
                registerNumber: 'CS001',
                email: 'john@example.com',
                department: 'CSE',
                batch: '2024',
                cgpa: 9.2,
                skills: ['Java', 'React', 'MongoDB'],
                isPlaced: true,
                placementData: { company: 'Microsoft', package: '22', year: 2024 }
            },
            {
                name: 'Jane Smith',
                registerNumber: 'CS002',
                email: 'jane@example.com',
                department: 'ECE',
                batch: '2024',
                cgpa: 8.5,
                skills: ['Python', 'AWS', 'Docker'],
                isPlaced: false
            }
        ]);

        // Add Industry Trends
        await IndustryData.create([
            { jobRole: 'Full Stack Developer', requiredSkills: ['React', 'Node.js', 'MongoDB'], averagePackage: '10 LPA', demandLevel: 'High' },
            { jobRole: 'Cloud Engineer', requiredSkills: ['AWS', 'Azure', 'Kubernetes'], averagePackage: '15 LPA', demandLevel: 'High' }
        ]);

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
