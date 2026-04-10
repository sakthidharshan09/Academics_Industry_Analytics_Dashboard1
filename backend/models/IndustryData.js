import mongoose from 'mongoose';

const IndustryDataSchema = new mongoose.Schema({
    jobRole: { type: String, required: true, unique: true },
    requiredSkills: [{ type: String }],
    averagePackage: { type: String },
    demandLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
}, { timestamps: true });

export default mongoose.model('IndustryData', IndustryDataSchema);

