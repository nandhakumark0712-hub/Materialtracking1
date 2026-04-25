const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    badgeName: {
        type: String,
        required: true
    },
    icon: String,
    points: {
        type: Number,
        default: 0
    },
    reason: String,
    awardedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);
