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
    enum: ['pending', 'in_progress', 'delivered', 'completed', 'disputed', 'cancelled'],
    default: 'pending',
  },
  deliveryTime: {
    type: String, // Value saved from the service at the time of order
  },
  escrowAmount: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  disputeWindowEndsAt: {
    type: Date,
  },
  revisionCount: {
    type: Number,
    default: 0,
  },
  disputeCategory: {
    type: String,
    enum: ['quality_issue', 'not_as_described', 'late_delivery', 'plagiarism', 'fraud', 'other'],
  },
  disputeReason: {
    type: String,
    default: '',
  },
  disputeOpenedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  disputeOpenedAt: {
    type: Date,
  },
  disputeResolution: {
    outcome: {
      type: String,
      enum: ['released_to_seller', 'refunded_to_buyer'],
    },
    notes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    }
  },
  disputeTimeline: [{
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['opened', 'buyer_comment', 'seller_comment', 'admin_resolution'],
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    attachmentMimeType: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
  stripeSessionId: {
    type: String,
  },
  paymentIntentId: {
    type: String,
  },
  transferId: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
