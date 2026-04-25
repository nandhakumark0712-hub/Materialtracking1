const express = require('express');
const { requestMaterial, getMyRequests } = require('../controllers/materialRequestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/request', requestMaterial);
router.get('/my-requests', getMyRequests);

module.exports = router;
