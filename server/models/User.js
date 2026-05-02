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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
