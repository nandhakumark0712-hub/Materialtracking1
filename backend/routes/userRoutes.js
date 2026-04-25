const express = require('express');
const { 
    getProfile, 
    updateProfile, 
    changePassword, 
    uploadProfileImage 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/profile/image', upload.single('profileImg'), uploadProfileImage);

module.exports = router;
