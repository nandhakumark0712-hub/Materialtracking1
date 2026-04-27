const MaterialRequest = require('../models/MaterialRequest');

// @desc    Request material
// @route   POST /api/materials/request
// @access  Private
exports.requestMaterial = async (req, res, next) => {
    try {
        const materialReq = await MaterialRequest.create({
            employee: req.user.id,
            material: req.body.materialId,
            quantity: req.body.quantity,
            reason: req.body.reason
        });

        res.status(201).json({ success: true, data: materialReq });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my material requests
// @route   GET /api/materials/my-requests
// @access  Private
exports.getMyRequests = async (req, res, next) => {
    try {
        const requests = await MaterialRequest.find({ employee: req.user.id }).populate('material', 'name unit');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all material requests (Admin)
// @route   GET /api/materials/requests/all
// @access  Private (Admin)
exports.getAllMaterialRequests = async (req, res, next) => {
    try {
        const requests = await MaterialRequest.find()
            .populate('employee', 'name role')
            .populate('material', 'name unit quantity')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        next(err);
    }
};

// @desc    Handle Material Request Approval
// @route   PUT /api/materials/requests/:id/approval
// @access  Private (Admin)
exports.handleMaterialRequestApproval = async (req, res, next) => {
    try {
        const { status } = req.body;
        const materialReq = await MaterialRequest.findById(req.params.id).populate('material');

        if (!materialReq) return res.status(404).json({ message: 'Request not found' });

        if (status === 'Approved') {
            const material = materialReq.material;
            if (material.quantity < materialReq.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock. Current: ${material.quantity}, Requested: ${materialReq.quantity}. Please initiate procurement.` 
                });
            }
            // Deduct from inventory
            material.quantity -= materialReq.quantity;
            await material.save();
        }

        materialReq.status = status;
        materialReq.approvedBy = req.user.id;
        await materialReq.save();

        res.status(200).json({ success: true, data: materialReq });
    } catch (err) {
        next(err);
    }
};
