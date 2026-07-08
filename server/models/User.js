const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    enum: ['client', 'freelancer', 'admin'],
    default: ['client', 'freelancer'],
  },
  profilePicture: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  portfolio: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  completedJobs: {
    type: Number,
    default: 0,
  },
  phone: {
    type: String,
    default: '',
  },
  education: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  country: {
    type: String,
    default: '',
  },
  savedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  walletBalance: {
    type: Number,
    default: 5000, // Default to $5000 for testing purposes
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  bannedReason: {
    type: String,
    default: '',
  },
  bannedAt: {
    type: Date,
  },
  resetPasswordOtp: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mutedConversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },
  verificationDocument: {
    type: String,
    default: '',
  },
  isTopRated: {
    type: Boolean,
    default: false,
  },
  paymentVerified: {
    type: Boolean,
    default: true, // defaults to true for demo clients
  },
  portfolioItems: [{
    title: { type: String, default: '' },
    link: { type: String, default: '' },
    description: { type: String, default: '' },
    mediaUrl: { type: String, default: '' }
  }],
  themeColor: {
    type: String,
    default: '#3B82F6', // default blue
  },
  headerBackground: {
    type: String,
    default: '', // URL to custom header image/gradient
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
