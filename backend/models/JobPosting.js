const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    description: String,
    requirements: [String],
    salaryRange: String,
    status: {
        type: String,
        enum: ['Open', 'Closed', 'On Hold'],
        default: 'Open'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('JobPosting', jobPostingSchema);
