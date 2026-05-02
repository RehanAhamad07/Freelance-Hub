const User = require('../models/User');

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (ADMIN_IDS.includes(userId.toString())) {
      return next();
    }

    const user = await User.findById(userId).select('roles');
    const isAdmin = !!(user && Array.isArray(user.roles) && user.roles.includes('admin'));

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requireAdmin };
