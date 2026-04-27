const express = require('express');
const router = express.Router();
const { 
    getPrivateMessages, 
    sendPrivateMessage, 
    getAnnouncements, 
    createAnnouncement,
    getAdminProfile 
} = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin-profile', getAdminProfile);
router.get('/messages/:userId', getPrivateMessages);
router.post('/messages', sendPrivateMessage);

router.get('/announcements', getAnnouncements);
router.post('/announcements', authorize('Admin', 'Manager', 'HR'), createAnnouncement);

module.exports = router;
