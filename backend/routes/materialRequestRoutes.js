const express = require('express');
const { 
    requestMaterial, 
    getMyRequests, 
    getAllMaterialRequests, 
    handleMaterialRequestApproval 
} = require('../controllers/materialRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/request', requestMaterial);
router.get('/my-requests', getMyRequests);

// Admin only routes
router.get('/requests/all', authorize('Admin'), getAllMaterialRequests);
router.put('/requests/:id/approval', authorize('Admin'), handleMaterialRequestApproval);

module.exports = router;
