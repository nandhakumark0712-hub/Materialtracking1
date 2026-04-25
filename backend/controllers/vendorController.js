const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
exports.getVendors = async (req, res, next) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        const vendors = await Vendor.find(query).sort('-createdAt');
        res.status(200).json({ success: true, count: vendors.length, data: vendors });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single vendor details
// @route   GET /api/vendors/:id
// @access  Private
exports.getVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const orders = await Order.find({ vendor: vendor._id }).sort('-createdAt');
        
        res.status(200).json({ 
            success: true, 
            data: {
                ...vendor._doc,
                orderHistory: orders
            } 
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create vendor
// @route   POST /api/vendors
// @access  Private (Admin)
exports.createVendor = async (req, res, next) => {
    try {
        const vendorId = `VEN-${Math.floor(1000 + Math.random() * 9000)}`;
        const vendor = await Vendor.create({
            ...req.body,
            vendorId
        });
        res.status(201).json({ success: true, data: vendor });
    } catch (err) {
        next(err);
    }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin)
exports.updateVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json({ success: true, data: vendor });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin)
exports.deleteVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        await vendor.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
