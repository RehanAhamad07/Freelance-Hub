require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { sendOfflineMessageEmail } = require('./utils/email');

const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const chatRoutes = require('./routes/chat.routes');
const jobRoutes = require('./routes/job.routes');
const proposalRoutes = require('./routes/proposal.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const User = require('./models/User');
const { moderateMessage } = require('./utils/chatModeration');

// Initialize Cron Jobs
require('./cron/autoComplete');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Define frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP' }
});

// Middleware
app.use(globalLimiter);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach Socket.io to req for global broadcasting
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io for Real-time Chat
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a personal room to receive personal notifications/messages
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, sender, receiver, text, image, audio } = data;

      // Run chat moderation on text messages
      let flagged = false;
      let flagReasons = [];
      if (text) {
        const modResult = moderateMessage(text);
        flagged = modResult.flagged;
        flagReasons = modResult.reasons;
      }

      // Save to db
      const newMessage = new Message({
        conversationId,
        sender,
        text,
        image,
        audio,
        flagged,
        flagReasons
      });
      await newMessage.save();

      let previewText = text || '';
      if (image) previewText = '📷 Sent an image';
      if (audio) previewText = '🎤 Sent a voice message';

      // Update conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: previewText,
        lastMessageAt: new Date()
      });

      // Get Sender details
      const senderUser = await User.findById(sender).select('name');

      // Check if receiver is online
      const receiverRoom = io.sockets.adapter.rooms.get(receiver);
      const isOnline = receiverRoom && receiverRoom.size > 0;

      if (isOnline) {
        // Emit to receiver's room
        io.to(receiver).emit('receiveMessage', {
          conversationId,
          sender,
          senderName: senderUser?.name || 'Someone',
          text,
          image,
          audio,
          flagged,
          flagReasons,
          createdAt: newMessage.createdAt
        });
      } else {
        // Receiver is offline, send email notification
        const receiverUser = await User.findById(receiver).select('email');
        if (receiverUser && receiverUser.email) {
          sendOfflineMessageEmail(receiverUser.email, senderUser?.name || 'Someone', previewText)
            .catch(err => console.error('Failed to send offline message email:', err));
        }
      }

      // Warn the sender if their message was flagged
      if (flagged) {
        io.to(sender).emit('messageFlagged', {
          conversationId,
          messageId: newMessage._id,
          reasons: flagReasons
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5002;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
