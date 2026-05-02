const Notification = require('../models/Notification');

// Fetch user's notification list
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Get recent 50 notifications
      
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

// Mark unread notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // We can also have an endpoint "mark all as read", but for a simple dropdown, doing just an individual mark or a mark-all via one call is beneficial.
    // If notificationId is "all", we mark all.
    if (notificationId === 'all') {
      await Notification.updateMany(
        { recipient: req.user.userId, isRead: false },
        { isRead: true }
      );
      return res.json({ message: 'All notifications marked as read' });
    }
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error updating notification' });
  }
};

// Exposing an endpoint to generate a notification (primarily for our mock UI actions like Transactions)
const createMockNotification = async (req, res) => {
  try {
    const { type, message, link } = req.body;
    
    const notif = new Notification({
      recipient: req.user.userId,
      type,
      message,
      link
    });
    await notif.save();
    
    // Emit via socket immediately if available
    if (req.io) {
      req.io.to(req.user.userId.toString()).emit('newNotification', notif);
    }
    
    res.status(201).json(notif);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error generating notification' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  createMockNotification
};
