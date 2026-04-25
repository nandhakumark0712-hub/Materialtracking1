const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    target: {
        type: Number,
        required: true
    },
    current: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: '%'
    },
    period: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Yearly'],
        default: 'Monthly'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('KPI', kpiSchema);
