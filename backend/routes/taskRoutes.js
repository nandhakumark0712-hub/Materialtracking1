const express = require('express');
const { getMyTasks, updateTaskStatus, getAllTasks, createTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyTasks);
router.put('/:id/status', updateTaskStatus);

// HR/Admin/Manager specific
router.route('/')
    .get(authorize('Admin', 'Manager', 'HR'), getAllTasks)
    .post(authorize('Admin', 'Manager', 'HR'), createTask);

module.exports = router;
