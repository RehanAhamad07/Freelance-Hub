const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: false,
  },
  image: {
    type: String,
  },
  audio: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  flagReasons: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
