const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const Material = require('../models/Material');

// @desc    Get CRM Statistics
// @route   GET /api/crm/stats
// @access  Private
exports.getCRMStats = async (req, res, next) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { assignedTo: new mongoose.Types.ObjectId(req.user.id) };
        
        const totalLeads = await Customer.countDocuments({ ...query, status: { $ne: 'Converted' } });
        const activeDeals = await Deal.countDocuments({ ...query, status: { $in: ['Pending', 'Approved'] } });
        const followUpsToday = await FollowUp.countDocuments({ 
            ...query, 
            status: 'Pending',
            date: { $gte: new Date().setHours(0,0,0,0), $lt: new Date().setHours(23,59,59,999) } 
        });

        const revenue = await Deal.aggregate([
            { $match: { ...query, status: 'Won' } },
            { $group: { _id: null, total: { $sum: "$value" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                activeDeals,
                followUpsToday,
                revenueExpected: revenue.length > 0 ? revenue[0].total : 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all leads/customers
// @route   GET /api/crm/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };
        const customers = await Customer.find(query).sort('-createdAt');
        
        // Filter logic for frontend safety (though usually handled by frontend tabs)
        // Converted/Customer tab should only see Approved leads
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Lead/Customer
// @route   PUT /api/crm/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
    try {
        let customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Lead not found' });

        if (customer.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Reset approval if transitioning to Qualified or Converted
        if ((req.body.status === 'Qualified' || req.body.status === 'Converted') && customer.status !== req.body.status) {
            req.body.approvalStatus = 'Pending';
        }

        customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: customer });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Lead/Customer
// @route   DELETE /api/crm/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Lead not found' });

        if (customer.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await customer.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Create Lead
// @route   POST /api/crm/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.create({
            ...req.body,
            assignedTo: req.user.id
        });
        res.status(201).json({ success: true, data: customer });
    } catch (err) {
        next(err);
    }
};
// @desc    Create Deal
// @route   POST /api/crm/deals
// @access  Private
exports.createDeal = async (req, res, next) => {
    try {
        const deal = await Deal.create({
            ...req.body,
            assignedTo: req.user.id
        });
        res.status(201).json({ success: true, data: deal });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my deals
// @route   GET /api/crm/deals
// @access  Private
exports.getDeals = async (req, res, next) => {
    try {
        const deals = await Deal.find({ assignedTo: req.user.id }).populate('customer', 'name');
        res.status(200).json({ success: true, count: deals.length, data: deals });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Deal
// @route   PUT /api/crm/deals/:id
// @access  Private
exports.updateDeal = async (req, res, next) => {
    try {
        let deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ message: 'Deal not found' });
        
        // Check ownership
        if (deal.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Restrict 'Won' status to Approved deals only
        if (req.body.status === 'Won' && deal.status !== 'Approved' && !['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(400).json({ message: 'Deal must be Approved before marking as Won' });
        }

        // Handle stock deduction if status changes to Won
        if (req.body.status === 'Won' && deal.status !== 'Won') {
            for (const item of deal.items) {
                const material = await Material.findById(item.material);
                if (material) {
                    if (material.quantity < item.quantity) {
                        return res.status(400).json({ message: `Insufficient stock for ${material.name}` });
                    }
                    material.quantity -= item.quantity;
                    await material.save();
                }
            }
        }

        deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: deal });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Deal Approval
// @route   PUT /api/crm/deals/:id/approval
// @access  Private (Admin)
exports.handleDealApproval = async (req, res, next) => {
    try {
        const { status } = req.body;
        const deal = await Deal.findById(req.params.id);

        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        deal.status = status;
        await deal.save();

        // Notify Sales Person
        await Notification.create({
            to: deal.assignedTo,
            title: 'Deal Approval Update',
            message: `Your deal "${deal.title}" has been ${status}.`,
            type: 'General'
        });

        const io = req.app.get('io');
        if (io) io.emit('notification', { userId: deal.assignedTo, message: `Deal ${status}` });

        res.status(200).json({ success: true, data: deal });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Lead Approval
// @route   PUT /api/crm/customers/:id/approval
// @access  Private (Admin/Manager)
exports.handleLeadApproval = async (req, res, next) => {
    try {
        const { approvalStatus, adminComment } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) return res.status(404).json({ message: 'Lead not found' });

        customer.approvalStatus = approvalStatus;
        if (adminComment) customer.adminComment = adminComment;
        
        // Auto-convert to Customer if approved
        if (approvalStatus === 'Approved') {
            customer.isCustomer = true;
        }

        await customer.save();

        // Notify Sales Person
        if (customer.assignedTo) {
            try {
                await Notification.create({
                    to: customer.assignedTo,
                    title: 'Lead Approval Update',
                    message: `Your lead "${customer.name}" has been ${approvalStatus}.`,
                    type: 'General'
                });
            } catch (notifyErr) {
                console.error('Notification failed:', notifyErr);
            }
        }

        res.status(200).json({ success: true, data: customer });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Deal
// @route   DELETE /api/crm/deals/:id
// @access  Private
exports.deleteDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        if (deal.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await deal.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Schedule Follow-up
// @route   POST /api/crm/followups
// @access  Private
exports.scheduleFollowUp = async (req, res, next) => {
    try {
        const followUp = await FollowUp.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: followUp });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Follow-ups
// @route   GET /api/crm/followups
exports.getFollowUps = async (req, res, next) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { user: req.user.id };
        const followUps = await FollowUp.find(query)
            .populate('lead', 'name company')
            .populate('deal', 'title')
            .sort('date');
        res.status(200).json({ success: true, data: followUps });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Follow-up status
// @route   PUT /api/crm/followups/:id
exports.updateFollowUp = async (req, res, next) => {
    try {
        const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: followUp });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Sales Leaderboard
// @route   GET /api/crm/leaderboard
exports.getLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await Deal.aggregate([
            { $match: { status: 'Won' } },
            { $group: { 
                _id: '$assignedTo', 
                totalRevenue: { $sum: '$value' },
                dealsWon: { $sum: 1 }
            }},
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }},
            { $unwind: '$user' },
            { $project: {
                name: '$user.name',
                revenue: '$totalRevenue',
                deals: '$dealsWon',
                avatar: '$user.avatar'
            }},
            { $sort: { revenue: -1 } }
        ]);
        res.status(200).json({ success: true, data: leaderboard });
    } catch (err) {
        next(err);
    }
};

exports.getPipeline = async (req, res, next) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { assignedTo: new mongoose.Types.ObjectId(req.user.id) };
        
        const pipeline = await Deal.aggregate([
            { $match: query },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                value: { $sum: '$value' }
            }}
        ]);
        res.status(200).json({ success: true, data: pipeline });
    } catch (err) {
        next(err);
    }
};
