const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    deadline: Date,
    status: {
        type: String,
        enum: ['Active', 'Completed', 'On Hold', 'Cancelled'],
        default: 'Active'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
