const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const jobController = require('../controllers/job.controller');

router.post('/', authMiddleware, jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

module.exports = router;
