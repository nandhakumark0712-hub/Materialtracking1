const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Won', 'Lost'],
        default: 'Pending'
    },
    expectedCloseDate: Date,
    items: [{
        material: {
            type: mongoose.Schema.ObjectId,
            ref: 'Material'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);
