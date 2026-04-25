const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    to: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Task', 'Leave', 'Material', 'General'],
        default: 'General'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
