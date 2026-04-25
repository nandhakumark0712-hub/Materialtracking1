const Material = require('../models/Material');

const MaterialRequest = require('../models/MaterialRequest');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res, next) => {
    try {
        const materials = await Material.find().populate('createdBy', 'name');
        res.status(200).json({
            success: true,
            count: materials.length,
            data: materials
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a material request
// @route   POST /api/materials/request
// @access  Private
exports.requestMaterial = async (req, res, next) => {
    try {
        const request = await MaterialRequest.create({
            ...req.body,
            employee: req.user.id
        });
        res.status(201).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my material requests
// @route   GET /api/materials/requests/my
// @access  Private
exports.getMyRequests = async (req, res, next) => {
    try {
        const requests = await MaterialRequest.find({ employee: req.user.id }).populate('material', 'name unit').sort('-createdAt');
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all material requests (for Manager/Admin)
// @route   GET /api/materials/requests
// @access  Private/Manager/Admin
exports.getAllRequests = async (req, res, next) => {
    try {
        const requests = await MaterialRequest.find().populate('employee', 'name role').populate('material', 'name unit').sort('-createdAt');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        next(err);
    }
};

// @desc    Update material request status
// @route   PUT /api/materials/requests/:id
// @access  Private/Manager/Admin
exports.updateRequestStatus = async (req, res, next) => {
    try {
        const request = await MaterialRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = req.body.status;
        request.approvedBy = req.user.id;
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private (Admin, Manager)
exports.createMaterial = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;
        
        const material = await Material.create(req.body);
        
        // Real-time update via Socket.io (to be integrated)
        // const io = require('../server').io;
        // io.emit('materialAdded', material);

        res.status(201).json({
            success: true,
            data: material
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private
exports.updateMaterial = async (req, res, next) => {
    try {
        let material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        material = await Material.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: material
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Admin)
exports.deleteMaterial = async (req, res, next) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        await material.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
