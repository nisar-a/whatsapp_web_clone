const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send message
router.post('/', messageController.sendMessage);

// Get conversation between two users
router.get('/:senderId/:receiverId', messageController.getConversation);

// Get all messages (optional)
router.get('/', messageController.getAllMessages);

module.exports = router;
