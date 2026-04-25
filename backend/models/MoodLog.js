const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: Number,
        required: true,
        min: 1,
        max: 5 // 1: Very Sad, 5: Very Happy
    },
    note: String,
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MoodLog', moodLogSchema);
