const Attendance = require('../models/Attendance');

// @desc    Check-in
// @route   POST /api/attendance/checkin
// @access  Private
exports.checkIn = async (req, res, next) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        
        // Check if already checked in
        const existing = await Attendance.findOne({ user: req.user.id, date });
        if (existing) {
            return res.status(400).json({ message: 'Already checked in for today' });
        }

        const attendance = await Attendance.create({
            user: req.user.id,
            date,
            checkIn: new Date()
        });

        // Real-time Update
        const io = req.app.get('io');
        if (io) {
            io.emit('attendanceUpdate', {
                type: 'check-in',
                user: req.user.name,
                time: new Date()
            });
        }

        res.status(201).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};

// @desc    Check-out
// @route   PUT /api/attendance/checkout
// @access  Private
exports.checkOut = async (req, res, next) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ user: req.user.id, date });

        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out' });
        }

        attendance.checkOut = new Date();
        
        // Calculate working hours (difference in hours)
        const diffMs = attendance.checkOut - attendance.checkIn;
        attendance.workingHours = (diffMs / (1000 * 60 * 60)).toFixed(2);

        await attendance.save();

        // Real-time Update
        const io = req.app.get('io');
        if (io) {
            io.emit('attendanceUpdate', {
                type: 'check-out',
                user: req.user.name,
                time: new Date()
            });
        }

        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id }).sort('-date');
        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};
