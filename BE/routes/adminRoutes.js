const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.post('/login', adminController.adminLogin);
router.get('/stats', protect, admin, adminController.getAdminStats);
router.get('/activity', protect, admin, adminController.getRecentActivity);

module.exports = router;