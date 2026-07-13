const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getProfile, getPublicProfile, updateProfile, googleLogin, toggleSaveService, toggleSaveJob, getSavedItems, walletTransaction, forgotPassword, resetPassword, requestVerification } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/verification/request', authMiddleware, requestVerification);
router.get('/public/:userId', getPublicProfile);

// Saved Items Routes
router.post('/save-service/:id', authMiddleware, toggleSaveService);
router.post('/save-job/:id', authMiddleware, toggleSaveJob);
router.get('/saved', authMiddleware, getSavedItems);
router.post('/wallet/transaction', authMiddleware, walletTransaction);

module.exports = router;
