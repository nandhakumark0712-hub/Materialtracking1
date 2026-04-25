const express = require('express');
const { 
    getAllPendingRequests, 
    handleDealApproval, 
    handleMaterialApproval, 
    handleGeneralApproval,
    handleOrderApproval,
    handleMaterialCreationApproval
} = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/pending', getAllPendingRequests);
router.put('/deal/:id', handleDealApproval);
router.put('/material/:id', handleMaterialApproval);
router.put('/general/:id', handleGeneralApproval);
router.put('/order/:id', handleOrderApproval);
router.put('/material-creation/:id', handleMaterialCreationApproval);

module.exports = router;
