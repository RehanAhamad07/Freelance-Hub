const { generateJobDescription, generateProposalCoverLetter } = require('../utils/ai');

const generateDescription = async (req, res) => {
  try {
    const { title, category, skills, budget, deliveryTime } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Job title is required to generate a description' });
    }

    const description = await generateJobDescription(title, category, skills, budget, deliveryTime);
    res.json({ description });
  } catch (error) {
    console.error('AI generate description error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate description' });
  }
};

const generateProposal = async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    
    if (!jobTitle) {
      return res.status(400).json({ error: 'Job title is required to generate a proposal' });
    }

    // Get the freelancer's profile data from the authenticated user
    const User = require('../models/User');
    const user = await User.findById(req.user.userId).select('name bio skills');
    
    const coverLetter = await generateProposalCoverLetter(
      user?.name || 'Freelancer',
      user?.bio || '',
      user?.skills || [],
      jobTitle,
      jobDescription
    );
    
    res.json({ coverLetter });
  } catch (error) {
    console.error('AI generate proposal error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
  }
};

module.exports = { generateDescription, generateProposal };
