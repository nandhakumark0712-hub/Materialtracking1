const express = require('express');
const { getStats, getUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Dashbord stats - Admin only
router.get('/stats', authorize('Admin'), getStats);

// User Management - Shared access for Admin/Manager/HR for visibility and creation
router.route('/users')
    .get(authorize('Admin', 'Manager', 'HR'), getUsers)
    .post(authorize('Admin', 'Manager', 'HR'), createUser);

router.route('/users/:id')
    .put(authorize('Admin', 'Manager'), updateUser)
    .delete(authorize('Admin'), deleteUser);

module.exports = router;
