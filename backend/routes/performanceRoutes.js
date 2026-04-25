const express = require('express');
const router = express.Router();
const { 
    getMyPerformance, 
    updateGoal 
} = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getMyPerformance);
router.put('/goals/:id', updateGoal);

module.exports = router;
