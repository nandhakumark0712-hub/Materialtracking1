const mongoose = require('mongoose');

const fieldVisitSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    responses: {
        clientAvailable: { type: String, enum: ['Yes', 'No'], required: true },
        inspectionCompleted: { type: String, enum: ['Yes', 'No'], required: true },
        clientApproved: { type: String, enum: ['Yes', 'No'], required: true },
        issuesReported: { type: String, enum: ['Yes', 'No'], required: true },
        followUpRequired: { type: String, enum: ['Yes', 'No'], required: true }
    },
    remarks: {
        type: String,
        trim: true
    },
    imageUrl: String,
    clientName: String,
    location: String
}, {
    timestamps: true
});

module.exports = mongoose.model('FieldVisit', fieldVisitSchema);
