const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    module: {
        type: String,
        enum: ['Auth', 'Materials', 'HRMS', 'ERP', 'CRM', 'Users'],
        required: true
    },
    details: String,
    ipAddress: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
