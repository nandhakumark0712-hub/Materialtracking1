const User = require('../models/User');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const MaterialRequest = require('../models/MaterialRequest');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

// @desc    Get team members
// @route   GET /api/manager/team
// @access  Private/Manager
exports.getTeam = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'Employee' }).select('-password');
        
        const teamWithStats = await Promise.all(users.map(async (user) => {
            const [attendanceCount, totalTasks, completedTasks] = await Promise.all([
                Attendance.countDocuments({ user: user._id }),
                Task.countDocuments({ assignedTo: user._id }),
                Task.countDocuments({ assignedTo: user._id, status: 'Completed' })
            ]);

            const attendanceRate = attendanceCount > 0 ? Math.min(100, (attendanceCount / 22) * 100).toFixed(1) : 0;
            const performance = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

            return {
                ...user._doc,
                attendanceRate: `${attendanceRate}%`,
                taskYield: `${completedTasks}/${totalTasks}`,
                performance: parseFloat(performance)
            };
        }));

        const today = new Date().toISOString().split('T')[0];
        const activeToday = await Attendance.countDocuments({ date: today });
        const avgPerformance = teamWithStats.length > 0 
            ? (teamWithStats.reduce((acc, u) => acc + u.performance, 0) / teamWithStats.length).toFixed(1)
            : 0;

        res.status(200).json({ 
            success: true, 
            count: teamWithStats.length, 
            data: teamWithStats,
            summary: {
                activeToday,
                avgPerformance: `${avgPerformance}%`
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Assign task to employee
// @route   POST /api/manager/tasks
// @access  Private/Manager
exports.assignTask = async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            assignedBy: req.user.id
        });

        // Notify Employee
        await Notification.create({
            to: req.body.assignedTo,
            from: req.user.id,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${task.title}`,
            type: 'Task'
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Leave Approval
// @route   PUT /api/manager/leaves/:id
// @access  Private/Manager
exports.handleLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = req.body.status;
        leave.approvedBy = req.user.id;
        await leave.save();

        // Notify Employee
        await Notification.create({
            to: leave.user,
            from: req.user.id,
            title: 'Leave Status Updated',
            message: `Your leave request has been ${leave.status}`,
            type: 'Leave'
        });

        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        next(err);
    }
};

// @desc    Get manager dashboard stats
// @route   GET /api/manager/stats
// @access  Private/Manager
exports.getManagerStats = async (req, res, next) => {
    try {
        const [totalTasks, pendingLeaves, pendingMaterials, teamCount] = await Promise.all([
            Task.countDocuments({ status: { $ne: 'Completed' } }),
            Leave.countDocuments({ status: 'Pending' }),
            MaterialRequest.countDocuments({ status: 'Pending' }),
            User.countDocuments({ role: 'Employee' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalTasks,
                pendingLeaves,
                pendingMaterials,
                teamCount
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get team attendance
// @route   GET /api/manager/team-attendance
// @access  Private/Manager
exports.getTeamAttendance = async (req, res, next) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const attendance = await Attendance.find({ date }).populate('user', 'name role');
        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};
