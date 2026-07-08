const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Report = require('../models/Report');

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user.userId] }
    }).populate('participants', 'name profilePicture role').sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createOrGetConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId]
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Block a user
const blockUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userToBlockId } = req.body;

    if (userId === userToBlockId) {
      return res.status(400).json({ error: 'You cannot block yourself' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: userToBlockId } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userToUnblockId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { blockedUsers: userToUnblockId } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'User unblocked successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Mute/Unmute conversation notifications
const toggleMuteConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.body;

    const user = await User.findById(userId);
    const isMuted = user.mutedConversations.includes(conversationId);

    if (isMuted) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { mutedConversations: conversationId } },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { mutedConversations: conversationId } },
        { new: true }
      );
    }

    res.status(200).json({ success: true, message: `Notifications ${isMuted ? 'unmuted' : 'muted'}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Clear conversation (delete all messages)
const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId });

    // Mark conversation as deleted by this user
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Conversation cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Report a user
const reportUser = async (req, res) => {
  try {
    const reportedBy = req.user.userId;
    const { reportedUserId, conversationId, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    // Check if user already reported this user
    const existingReport = await Report.findOne({
      reportedBy,
      reportedUser: reportedUserId,
      status: 'pending'
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this user' });
    }

    const report = new Report({
      reportedBy,
      reportedUser: reportedUserId,
      conversationId,
      reason,
      description: description || ''
    });

    await report.save();
    res.status(201).json({ success: true, message: 'User reported successfully', report });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getConversations, getMessages, createOrGetConversation, blockUser, unblockUser, toggleMuteConversation, clearConversation, reportUser };
