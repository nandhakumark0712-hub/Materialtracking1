const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all tasks (for HR/Admin)
// @route   GET /api/tasks
// @access  Private/HR/Admin
exports.getAllTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name role').populate('assignedBy', 'name');
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my assigned tasks
// @route   GET /api/tasks/my
// @access  Private
exports.getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedBy', 'name');
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        next(err);
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only assigned user can update
        if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        task.status = req.body.status;
        if (req.body.status === 'Completed') {
              task.completedAt = Date.now();
        }

        await task.save();

        // Notify Assigner
        await Notification.create({
            to: task.assignedBy,
            from: req.user.id,
            title: 'Task Updated',
            message: `${req.user.name} updated task "${task.title}" to ${task.status}`,
            type: 'Task'
        });

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin/Manager/HR
exports.createTask = async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            assignedBy: req.user.id
        });

        // Notify Assigned User
        await Notification.create({
            to: task.assignedTo,
            from: req.user.id,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${task.title}"`,
            type: 'Task'
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};
