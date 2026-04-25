const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    workingHours: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half Day'],
        default: 'Present'
    },
    location: {
        lat: Number,
        lng: Number
    }
}, {
    timestamps: true
});

// Index to prevent multiple check-ins for the same user on the same date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
