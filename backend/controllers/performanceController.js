const KPI = require('../models/KPI');
const Goal = require('../models/Goal');
const Reward = require('../models/Reward');

// @desc    Get performance dashboard data
// @route   GET /api/performance/me
exports.getMyPerformance = async (req, res) => {
    try {
        const kpis = await KPI.find({ user: req.user.id });
        const goals = await Goal.find({ user: req.user.id });
        const rewards = await Reward.find({ user: req.user.id });
        
        res.status(200).json({
            success: true,
            data: {
                kpis,
                goals,
                rewards
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update goal progress
// @route   PUT /api/performance/goals/:id
exports.updateGoal = async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }
        
        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        
        goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({ success: true, data: goal });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
