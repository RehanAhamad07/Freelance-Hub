const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const createProposal = async (req, res) => {
  try {
    const { jobId, title, description, bidAmount, deliveryTime, coverLetter } = req.body;

    if (!req.user.roles.includes('freelancer')) {
      return res.status(403).json({ error: 'Only freelancers can submit proposals' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if freelancer already has a proposal for this job
    const existingProposal = await Proposal.findOne({
      job: jobId,
      freelancer: req.user.userId,
    });

    if (existingProposal) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this job' });
    }

    const proposal = new Proposal({
      title,
      description,
      bidAmount,
      deliveryTime,
      coverLetter,
      job: jobId,
      freelancer: req.user.userId,
    });

    await proposal.save();
    await proposal.populate('freelancer', 'name profilePicture rating');
    
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Proposal creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProposalsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const proposals = await Proposal.find({ job: jobId })
      .populate('freelancer', 'name profilePicture rating email')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Fetch proposals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProposalCount = async (req, res) => {
  try {
    const { jobId } = req.params;

    const count = await Proposal.countDocuments({ job: jobId });
    res.json({ count });
  } catch (error) {
    console.error('Count proposals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.userId })
      .populate('job', 'title budget category')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Fetch my proposals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProposalStatus = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const proposal = await Proposal.findById(proposalId).populate('job');

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Only client can accept/reject or freelancer can withdraw
    if (status === 'withdrawn' && proposal.freelancer.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the freelancer can withdraw' });
    }

    if ((status === 'accepted' || status === 'rejected') && proposal.job.client.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the client can accept/reject' });
    }

    proposal.status = status;
    await proposal.save();

    // Trigger notification
    if (status === 'accepted') {
      const notif = new Notification({
        recipient: proposal.freelancer,
        type: 'proposal_accepted',
        message: `Your proposal for "${proposal.job.title}" has been accepted!`,
        link: `/jobs/${proposal.job._id}`
      });
      await notif.save();
      
      if (req.io) {
        req.io.to(proposal.freelancer.toString()).emit('newNotification', notif);
      }
    }

    res.json(proposal);
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { 
  createProposal, 
  getProposalsByJob, 
  getProposalCount, 
  getMyProposals, 
  updateProposalStatus 
};
