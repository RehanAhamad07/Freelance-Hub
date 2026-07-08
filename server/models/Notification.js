const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'system', 
      'proposal_accepted', 
      'order_created', 
      'transaction_credit', 
      'transaction_debit',
      'work_delivered',
      'order_completed',
      'revision_requested',
      'order_disputed',
      'job_match'
    ],
    default: 'system'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
