const express = require('express');
const { createOrder, getOrders } = require('../controllers/order.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);

module.exports = router;
