const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' },
    role: { type: String, enum: ['All', 'Student', 'Faculty', 'Placement Officer', 'Admin'], default: 'All' },
    createdBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
