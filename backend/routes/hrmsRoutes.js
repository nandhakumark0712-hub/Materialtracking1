const express = require('express');
const { 
    getHRStats, getEmployees, generatePayroll, 
    createJob, getCandidates, applyLeave, 
    getMyLeaves, getAllLeaves, updateLeaveStatus,
    approvePayroll, getMyPayroll, getPerformance, getSupportTickets
} = require('../controllers/hrmsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Employee/Global routes
router.post('/leaves/apply', applyLeave);
router.get('/leaves/my', getMyLeaves);
router.get('/payroll/my', getMyPayroll);

// Shared staff retrieval
router.get('/employees', authorize('HR', 'Admin', 'Manager'), getEmployees);

// HR/Admin specific routes
router.get('/stats', authorize('HR', 'Admin'), getHRStats);
router.post('/payroll/generate', authorize('HR', 'Admin'), generatePayroll);
router.get('/payroll/all', authorize('HR', 'Admin'), async (req, res) => {
    const Payroll = require('../models/Payroll');
    const payrolls = await Payroll.find().populate('employee', 'name role').sort('-createdAt');
    res.json({ success: true, data: payrolls });
});

router.put('/payroll/:id/approve', authorize('Admin'), approvePayroll);

router.post('/jobs', authorize('HR', 'Admin'), createJob);
router.get('/candidates', authorize('HR', 'Admin'), getCandidates);
router.get('/leaves', authorize('HR', 'Admin'), getAllLeaves);
router.put('/leaves/:id', authorize('HR', 'Admin'), updateLeaveStatus);
router.get('/performance', authorize('HR', 'Admin'), getPerformance);
router.get('/tickets', authorize('HR', 'Admin'), getSupportTickets);
router.get('/attendance/trends', authorize('HR', 'Admin'), async (req, res, next) => {
    const { getAttendanceTrends } = require('../controllers/hrmsController');
    return getAttendanceTrends(req, res, next);
});

module.exports = router;
