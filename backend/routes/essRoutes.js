const express = require('express');
const router = express.Router();
const { 
    getPayslips, 
    submitExpense, 
    getAssets, 
    logMood, 
    raiseTicket 
} = require('../controllers/essController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/payslips', getPayslips);
router.post('/expenses', submitExpense);
router.get('/assets', getAssets);
router.post('/mood', logMood);
router.post('/tickets', raiseTicket);

module.exports = router;
