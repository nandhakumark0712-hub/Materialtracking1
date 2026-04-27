const PurchaseRequest = require('../models/PurchaseRequest');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Submit Purchase Request
// @route   POST /api/erp/purchase-requests
// @access  Private (Manager/Admin)
exports.submitPurchaseRequest = async (req, res, next) => {
    try {
        const request = await PurchaseRequest.create({
            ...req.body,
            requester: req.user.id
        });

        // Notify Admin
        const Admin = await require('../models/User').findOne({ role: 'Admin' });
        if (Admin) {
            await Notification.create({
                to: Admin._id,
                title: 'New Purchase Request',
                message: `Manager ${req.user.name} submitted a request for ${req.body.itemName}`,
                type: 'General'
            });
        }

        const io = req.app.get('io');
        if (io) io.emit('notification', { message: 'New Purchase Request Received' });

        res.status(201).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};

// @desc    Get All Purchase Requests
// @route   GET /api/erp/purchase-requests
// @access  Private
exports.getPurchaseRequests = async (req, res, next) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { requester: req.user.id };
        const requests = await PurchaseRequest.find(query)
            .populate('requester', 'name role')
            .populate('vendor', 'name')
            .populate('material', 'name sku')
            .sort('-createdAt');
            
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Purchase Approval
// @route   PUT /api/erp/purchase-requests/:id/approval
// @access  Private (Admin)
exports.handlePurchaseApproval = async (req, res, next) => {
    try {
        const { status, adminComments } = req.body;
        const request = await PurchaseRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ message: 'Request not found' });

        const oldStatus = request.status;
        request.status = status;
        request.adminComments = adminComments;
        if (status === 'Approved' && oldStatus !== 'Approved') request.approvedAt = Date.now();
        await request.save();

        // If Approved AND it's a new approval, Create actual Purchase Order and Update Inventory
        if (status === 'Approved' && oldStatus !== 'Approved') {
            let targetMaterialId = request.material;

            // 1. Check if Material exists or needs to be created
            if (!targetMaterialId) {
                // Try to find material by name (case-insensitive)
                let existingMaterial = await Material.findOne({ 
                    name: { $regex: new RegExp(`^${request.itemName}$`, 'i') } 
                });

                if (existingMaterial) {
                    targetMaterialId = existingMaterial._id;
                    request.material = targetMaterialId;
                } else {
                    // Create new material record
                    const newMaterial = await Material.create({
                        name: request.itemName,
                        sku: `SKU-${Date.now().toString().slice(-6)}`,
                        category: 'Procured',
                        quantity: 0, // Will be updated below
                        unit: 'pcs',
                        status: 'Approved',
                        createdBy: req.user.id
                    });
                    targetMaterialId = newMaterial._id;
                    request.material = targetMaterialId;
                }
                await request.save();
            }

            // 2. Create Purchase Order
            await Order.create({
                orderID: `PO-${Date.now().toString().slice(-6)}`,
                vendor: request.vendor,
                totalAmount: request.amount,
                status: 'Approved',
                items: [{ 
                    material: targetMaterialId, 
                    quantity: request.quantity, 
                    price: request.amount / request.quantity 
                }]
            });

            // 3. Update Material Inventory (Additive Logic)
            if (targetMaterialId) {
                const material = await Material.findById(targetMaterialId);
                if (material) {
                    material.quantity = (material.quantity || 0) + request.quantity;
                    await material.save();
                }
            }
        }

        // Notify Manager
        await Notification.create({
            to: request.requester,
            title: 'Purchase Request Update',
            message: `Your request for ${request.itemName} has been ${status}.`,
            type: 'General'
        });

        const io = req.app.get('io');
        if (io) io.emit('notification', { userId: request.requester, message: `Request ${status}` });

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};
