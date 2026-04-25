const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['IT Support', 'HR Inquiry', 'Payroll Issue', 'Attendance Correction', 'Other']
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    resolutionDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
