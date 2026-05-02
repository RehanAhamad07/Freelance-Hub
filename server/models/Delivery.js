const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  file: {
    type: String, // URL from Cloudinary or local path
    required: true,
  },
  message: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
