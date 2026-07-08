const express = require('express');
const { getDashboardAnalytics, updateProfileTheme } = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardAnalytics);
router.put('/theme', authMiddleware, updateProfileTheme);

module.exports = router;
