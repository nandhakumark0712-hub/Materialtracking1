const express = require('express');
const { 
    getVendors, getVendor, createVendor, 
    updateVendor, deleteVendor 
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getVendors)
    .post(authorize('Admin'), createVendor);

router.route('/:id')
    .get(getVendor)
    .put(authorize('Admin'), updateVendor)
    .delete(authorize('Admin'), deleteVendor);

module.exports = router;
