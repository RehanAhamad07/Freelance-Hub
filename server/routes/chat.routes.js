const express = require('express');
const { getConversations, getMessages, createOrGetConversation } = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/conversations', authMiddleware, getConversations);
router.post('/conversations', authMiddleware, createOrGetConversation);
router.get('/:conversationId/messages', authMiddleware, getMessages);

module.exports = router;
