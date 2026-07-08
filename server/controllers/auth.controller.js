const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { sendWelcomeEmail, sendPasswordResetOtp } = require('../utils/email');
const { generateReferralCode } = require('../utils/gamification');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(v => v.trim()).filter(Boolean);
const getIsAdmin = (user) => {
  const id = user?._id?.toString?.() || '';
  return (Array.isArray(user?.roles) && user.roles.includes('admin')) || ADMIN_IDS.includes(id);
};

const register = async (req, res) => {
  try {
    const { name, email, password, referralCode: refCode } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let myReferralCode = generateReferralCode(name);
    while (await User.findOne({ referralCode: myReferralCode })) {
      myReferralCode = generateReferralCode(name);
    }

    // Check if referred by someone
    let referredBy = null;
    if (refCode) {
      const referrer = await User.findOne({ referralCode: refCode });
      if (referrer) referredBy = referrer._id;
    }

    user = new User({
      name,
      email,
      password: hashedPassword,
      roles: ['client', 'freelancer'],
      referralCode: myReferralCode,
      referredBy,
    });

    await user.save();

    // Send Welcome Email
    sendWelcomeEmail(user.email, user.name).catch(err => console.error('Failed to send welcome email:', err));

    const payload = { userId: user._id, roles: user.roles };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name,
        email,
        roles: user.roles,
        walletBalance: user.walletBalance,
        isAdmin: getIsAdmin(user)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'No user');
    if (!user) return res.status(400).json({ error: 'Invalid credentials - user not found' });
    if (user.isBanned) return res.status(403).json({ error: 'Your account has been banned by admin' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials - password mismatch' });

    const payload = { userId: user._id, roles: user.roles };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email,
        roles: user.roles,
        profilePicture: user.profilePicture,
        walletBalance: user.walletBalance,
        isAdmin: getIsAdmin(user)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const userObj = user.toObject();
    userObj.isAdmin = getIsAdmin(user);
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const allowedFields = ['bio', 'phone', 'country', 'education', 'languages', 'skills', 'profilePicture', 'portfolioItems'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = new User({
        name,
        email,
        password: hashedPassword,
        profilePicture: picture || '',
        roles: ['client', 'freelancer']
      });
      await user.save();
      
      // Send Welcome Email
      sendWelcomeEmail(user.email, user.name).catch(err => console.error('Failed to send welcome email:', err));
    }
    if (user.isBanned) return res.status(403).json({ error: 'Your account has been banned by admin' });

    const jwtPayload = { userId: user._id, roles: user.roles };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email,
        roles: user.roles,
        profilePicture: user.profilePicture,
        savedServices: user.savedServices,
        savedJobs: user.savedJobs,
        walletBalance: user.walletBalance,
        isAdmin: getIsAdmin(user)
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ error: 'Google authentication failed' });
  }
};

const toggleSaveService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const savedServices = user.savedServices || [];
    const isSaved = savedServices.some(sId => sId.toString() === id.toString());
    
    let updatedUser;
    if (isSaved) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedServices: id } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedServices: id } },
        { new: true }
      );
    }
    
    res.json({ savedServices: updatedUser.savedServices });
  } catch (error) {
    console.error('Toggle save service error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const toggleSaveJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const savedJobs = user.savedJobs || [];
    const isSaved = savedJobs.some(jId => jId.toString() === id.toString());
    
    let updatedUser;
    if (isSaved) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedJobs: id } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedJobs: id } },
        { new: true }
      );
    }
    
    res.json({ savedJobs: updatedUser.savedJobs });
  } catch (error) {
    console.error('Toggle save job error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const getSavedItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId)
      .populate({
        path: 'savedServices',
        populate: { path: 'freelancer', select: 'name profilePicture' }
      })
      .populate({
        path: 'savedJobs',
        populate: { path: 'client', select: 'name profilePicture' }
      });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      savedServices: user.savedServices,
      savedJobs: user.savedJobs
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const walletTransaction = async (req, res) => {
  try {
    const { type, amount } = req.body || {};
    const value = Number(amount);
    if (!['deposit', 'withdraw'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (type === 'withdraw' && user.walletBalance < value) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    user.walletBalance = type === 'deposit'
      ? user.walletBalance + value
      : user.walletBalance - value;
    await user.save();

    res.json({
      message: type === 'deposit' ? 'Wallet topped up successfully' : 'Withdrawal successful',
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Wallet transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before saving to DB
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    // Send OTP via Email
    const emailSent = await sendPasswordResetOtp(user.email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent to email successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() } // Ensure OTP hasn't expired
    });

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const requestVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { documentUrl } = req.body;
    if (!documentUrl || typeof documentUrl !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid document or portfolio link' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.verificationStatus = 'pending';
    user.verificationDocument = documentUrl.trim();
    await user.save();

    const userObj = user.toObject();
    userObj.isAdmin = getIsAdmin(user);
    res.json({ message: 'Verification request submitted successfully', user: userObj });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getProfile, getPublicProfile, updateProfile, googleLogin, toggleSaveService, toggleSaveJob, getSavedItems, walletTransaction, forgotPassword, resetPassword, requestVerification };
