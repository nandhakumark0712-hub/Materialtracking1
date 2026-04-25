const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['Admin', 'HR', 'Manager', 'Employee', 'Sales Team'],
        default: 'Employee'
    },
    profileImg: {
        type: String,
        default: 'default-profile.png'
    },
    employeeID: {
        type: String,
        unique: true,
        sparse: true,
        match: [
            /^EMP-\d{3}$/,
            'Employee ID must follow the format EMP-001'
        ]
    },
    department: String,
    designation: String,
    phone: String,
    dob: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Not Specified'],
        default: 'Not Specified'
    },
    address: String,
    joiningDate: Date,
    reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bio: String,
    skills: [String],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    activeStatus: {
        type: Boolean,
        default: true
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    badges: [{
        name: String,
        icon: String,
        awardedDate: Date
    }],
    isOnline: {
        type: Boolean,
        default: false
    },
    lastLogin: Date
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
