const express = require('express');
const router = express.Router();
const { 
    submitChecklist, 
    getMyVisits, 
    getAllVisits,
    updateFieldVisit,
    deleteFieldVisit
} = require('../controllers/fieldVisitController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/', upload.single('image'), submitChecklist);
router.get('/my', getMyVisits);
router.get('/', authorize('Admin', 'Manager'), getAllVisits);
router.put('/:id', updateFieldVisit);
router.delete('/:id', deleteFieldVisit);

module.exports = router;
