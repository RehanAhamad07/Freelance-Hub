const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
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
  tags: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: '',
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
