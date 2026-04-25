const User = require('../models/User');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Material = require('../models/Material');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ activeStatus: true });
        
        // Use try-catch for these just in case schemas aren't matched yet
        let totalTasks = 0;
        let pendingLeaves = 0;
        let lowStockMaterials = 0;

        try { totalTasks = await Task.countDocuments(); } catch(e) {}
        try { pendingLeaves = await Leave.countDocuments({ status: 'Pending' }); } catch(e) {}
        try { lowStockMaterials = await Material.countDocuments({ quantity: { $lt: 10 } }); } catch(e) {}

        const recentLogs = await ActivityLog.find().sort('-createdAt').limit(5).populate('user', 'name');

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsersCount,
                totalTasks,
                pendingLeaves,
                lowStockMaterials,
                recentLogs
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        
        await ActivityLog.create({
            user: req.user.id,
            action: 'CREATED_USER',
            module: 'Users',
            details: `Created user ${user.username}`
        });

        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await ActivityLog.create({
            user: req.user.id,
            action: 'UPDATED_USER',
            module: 'Users',
            details: `Updated user ${user.username}`
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await ActivityLog.create({
            user: req.user.id,
            action: 'DELETED_USER',
            module: 'Users',
            details: `Deleted user ${user.username}`
        });

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};
