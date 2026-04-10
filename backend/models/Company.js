import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    package: { type: String, required: true },
    driveDate: { type: Date, required: true },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' }
}, { timestamps: true });

export default mongoose.model('Company', CompanySchema);

