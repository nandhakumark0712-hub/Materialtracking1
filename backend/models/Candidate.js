const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'JobPosting',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    resumeUrl: String,
    status: {
        type: String,
        enum: ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'],
        default: 'Applied'
    },
    interviewer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
