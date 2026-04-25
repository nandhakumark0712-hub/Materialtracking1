const FieldVisit = require('../models/FieldVisit');

// @desc    Submit field visit checklist
// @route   POST /api/field-visits
exports.submitChecklist = async (req, res) => {
    try {
        console.log('Incoming Field Visit Request:', req.body);
        const visitData = { ...req.body };
        visitData.employee = req.user.id;
        
        if (req.file) {
            visitData.imageUrl = `/uploads/field-visits/${req.file.filename}`;
        }

        if (typeof visitData.responses === 'string') {
            visitData.responses = JSON.parse(visitData.responses);
        }

        const visit = await FieldVisit.create(visitData);
        res.status(201).json({ success: true, data: visit });
    } catch (error) {
        console.error('Field Visit Submission Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Validation failed' });
    }
};

// @desc    Get employee visit history
// @route   GET /api/field-visits/my
exports.getMyVisits = async (req, res) => {
    try {
        const visits = await FieldVisit.find({ employee: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: visits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all visit history (Admin/Manager)
// @route   GET /api/field-visits
exports.getAllVisits = async (req, res) => {
    try {
        const visits = await FieldVisit.find().populate('employee', 'name email').sort('-createdAt');
        res.status(200).json({ success: true, data: visits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update field visit
exports.updateFieldVisit = async (req, res) => {
    try {
        let visit = await FieldVisit.findById(req.params.id);
        if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
        if (visit.employee.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

        visit = await FieldVisit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: visit });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete field visit
exports.deleteFieldVisit = async (req, res) => {
    try {
        const visit = await FieldVisit.findById(req.params.id);
        if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
        if (visit.employee.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

        await visit.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
