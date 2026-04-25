const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderID: {
        type: String,
        unique: true,
        required: true
    },
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [{
        material: {
            type: mongoose.Schema.ObjectId,
            ref: 'Material'
        },
        quantity: Number,
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending Approval', 'Approved', 'Placed', 'In Transit', 'Received', 'Cancelled'],
        default: 'Pending Approval'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Partial'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
