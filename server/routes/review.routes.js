const express = require('express');
const { createReview, getServiceReviews } = require('../controllers/review.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, createReview);
router.get('/:serviceId', getServiceReviews);

module.exports = router;
