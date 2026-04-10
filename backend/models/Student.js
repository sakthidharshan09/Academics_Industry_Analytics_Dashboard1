import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registerNumber: { type: String },
    name: String,
    email: String,
    phone: String,
    department: String,
    batch: String,
    cgpa: Number,
    skills: [String],
    isPlaced: { type: Boolean, default: false },
    placementData: {
        company: String,
        package: String,
        year: Number
    },
    progressHistory: [{
        date: { type: Date, default: Date.now },
        skillAdded: String
    }]
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);

