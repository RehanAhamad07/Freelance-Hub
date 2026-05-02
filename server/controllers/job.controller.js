const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    if (!req.user.roles.includes('client')) {
      return res.status(403).json({ error: 'Only clients can post jobs' });
    }

    const job = new Job({
      ...req.body,
      client: req.user.userId,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getJobs = async (req, res) => {
  try {
    const { category, search, client, status, minBudget, maxBudget } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (client) query.client = client;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };
    
    // Budget range filtering - ensure proper type conversion
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) {
        const min = parseFloat(minBudget);
        if (!isNaN(min)) query.budget.$gte = min;
      }
      if (maxBudget) {
        const max = parseFloat(maxBudget);
        if (!isNaN(max)) query.budget.$lte = max;
      }
    }

    const jobs = await Job.find(query).populate('client', 'name profilePicture rating').sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('client', 'name email profilePicture bio rating completedJobs');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, client: req.user.userId },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found or unauthorized' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.user.userId });
    if (!job) return res.status(404).json({ error: 'Job not found or unauthorized' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
