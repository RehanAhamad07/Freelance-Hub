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
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true,
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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
