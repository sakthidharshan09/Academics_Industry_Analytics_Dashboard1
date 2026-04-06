const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
    role: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
