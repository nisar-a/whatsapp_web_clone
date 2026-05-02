const socketIO = require('socket.io');
const User = require('../models/User');

const onlineUsers = {}; // { userId: socketId }

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✓ New client connected:', socket.id);

    /**
     * User comes online
     * Expects: { userId }
     */
    socket.on('user_online', async (userId) => {
      try {
        onlineUsers[userId] = socket.id;
        socket.userId = userId;

        // Update user status in database
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        });

        // Broadcast online users to all clients
        const onlineUserIds = Object.keys(onlineUsers);
        io.emit('online_users', onlineUserIds);

        console.log(`✓ User ${userId} is online`);
      } catch (error) {
        console.error('Error in user_online:', error);
      }
    });

    /**
     * Receive message event
     * Expects: { senderId, receiverId, text }
     */
    socket.on('send_message', (data) => {
      const { senderId, receiverId, text } = data;

      // Send message to receiver if online
      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit('receive_message', {
          senderId,
          receiverId,
          text,
          createdAt: new Date(),
        });
        console.log(`✓ Message sent from ${senderId} to ${receiverId}`);
      } else {
        console.log(`✗ User ${receiverId} is offline - message queued`);
      }
    });

    /**
     * Typing indicator
     * Expects: { senderId, receiverId }
     */
    socket.on('typing', (data) => {
      const { senderId, receiverId } = data;

      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit('user_typing', {
          senderId,
        });
      }
    });

    /**
     * Stop typing indicator
     * Expects: { senderId, receiverId }
     */
    socket.on('stop_typing', (data) => {
      const { senderId, receiverId } = data;

      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit('user_stop_typing', {
          senderId,
        });
      }
    });

    /**
     * Disconnect user
     */
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          delete onlineUsers[socket.userId];

          // Update user status in database
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            socketId: null,
          });

          // Broadcast updated online users
          const onlineUserIds = Object.keys(onlineUsers);
          io.emit('online_users', onlineUserIds);

          console.log(`✓ User ${socket.userId} went offline`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = { initializeSocket, onlineUsers };
