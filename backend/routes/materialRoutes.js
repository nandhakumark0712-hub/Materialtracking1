const express = require('express');
const {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    requestMaterial,
    getMyRequests,
    getAllRequests,
    updateRequestStatus
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/request', requestMaterial);
router.get('/requests/my', getMyRequests);

// Management routes
router.get('/requests', authorize('Admin', 'Manager'), getAllRequests);
router.put('/requests/:id', authorize('Admin', 'Manager'), updateRequestStatus);

router
    .route('/')
    .get(getMaterials)
    .post(authorize('Admin', 'Manager'), createMaterial);

router
    .route('/:id')
    .put(authorize('Admin', 'Manager'), updateMaterial)
    .delete(authorize('Admin', 'Manager'), deleteMaterial);

module.exports = router;
