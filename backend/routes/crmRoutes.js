const express = require('express');
const { 
    getCRMStats, getCustomers, createCustomer, 
    createDeal, getDeals, scheduleFollowUp,
    updateDeal, deleteDeal, updateCustomer, deleteCustomer,
    getFollowUps, updateFollowUp, getLeaderboard, getPipeline,
    handleDealApproval, handleLeadApproval
} = require('../controllers/crmController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
// General CRM access
router.use(authorize('Sales Team', 'Admin', 'Manager', 'HR'));

router.get('/stats', getCRMStats);

router.route('/customers')
    .get(getCustomers)
    .post(createCustomer);

// Lead Approval (Admin/Manager)
router.put('/lead-approval/:id', authorize('Admin', 'Manager'), handleLeadApproval);

router.route('/customers/:id')
    .put(updateCustomer)
    .delete(deleteCustomer);

router.route('/deals')
    .get(getDeals)
    .post(createDeal);

// Deal Approval (Admin Only)
router.put('/deal-approval/:id', authorize('Admin'), handleDealApproval);

router.route('/deals/:id')
    .put(updateDeal)
    .delete(deleteDeal);

router.route('/followups')
    .get(getFollowUps)
    .post(scheduleFollowUp);

router.put('/followups/:id', updateFollowUp);
router.get('/leaderboard', getLeaderboard);
router.get('/pipeline', getPipeline);

module.exports = router;
