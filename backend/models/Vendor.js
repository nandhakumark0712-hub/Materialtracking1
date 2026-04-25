const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a vendor name']
    },
    vendorId: {
        type: String,
        unique: true
    },
    contactPerson: String,
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: String,
    address: String,
    gstId: String,
    category: {
        type: String,
        default: 'General'
    },
    paymentTerms: String,
    materialsSupplied: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Material'
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending', 'Rejected'],
        default: 'Active'
    },
    rating: {
        type: Number,
        default: 5
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);
