const express = require('express');
const { getERPStats, getOrders, createOrder, getVendors, updateOrder, deleteOrder } = require('../controllers/erpController');
const { submitPurchaseRequest, getPurchaseRequests, handlePurchaseApproval } = require('../controllers/procurementController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getERPStats);
router.route('/orders')
    .get(getOrders)
    .post(createOrder);

router.route('/orders/:id')
    .put(updateOrder)
    .delete(deleteOrder);

router.get('/vendors', getVendors);

// Procurement Routes
router.route('/purchase-requests')
    .get(getPurchaseRequests)
    .post(authorize('Manager', 'Admin'), submitPurchaseRequest);

router.put('/purchase-requests/:id/approval', authorize('Admin'), handlePurchaseApproval);

module.exports = router;
