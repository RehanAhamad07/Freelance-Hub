const express = require('express');
const { 
  createProposal, 
  getProposalsByJob, 
  getProposalCount, 
  getMyProposals, 
  updateProposalStatus 
} = require('../controllers/proposal.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Create a proposal
router.post('/', authMiddleware, createProposal);

// Get all proposals for a job
router.get('/job/:jobId/all', getProposalsByJob);

// Get proposal count for a job
router.get('/job/:jobId/count', getProposalCount);

// Get my proposals
router.get('/my-proposals', authMiddleware, getMyProposals);

// Update proposal status
router.patch('/:proposalId', authMiddleware, updateProposalStatus);

module.exports = router;
