const socketIO = require('socket.io');
const User = require('../models/User');
const Message = require('../models/Message');

const onlineUsers = {}; // { userId: socketId }

const getUserId = (value) => value?._id?.toString?.() || value?.toString?.() || value;

const emitStatusUpdate = (io, userId, isOnline, lastSeenAt) => {
  io.emit('user_status_update', {
    userId,
    isOnline,
    lastSeenAt,
  });
};

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
        emitStatusUpdate(io, userId, true, null);

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
      const message = data?.message || data;
      const senderId = getUserId(message.senderId);
      const receiverId = getUserId(message.receiverId);

      // Send message to receiver if online
      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit('receive_message', {
          ...message,
        });
        console.log(`✓ Message sent from ${senderId} to ${receiverId}`);
      } else {
        console.log(`✗ User ${receiverId} is offline - message queued`);
      }
    });

    /**
     * Mark conversation messages as read
     * Expects: { readerId, otherUserId }
     */
    socket.on('mark_messages_read', async (data) => {
      try {
        const readerId = getUserId(data?.readerId);
        const otherUserId = getUserId(data?.otherUserId);

        if (!readerId || !otherUserId) {
          return;
        }

        const result = await Message.updateMany(
          {
            senderId: otherUserId,
            receiverId: readerId,
            readBy: { $ne: readerId },
          },
          {
            $addToSet: { readBy: readerId },
            $set: { readAt: new Date() },
          }
        );

        if (result.modifiedCount > 0 && onlineUsers[otherUserId]) {
          io.to(onlineUsers[otherUserId]).emit('message_read_receipt', {
            readerId,
            senderId: otherUserId,
            readAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error in mark_messages_read:', error);
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

          const lastSeenAt = new Date();

          // Update user status in database
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            socketId: null,
            lastSeenAt,
          });

          // Broadcast updated online users
          const onlineUserIds = Object.keys(onlineUsers);
          io.emit('online_users', onlineUserIds);
          emitStatusUpdate(io, socket.userId, false, lastSeenAt);

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
