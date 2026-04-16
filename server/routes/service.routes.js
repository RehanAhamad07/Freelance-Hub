const express = require('express');
const { createService, getServices, getServiceById, updateService, deleteService } = require('../controllers/service.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, createService);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', authMiddleware, updateService);
router.delete('/:id', authMiddleware, deleteService);

module.exports = router;
