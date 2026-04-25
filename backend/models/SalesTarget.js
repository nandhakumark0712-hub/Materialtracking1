const mongoose = require('mongoose');

const salesTargetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    achievedAmount: {
        type: Number,
        default: 0
    },
    targetLeads: {
        type: Number,
        default: 10
    },
    achievedLeads: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SalesTarget', salesTargetSchema);
