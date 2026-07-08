const express = require('express');
const { getConversations, getMessages, createOrGetConversation, blockUser, unblockUser, toggleMuteConversation, clearConversation, reportUser } = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/conversations', authMiddleware, getConversations);
router.post('/conversations', authMiddleware, createOrGetConversation);
router.get('/:conversationId/messages', authMiddleware, getMessages);

// Block/Unblock users
router.post('/block', authMiddleware, blockUser);
router.post('/unblock', authMiddleware, unblockUser);

// Mute/Unmute conversations
router.post('/mute', authMiddleware, toggleMuteConversation);

// Clear conversation
router.delete('/:conversationId/clear', authMiddleware, clearConversation);

// Report user
router.post('/report', authMiddleware, reportUser);

module.exports = router;
