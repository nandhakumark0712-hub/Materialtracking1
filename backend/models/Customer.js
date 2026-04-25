const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a customer name']
    },
    email: {
        type: String,
        unique: true
    },
    phone: String,
    company: String,
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Lost', 'Lead', 'Prospect', 'Customer'],
        default: 'New'
    },
    isCustomer: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        default: 'Direct'
    },
    score: {
        type: Number,
        default: 0
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
