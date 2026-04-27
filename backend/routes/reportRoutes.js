const express = require('express');
const { 
    exportInventory, 
    exportSales, 
    exportProcurement 
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Manager', 'HR'));

router.get('/inventory', exportInventory);
router.get('/sales', exportSales);
router.get('/procurement', exportProcurement);

module.exports = router;
