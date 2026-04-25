const mongoose = require('mongoose');

const generalRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Material', 'Procurement', 'HR', 'Employee', 'Sales', 'Other'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComment: String,
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GeneralRequest', generalRequestSchema);
