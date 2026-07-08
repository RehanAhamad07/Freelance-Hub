const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendOfflineMessageEmail } = require('../utils/email');

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

    // --- Smart Job-to-Talent Matchmaking (runs async, doesn't block response) ---
    (async () => {
      try {
        if (!job.skills || job.skills.length === 0) return;

        // Find freelancers whose skills overlap with the job requirements
        const matchingFreelancers = await User.find({
          roles: 'freelancer',
          skills: { $in: job.skills },
          _id: { $ne: req.user.userId }, // Exclude the job poster
          isBanned: { $ne: true }
        }).select('_id name email skills').limit(50);

        if (matchingFreelancers.length === 0) return;

        const currency = job.currency === 'INR' ? '₹' : '$';
        const matchedSkills = job.skills.slice(0, 3).join(', ');

        for (const freelancer of matchingFreelancers) {
          // Create in-app notification
          const notif = new Notification({
            recipient: freelancer._id,
            type: 'job_match',
            message: `🎯 New job matching your skills: "${job.title}" — ${currency}${job.budget} (${matchedSkills})`,
            link: `/jobs/${job._id}`
          });
          await notif.save();

          // Emit real-time notification via socket
          if (req.io) {
            req.io.to(freelancer._id.toString()).emit('newNotification', notif);
          }

          // Send email notification (non-blocking)
          if (freelancer.email) {
            sendOfflineMessageEmail(
              freelancer.email,
              'FreelanceHub Job Match',
              `A new job matching your skills was just posted!\n\n"${job.title}" — ${currency}${job.budget}\nSkills: ${matchedSkills}\n\nView it now on FreelanceHub!`
            ).catch(err => console.error('Match email error:', err));
          }
        }

        console.log(`Job matchmaking: Notified ${matchingFreelancers.length} freelancers for job "${job.title}"`);
      } catch (matchError) {
        console.error('Job matchmaking error:', matchError);
      }
    })();
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
