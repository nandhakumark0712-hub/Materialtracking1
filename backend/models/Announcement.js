const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    targetRoles: [{
        type: String,
        enum: ['Admin', 'HR', 'Manager', 'Employee', 'Sales Team']
    }],
    expiryDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
