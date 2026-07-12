const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const {
  getAdminUsers,
  banUser,
  unbanUser,
  getRevenueAnalytics,
  updateVerificationStatus,
  getAdminServices,
  deleteAdminService,
  getAdminJobs,
  deleteAdminJob
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/users', getAdminUsers);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.post('/users/:id/verification', updateVerificationStatus);
router.get('/analytics/revenue', getRevenueAnalytics);

// Services (Gigs) management
router.get('/services', getAdminServices);
router.delete('/services/:id', deleteAdminService);

// Jobs management
router.get('/jobs', getAdminJobs);
router.delete('/jobs/:id', deleteAdminJob);

module.exports = router;
