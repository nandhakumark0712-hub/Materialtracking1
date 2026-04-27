const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a customer name']
    },
    contactPerson: String,
    jobTitle: String,
    email: {
        type: String,
        unique: true
    },
    phone: String,
    company: String,
    industry: String,
    companySize: String,
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Lost', 'Lead', 'Prospect', 'Customer'],
        default: 'New'
    },
    isCustomer: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComment: String,
    source: {
        type: String,
        enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Existing Customer', 'Trade Show', 'Direct'],
        default: 'Direct'
    },
    
    // Requirements
    productInterested: {
        type: String,
        enum: ['A/C', 'Mobile', 'Both', 'None'],
        default: 'None'
    },
    quantityRequired: {
        type: Number,
        default: 0
    },
    budgetRange: String,
    expectedTimeline: String,
    deliveryLocation: String,
    installationRequired: {
        type: Boolean,
        default: false
    },

    // Qualification
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    estimatedDealValue: {
        type: Number,
        default: 0
    },
    closeProbability: {
        type: Number,
        default: 0
    },

    // Follow-up
    nextFollowUpDate: Date,
    preferredContactTime: String,
    
    notes: String,
    score: {
        type: Number,
        default: 0
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    assignedSalesExecutive: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
