import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getConversation } from '../services/api';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

const ChatWindow = ({
  currentUser,
  selectedUser,
  socket,
  onlineUsers,
  typing,
}) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversation when selected user changes
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await getConversation(currentUser._id, selectedUser._id);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (
        (data.senderId === selectedUser?._id &&
          data.receiverId === currentUser?._id) ||
        (data.senderId === currentUser?._id &&
          data.receiverId === selectedUser?._id)
      ) {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, selectedUser, currentUser]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedUser || !currentUser) return;

    try {
      const response = await sendMessage(
        currentUser._id,
        selectedUser._id,
        messageText
      );

      // Add message to local state
      setMessages((prev) => [...prev, response.data.data]);

      // Emit to socket for real-time
      socket?.emit('send_message', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: messageText,
        createdAt: new Date(),
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  // Handle typing
  const handleTyping = () => {
    socket?.emit('typing', {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  };

  if (!selectedUser || !currentUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h2>Select a user to start chatting</h2>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers?.includes(selectedUser._id);

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="user-info">
          <h3>{selectedUser.username}</h3>
          <span className={`status ${isUserOnline ? 'online' : 'offline'}`}>
            {isUserOnline ? '● Online' : '● Offline'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              currentUserId={currentUser._id}
            />
          ))
        )}

        {typing && selectedUser && typing[selectedUser._id] && (
          <div className="typing-indicator">
            <span>Typing</span>
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
          }}
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
