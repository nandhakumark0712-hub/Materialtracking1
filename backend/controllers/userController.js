const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('reportingManager', 'name email');
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            bio: req.body.bio,
            dob: req.body.dob,
            gender: req.body.gender,
            skills: req.body.skills
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Upload profile image
// @route   PUT /api/users/profile/image
// @access  Private
exports.uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const user = await User.findByIdAndUpdate(req.user.id, {
            profileImg: req.file.filename
        }, { new: true });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};
