const Order = require('../models/Order');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const { getFreelancerLevel, LEVELS } = require('../utils/gamification');

/**
 * Get analytics data for the authenticated user's dashboard
 * Returns: monthly revenue, proposal win rate, profile views (simulated), order stats
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // --- Monthly Revenue (last 6 months) ---
    const completedOrders = await Order.find({
      $or: [{ freelancer: userId }, { client: userId }],
      status: 'completed',
      createdAt: { $gte: sixMonthsAgo }
    }).select('price createdAt freelancer client');

    const monthlyRevenue = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthOrders = completedOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= monthDate && d <= monthEnd;
      });

      const earned = monthOrders
        .filter(o => o.freelancer.toString() === userId)
        .reduce((sum, o) => sum + (o.price * 0.9), 0); // after 10% platform fee

      const spent = monthOrders
        .filter(o => o.client.toString() === userId)
        .reduce((sum, o) => sum + o.price, 0);

      monthlyRevenue.push({
        month: monthNames[monthDate.getMonth()],
        earned: Math.round(earned * 100) / 100,
        spent: Math.round(spent * 100) / 100,
      });
    }

    // --- Proposal Win Rate ---
    const allProposals = await Proposal.find({ freelancer: userId }).select('status');
    const totalProposals = allProposals.length;
    const acceptedProposals = allProposals.filter(p => p.status === 'accepted').length;
    const pendingProposals = allProposals.filter(p => p.status === 'pending').length;
    const rejectedProposals = allProposals.filter(p => p.status === 'rejected').length;
    const winRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

    // --- Order Stats ---
    const allOrders = await Order.find({
      $or: [{ freelancer: userId }, { client: userId }]
    }).select('status createdAt price');

    const orderStats = {
      total: allOrders.length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      inProgress: allOrders.filter(o => o.status === 'in_progress').length,
      disputed: allOrders.filter(o => o.status === 'disputed').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
    };

    // --- Profile Views (simulated with realistic data based on activity) ---
    const profileViews = [];
    const baseViews = Math.max(5, (orderStats.completed * 8) + (totalProposals * 3));
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Simulate growth with some variance
      const variance = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
      const trend = 1 + (5 - i) * 0.08; // slight upward trend
      profileViews.push({
        month: monthNames[monthDate.getMonth()],
        views: Math.round(baseViews * variance * trend),
      });
    }

    // --- Total Revenue ---
    const totalEarned = completedOrders
      .filter(o => o.freelancer.toString() === userId)
      .reduce((sum, o) => sum + (o.price * 0.9), 0);

    // Get freelancer level
    const currentUser = await User.findById(userId).select('totalEarnings rating completedJobs referralCode');
    const levelInfo = getFreelancerLevel(currentUser || {});

    res.json({
      monthlyRevenue,
      proposalStats: { total: totalProposals, accepted: acceptedProposals, pending: pendingProposals, rejected: rejectedProposals, winRate },
      orderStats,
      profileViews,
      totalEarned: Math.round(totalEarned * 100) / 100,
      levelInfo,
      referralCode: currentUser?.referralCode || '',
      allLevels: LEVELS,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics data' });
  }
};

/**
 * Update user's profile theme customization
 */
const updateProfileTheme = async (req, res) => {
  try {
    const { themeColor, headerBackground } = req.body;
    const update = {};

    if (themeColor) update.themeColor = themeColor;
    if (headerBackground !== undefined) update.headerBackground = headerBackground;

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true })
      .select('themeColor headerBackground');

    res.json(user);
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

module.exports = { getDashboardAnalytics, updateProfileTheme };
