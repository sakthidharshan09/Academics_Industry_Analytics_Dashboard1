const mongoose = require('mongoose');

const IndustryDataSchema = new mongoose.Schema({
    jobRole: { type: String, required: true, unique: true },
    requiredSkills: [{ type: String }],
    averagePackage: { type: String },
    demandLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('IndustryData', IndustryDataSchema);
