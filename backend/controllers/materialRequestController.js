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
