const Order = require('../models/Order');
const GeneralRequest = require('../models/GeneralRequest');
const Deal = require('../models/Deal');
const MaterialRequest = require('../models/MaterialRequest');
const PurchaseRequest = require('../models/PurchaseRequest');
const Material = require('../models/Material');
const Notification = require('../models/Notification');

// @desc    Get All Pending Requests (Unified)
// @route   GET /api/approvals/pending
// @access  Private (Admin)
exports.getAllPendingRequests = async (req, res, next) => {
    try {
        const [general, deals, materials, mrUsage, orders, purchases] = await Promise.all([
            GeneralRequest.find({ status: 'Pending' }).populate('requester', 'name role'),
            Deal.find({ status: 'Pending' }).populate('assignedTo', 'name role').populate('customer', 'name'),
            Material.find({ status: 'Pending Approval' }).populate('createdBy', 'name role'),
            MaterialRequest.find({ status: 'Pending' }).populate('employee', 'name role').populate('material', 'name quantity'),
            Order.find({ status: 'Pending Approval' }).populate('vendor', 'name'),
            PurchaseRequest.find({ status: 'Pending' }).populate('requester', 'name role').populate('vendor', 'name')
        ]);

        res.status(200).json({
            success: true,
            data: {
                general,
                deals,
                materials, // New Materials
                mrUsage,   // Material Usage Requests
                orders,    // Purchase Orders
                purchases  // Purchase Requests from Managers
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Order Approval
// @route   PUT /api/approvals/order/:id
exports.handleOrderApproval = async (req, res, next) => {
    try {
        const { status, adminComment } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status === 'Approved' ? 'Approved' : 'Cancelled';
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Material Creation Approval
// @route   PUT /api/approvals/material-creation/:id
exports.handleMaterialCreationApproval = async (req, res, next) => {
    try {
        const { status } = req.body;
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        material.status = status;
        await material.save();

        res.status(200).json({ success: true, data: material });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve/Reject Deal
// @route   PUT /api/approvals/deal/:id
// @access  Private (Admin)
exports.handleDealApproval = async (req, res, next) => {
    try {
        const { status, adminComment } = req.body;
        const deal = await Deal.findById(req.params.id);

        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        deal.status = status;
        await deal.save();

        await Notification.create({
            to: deal.assignedTo,
            title: 'Deal Update',
            message: `Your deal "${deal.title}" has been ${status}. ${adminComment || ''}`,
            type: 'General'
        });

        const io = req.app.get('io');
        if (io) io.emit('notification', { userId: deal.assignedTo, message: `Deal ${status}` });

        res.status(200).json({ success: true, data: deal });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve/Reject Material Request (Usage)
// @route   PUT /api/approvals/material/:id
// @access  Private (Admin)
exports.handleMaterialApproval = async (req, res, next) => {
    try {
        const { status, adminComment } = req.body;
        const matReq = await MaterialRequest.findById(req.params.id).populate('material');

        if (!matReq) return res.status(404).json({ message: 'Request not found' });

        if (status === 'Approved') {
            if (matReq.material.quantity < matReq.quantity) {
                return res.status(400).json({ message: 'Insufficient stock to approve' });
            }
            matReq.material.quantity -= matReq.quantity;
            await matReq.material.save();
        }

        matReq.status = status;
        matReq.approvedBy = req.user.id;
        await matReq.save();

        await Notification.create({
            to: matReq.employee,
            title: 'Material Request Update',
            message: `Material request for ${matReq.material.name} has been ${status}.`,
            type: 'Material'
        });

        const io = req.app.get('io');
        if (io) io.emit('notification', { userId: matReq.employee, message: `Material Request ${status}` });

        res.status(200).json({ success: true, data: matReq });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle General Request
// @route   PUT /api/approvals/general/:id
exports.handleGeneralApproval = async (req, res, next) => {
    try {
        const { status, adminComment } = req.body;
        const genReq = await GeneralRequest.findById(req.params.id);

        if (!genReq) return res.status(404).json({ message: 'Request not found' });

        genReq.status = status;
        genReq.adminComment = adminComment;
        await genReq.save();

        await Notification.create({
            to: genReq.requester,
            title: 'Request Update',
            message: `Your ${genReq.type} request has been ${status}.`,
            type: 'General'
        });

        res.status(200).json({ success: true, data: genReq });
    } catch (err) {
        next(err);
    }
};
