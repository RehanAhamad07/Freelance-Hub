const User = require('../models/User');
const Order = require('../models/Order');

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email roles isBanned bannedAt bannedReason walletBalance verificationStatus verificationDocument isTopRated paymentVerified createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const banReason = typeof reason === 'string' ? reason.trim() : '';
    if (banReason.length < 5) {
      return res.status(400).json({ error: 'Ban reason should be at least 5 characters' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.roles?.includes('admin')) {
      return res.status(400).json({ error: 'Admin users cannot be banned from portal' });
    }

    user.isBanned = true;
    user.bannedReason = banReason;
    user.bannedAt = new Date();
    await user.save();

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isBanned = false;
    user.bannedReason = '';
    user.bannedAt = null;
    await user.save();

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'completed' })
      .select('price createdAt')
      .lean();

    const totalGross = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalRevenue = Math.round(totalGross * 0.1);
    const totalPayout = totalGross - totalRevenue;

    const monthlyMap = new Map();
    for (const order of completedOrders) {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyMap.get(key) || { gross: 0, revenue: 0, payout: 0, completedOrders: 0 };
      current.gross += order.price || 0;
      current.revenue += Math.round((order.price || 0) * 0.1);
      current.payout += (order.price || 0) - Math.round((order.price || 0) * 0.1);
      current.completedOrders += 1;
      monthlyMap.set(key, current);
    }

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, values]) => ({ month, ...values }));

    res.json({
      totals: {
        grossVolume: totalGross,
        platformRevenue: totalRevenue,
        sellerPayouts: totalPayout,
        completedOrders: completedOrders.length
      },
      monthly
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isTopRated } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (status !== undefined) {
      if (!['unverified', 'pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid verification status' });
      }
      user.verificationStatus = status;
    }

    if (isTopRated !== undefined) {
      user.isTopRated = Boolean(isTopRated);
    }

    await user.save();
    res.json({ message: 'User verification settings updated successfully', user });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAdminUsers,
  banUser,
  unbanUser,
  getRevenueAnalytics,
  updateVerificationStatus
};
