const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['USD', 'INR'],
    default: 'USD',
  },
  deliveryTime: {
    type: String,
    required: true, // e.g. "3 Days"
  },
  category: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'in_progress'],
    default: 'open',
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
