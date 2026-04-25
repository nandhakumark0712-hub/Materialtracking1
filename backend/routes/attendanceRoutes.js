const express = require('express');
const { checkIn, checkOut, getMyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/checkin', checkIn);
router.put('/checkout', checkOut);
router.get('/my', getMyAttendance);

module.exports = router;
