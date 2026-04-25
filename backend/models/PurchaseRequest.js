const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    itemName: {
        type: String,
        required: [true, 'Please add item name']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity']
    },
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add estimated amount']
    },
    description: String,
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComments: String,
    approvedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
