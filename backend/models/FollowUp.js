const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer'
    },
    deal: {
        type: mongoose.Schema.ObjectId,
        ref: 'Deal'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['Call', 'Meeting', 'Email', 'Other'],
        default: 'Call'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('FollowUp', followUpSchema);
