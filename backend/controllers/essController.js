const Expense = require('../models/Expense');
const Payroll = require('../models/Payroll');
const Asset = require('../models/Asset');
const SupportTicket = require('../models/SupportTicket');
const MoodLog = require('../models/MoodLog');

// @desc    Get employee payslips
// @route   GET /api/ess/payslips
exports.getPayslips = async (req, res) => {
    try {
        const payrolls = await Payroll.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit expense reimbursement
// @route   POST /api/ess/expenses
exports.submitExpense = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const expense = await Expense.create(req.body);
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get assigned assets
// @route   GET /api/ess/assets
exports.getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ assignedTo: req.user.id });
        res.status(200).json({ success: true, data: assets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Log daily mood
// @route   POST /api/ess/mood
exports.logMood = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const mood = await MoodLog.create(req.body);
        res.status(201).json({ success: true, data: mood });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Raise support ticket
// @route   POST /api/ess/tickets
exports.raiseTicket = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const ticket = await SupportTicket.create(req.body);
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
