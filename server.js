const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aiad_db';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ================= ROUTES =================

// Health check API
app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "AIAD Backend is reachable" });
});

// 👉 MAIN FIX: Serve index.html instead of text
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 👉 Optional: Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Data Routes
const dataRoutes = require('./routes/data');
app.use('/api/data', dataRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});