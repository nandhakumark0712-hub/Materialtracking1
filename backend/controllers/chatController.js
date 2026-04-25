const Message = require('../models/Message');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc    Get private messages
// @route   GET /api/chat/messages/:userId
exports.getPrivateMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort('createdAt');

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        next(err);
    }
};

// @desc    Send private message
// @route   POST /api/chat/messages
exports.sendPrivateMessage = async (req, res, next) => {
    try {
        const message = await Message.create({
            sender: req.user.id,
            receiver: req.body.receiver,
            content: req.body.content
        });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all group announcements (Group Chat)
// @route   GET /api/chat/announcements
exports.getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find()
            .populate('author', 'name role')
            .sort('-createdAt');

        res.status(200).json({ success: true, data: announcements });
    } catch (err) {
        next(err);
    }
};

// @desc    Create announcement (Group Chat)
// @route   POST /api/chat/announcements
exports.createAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.create({
            title: req.body.title || 'Group Announcement',
            content: req.body.content,
            author: req.user.id,
            priority: req.body.priority || 'Medium',
            targetRoles: req.body.targetRoles || ['Admin', 'HR', 'Manager', 'Employee', 'Sales Team']
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        next(err);
    }
};
// @desc    Get Admin profile (public for all users to find chat target)
// @route   GET /api/chat/admin-profile
exports.getAdminProfile = async (req, res, next) => {
    try {
        const admin = await User.findOne({ role: 'Admin' }).select('name role _id');
        res.status(200).json({ success: true, data: admin });
    } catch (err) {
        next(err);
    }
};
