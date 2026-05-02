const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { 
  getUserNotifications, 
  markAsRead, 
  createMockNotification 
} = require('../controllers/notification.controller');

router.get('/', authMiddleware, getUserNotifications);
router.put('/:notificationId/read', authMiddleware, markAsRead);
router.post('/notify', authMiddleware, createMockNotification); // Mock manual push

module.exports = router;
