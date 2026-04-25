const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an asset name']
    },
    type: {
        type: String,
        required: [true, 'Please add an asset type'],
        enum: ['Laptop', 'Mobile', 'Monitor', 'Furniture', 'Software', 'Other']
    },
    serialNumber: {
        type: String,
        unique: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    assignedDate: Date,
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'In Repair', 'Retired'],
        default: 'Available'
    },
    condition: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor'],
        default: 'New'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
