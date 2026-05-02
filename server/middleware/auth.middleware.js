const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer Token
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    User.findById(decoded.userId).select('_id roles isBanned').then((user) => {
      if (!user) return res.status(401).json({ error: 'User not found' });
      if (user.isBanned) return res.status(403).json({ error: 'Your account has been banned' });
      req.user = {
        userId: user._id.toString(),
        roles: user.roles || []
      };
      next();
    }).catch((error) => {
      console.error('Auth middleware user lookup error:', error);
      res.status(500).json({ error: 'Server error' });
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = { authMiddleware };
