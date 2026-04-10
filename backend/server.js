import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/aiad_db';

console.log('📡 Attempting to connect to MongoDB...');
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB at:', MONGODB_URI.split('@').pop().split('/')[0]))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('💡 Tip: Ensure MongoDB is running locally or check your MONGODB_URI in .env');
    });

// ================= API ROUTES =================

// Health check API
app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "AIAD Backend is reachable" });
});

// Auth Routes
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Data Routes
import dataRoutes from './routes/data.js';
app.use('/api/data', dataRoutes);

// ================= CLIENT ROUTING =================

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

