const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    bonus: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Credited'],
        default: 'Pending'
    },
    paidDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Payroll', payrollSchema);
