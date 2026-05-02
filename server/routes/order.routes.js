const express = require('express');
const { 
  createOrder, 
  getOrders, 
  deliverOrder, 
  acceptOrder, 
  revisionOrder, 
  disputeOrder,
  addDisputeComment,
  getDisputedOrders,
  resolveDispute
} = require('../controllers/order.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/create', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);

// Escrow & Delivery Endpoints
router.post('/deliver/:id', authMiddleware, upload.single('file'), deliverOrder);
router.post('/accept/:id', authMiddleware, acceptOrder);
router.post('/revision/:id', authMiddleware, revisionOrder);
router.post('/dispute/:id', authMiddleware, disputeOrder);
router.post('/dispute/:id/comment', authMiddleware, upload.single('evidence'), addDisputeComment);
router.get('/disputes/all', authMiddleware, getDisputedOrders);
router.post('/disputes/:id/resolve', authMiddleware, resolveDispute);

// Backward compatibility or alternative routes if the frontend still hits '/' for create
router.post('/', authMiddleware, createOrder);

module.exports = router;
