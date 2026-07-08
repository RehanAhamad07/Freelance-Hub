const express = require('express');
const { generateDescription, generateProposal } = require('../controllers/ai.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limit AI endpoints to prevent abuse (10 requests per 15 min per user)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please try again later.' }
});

router.post('/generate-description', authMiddleware, aiLimiter, generateDescription);
router.post('/generate-proposal', authMiddleware, aiLimiter, generateProposal);

module.exports = router;
