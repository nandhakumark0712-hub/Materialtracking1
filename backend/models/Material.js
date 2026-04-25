const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a material name'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'Please add a SKU'],
        unique: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    quantity: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        required: [true, 'Please add a unit (e.g., kg, pcs)']
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    location: String,
    description: String,
    qrCodeUrl: String,
    image: {
        type: String,
        default: 'no-image.jpg'
    },
    status: {
        type: String,
        enum: ['Pending Approval', 'Approved', 'Rejected'],
        default: 'Pending Approval'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
