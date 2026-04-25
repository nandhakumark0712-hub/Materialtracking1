const mongoose = require('mongoose');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

// @desc    Get ERP Statistics
// @route   GET /api/erp/stats
// @access  Private/Manager
exports.getERPStats = async (req, res, next) => {
    try {
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const activeVendors = await Vendor.countDocuments({ status: 'Active' });
        
        const spendingSummary = await Order.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                pendingOrders,
                activeVendors,
                monthlySpending: spendingSummary.length > 0 ? spendingSummary[0].total : 0,
                budgetUtilized: 65 // Placeholder until budget module is added
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all orders
// @route   GET /api/erp/orders
// @access  Private/Manager
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('vendor', 'name');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};

// @desc    Create purchase order
// @route   POST /api/erp/orders
// @access  Private/Manager
exports.createOrder = async (req, res, next) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Update purchase order
// @route   PUT /api/erp/orders/:id
// @access  Private/Manager
exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete purchase order
// @route   DELETE /api/erp/orders/:id
// @access  Private/Manager
exports.deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(`[ERP] Request to delete order: ${id} by user: ${req.user.name}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[ERP] Invalid Order ID format: ${id}`);
            return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
        }

        const order = await Order.findById(id);
        if (!order) {
            console.error(`[ERP] Order record not found in database: ${id}`);
            return res.status(404).json({ success: false, message: 'Purchase order record not found' });
        }

        await order.deleteOne();
        console.log(`[ERP] Order ${id} successfully purged from ledger.`);
        
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        console.error(`[ERP] Critical failure during order deletion: ${err.message}`);
        next(err);
    }
};

// @desc    Get all vendors
// @route   GET /api/erp/vendors
// @access  Private/Manager
exports.getVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.find();
        res.status(200).json({ success: true, data: vendors });
    } catch (err) {
        next(err);
    }
};
