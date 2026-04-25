const Payroll = require('../models/Payroll');
const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const KPI = require('../models/KPI');
const Goal = require('../models/Goal');
const SupportTicket = require('../models/SupportTicket');

// @desc    Get HR Statistics
// @route   GET /api/hrms/stats
// @access  Private/HR
exports.getHRStats = async (req, res, next) => {
    try {
        const totalEmployees = await User.countDocuments({ role: 'Employee' });
        const newApplications = await Candidate.countDocuments();
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const payrollSummary = await Payroll.aggregate([
            { $match: { month: new Date().toLocaleString('default', { month: 'long' }) } },
            { $group: { _id: null, total: { $sum: "$netSalary" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                newApplications,
                pendingLeaves,
                totalPayroll: payrollSummary.length > 0 ? payrollSummary[0].total : 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all employees (for HR)
// @route   GET /api/hrms/employees
// @access  Private/HR
exports.getEmployees = async (req, res, next) => {
    try {
        const employees = await User.find({ role: 'Employee' }).select('-password');
        res.status(200).json({ success: true, count: employees.length, data: employees });
    } catch (err) {
        next(err);
    }
};

// @desc    Generate payroll records (HR initiates)
// @route   POST /api/hrms/payroll/generate
// @access  Private/HR
exports.generatePayroll = async (req, res, next) => {
    try {
        const { employeeId, month, year, bonus, deductions, baseSalary } = req.body;
        const employee = await User.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const netSalary = (Number(baseSalary) || 50000) + (Number(bonus) || 0) - (Number(deductions) || 0);

        const payroll = await Payroll.create({
            employee: employeeId,
            month,
            year,
            baseSalary: Number(baseSalary) || 50000,
            bonus: Number(bonus) || 0,
            deductions: Number(deductions) || 0,
            netSalary,
            status: 'Pending'
        });

        res.status(201).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve/Credit payroll (Admin only)
// @route   PUT /api/hrms/payroll/:id/approve
// @access  Private/Admin
exports.approvePayroll = async (req, res, next) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

        payroll.status = 'Credited';
        payroll.paidDate = Date.now();
        await payroll.save();

        res.status(200).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my payroll (Employee)
// @route   GET /api/hrms/payroll/my
// @access  Private
exports.getMyPayroll = async (req, res, next) => {
    try {
        const payroll = await Payroll.find({ employee: req.user.id, status: 'Credited' }).sort('-createdAt');
        res.status(200).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
};

// @desc    Create job posting
// @route   POST /api/hrms/jobs
// @access  Private/HR
exports.createJob = async (req, res, next) => {
    try {
        const job = await JobPosting.create(req.body);
        res.status(201).json({ success: true, data: job });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all candidates
// @route   GET /api/hrms/candidates
// @access  Private/HR
exports.getCandidates = async (req, res, next) => {
    try {
        const candidates = await Candidate.find().populate('job', 'title');
        res.status(200).json({ success: true, count: candidates.length, data: candidates });
    } catch (err) {
        next(err);
    }
};

// @desc    Apply for leave
// @route   POST /api/hrms/leaves/apply
// @access  Private
exports.applyLeave = async (req, res, next) => {
    try {
        const leave = await Leave.create({
            ...req.body,
            employee: req.user.id
        });
        res.status(201).json({ success: true, data: leave });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my leaves
// @route   GET /api/hrms/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find({ employee: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all leaves (for HR)
// @route   GET /api/hrms/leaves
// @access  Private/HR
exports.getAllLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find().populate('employee', 'name role').sort('-createdAt');
        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (err) {
        next(err);
    }
};

// @desc    Update leave status (HR Approval)
// @route   PUT /api/hrms/leaves/:id
// @access  Private/HR
exports.updateLeaveStatus = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = req.body.status;
        await leave.save();

        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Performance Data (KPIs & Goals)
// @route   GET /api/hrms/performance
// @access  Private/HR
exports.getPerformance = async (req, res, next) => {
    try {
        const [kpis, goals] = await Promise.all([
            KPI.find().populate('employee', 'name role'),
            Goal.find().populate('employee', 'name role')
        ]);
        res.status(200).json({ success: true, data: { kpis, goals } });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Support Tickets
// @route   GET /api/hrms/tickets
// @access  Private/HR
exports.getSupportTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.find().populate('user', 'name role').sort('-createdAt');
        res.status(200).json({ success: true, data: tickets });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Attendance Trends (Last 7 days)
// @route   GET /api/hrms/attendance/trends
// @access  Private/HR
exports.getAttendanceTrends = async (req, res, next) => {
    try {
        const days = [];
        const counts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const count = await Attendance.countDocuments({ date: dateString });
            
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            counts.push(count);
        }

        res.status(200).json({ success: true, data: { days, counts } });
    } catch (err) {
        next(err);
    }
};
