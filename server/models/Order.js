const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  deliveryTime: {
    type: String, // Value saved from the service at the time of order
  },
  stripeSessionId: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
