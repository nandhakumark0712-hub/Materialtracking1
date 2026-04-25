const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Travel', 'Food', 'Equipment', 'Medical', 'Other']
    },
    description: String,
    receiptUrl: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
