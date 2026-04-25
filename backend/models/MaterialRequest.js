const mongoose = require('mongoose');

const materialRequestSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    material: {
       type: mongoose.Schema.ObjectId,
       ref: 'Material',
       required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reason: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);
