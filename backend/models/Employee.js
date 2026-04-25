const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    designation: {
        type: String,
        required: [true, 'Please add a designation']
    },
    salary: {
        type: Number,
        required: [true, 'Please add a salary']
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        bankName: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
