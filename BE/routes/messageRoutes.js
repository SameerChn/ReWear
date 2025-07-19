const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Message routes
router.get('/', messageController.getUserMessages);
router.get('/unread-count', messageController.getUnreadCount);
router.put('/:id/read', messageController.markMessageAsRead);

module.exports = router; 