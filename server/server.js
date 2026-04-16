require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const chatRoutes = require('./routes/chat.routes');
const jobRoutes = require('./routes/job.routes');

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Define frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobRoutes);

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

      // Save to db
      const newMessage = new Message({
        conversationId,
        sender,
        text,
        image,
        audio
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

      // Emit to receiver's room
      io.to(receiver).emit('receiveMessage', {
        conversationId,
        sender,
        senderName: senderUser?.name || 'Someone',
        text,
        image,
        audio,
        createdAt: newMessage.createdAt
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
