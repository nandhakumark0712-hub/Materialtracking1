const express = require('express');
const { getTeam, assignTask, handleLeave, getTeamAttendance } = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Manager', 'Admin'));

router.get('/team', getTeam);
router.get('/stats', authorize('Manager', 'Admin'), require('../controllers/managerController').getManagerStats);
router.post('/tasks', assignTask);
router.put('/leaves/:id', handleLeave);
router.get('/team-attendance', getTeamAttendance);

module.exports = router;
