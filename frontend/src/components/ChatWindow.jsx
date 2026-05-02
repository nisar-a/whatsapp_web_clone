import React, { useEffect, useRef, useState } from 'react';
import { sendMessage, getConversation } from '../services/api';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

const getId = (value) => value?._id || value;

const hasUserReadMessage = (message, userId) => {
  if (!message || !userId) {
    return false;
  }

  return Array.isArray(message.readBy)
    ? message.readBy.some((reader) => getId(reader) === userId)
    : false;
};

const isSameSender = (left, right) => getId(left?.senderId) === getId(right?.senderId);

const formatLastSeen = (value) => {
  if (!value) {
    return 'Last seen recently';
  }

  const lastSeenDate = new Date(value);
  const now = new Date();
  const diffMs = now - lastSeenDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) {
    return 'Last seen just now';
  }

  if (diffMinutes < 60) {
    return `Last seen ${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `Last seen ${diffHours}h ago`;
  }

  return `Last seen ${lastSeenDate.toLocaleDateString()}`;
};

const ChatWindow = ({
  currentUser,
  selectedUser,
  socket,
  onlineUsers,
  typing,
  onConversationActivity,
}) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const normalizeMessage = (message) => ({
    ...message,
    senderId: typeof message.senderId === 'string' ? { _id: message.senderId } : message.senderId,
    receiverId: typeof message.receiverId === 'string' ? { _id: message.receiverId } : message.receiverId,
  });

  const applyReadReceipt = (readerId) => {
    if (!readerId) {
      return;
    }

    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        const senderId = getId(message.senderId);
        const receiverId = getId(message.receiverId);

        if (senderId === currentUser?._id && receiverId === readerId) {
          const readBy = Array.isArray(message.readBy) ? message.readBy : [];
          const alreadyRead = readBy.some((reader) => getId(reader) === readerId);

          if (alreadyRead) {
            return message;
          }

          return {
            ...message,
            readBy: [...readBy, readerId],
            readAt: new Date().toISOString(),
          };
        }

        return message;
      })
    );
  };

  // Fetch conversation when selected user changes
  useEffect(() => {
    if (!selectedUser || !currentUser) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await getConversation(currentUser._id, selectedUser._id);
        const fetchedMessages = response.data.map(normalizeMessage);
        setMessages(fetchedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  // Mark messages as read when conversation is open
  useEffect(() => {
    if (!socket || !currentUser || !selectedUser || messages.length === 0) {
      return;
    }

    const hasUnreadIncoming = messages.some(
      (message) =>
        getId(message.senderId) === selectedUser._id &&
        !hasUserReadMessage(message, currentUser._id)
    );

    if (hasUnreadIncoming) {
      socket.emit('mark_messages_read', {
        readerId: currentUser._id,
        otherUserId: selectedUser._id,
      });
      onConversationActivity?.();
    }
  }, [messages, socket, currentUser, selectedUser, onConversationActivity]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleReceiveMessage = (incomingMessage) => {
      const message = normalizeMessage(incomingMessage?.message || incomingMessage);
      const senderId = getId(message.senderId);
      const receiverId = getId(message.receiverId);
      const activeConversationMatches =
        (senderId === selectedUser?._id && receiverId === currentUser?._id) ||
        (senderId === currentUser?._id && receiverId === selectedUser?._id);

      if (!activeConversationMatches) {
        onConversationActivity?.();
        return;
      }

      setMessages((prevMessages) => {
        if (prevMessages.some((existingMessage) => existingMessage._id === message._id)) {
          return prevMessages;
        }

        return [...prevMessages, message];
      });

      if (receiverId === currentUser?._id && senderId === selectedUser?._id) {
        socket.emit('mark_messages_read', {
          readerId: currentUser._id,
          otherUserId: selectedUser._id,
        });
      }

      scrollToBottom();
      onConversationActivity?.();
    };

    const handleReadReceipt = ({ readerId, senderId }) => {
      if (senderId !== currentUser?._id || readerId !== selectedUser?._id) {
        return;
      }

      applyReadReceipt(readerId);
      onConversationActivity?.();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_read_receipt', handleReadReceipt);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_read_receipt', handleReadReceipt);
    };
  }, [socket, selectedUser, currentUser, onConversationActivity]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedUser || !currentUser) {
      return;
    }

    try {
      const response = await sendMessage(
        currentUser._id,
        selectedUser._id,
        messageText
      );

      const savedMessage = normalizeMessage(response.data.data);
      setMessages((prevMessages) => [...prevMessages, savedMessage]);

      socket?.emit('send_message', {
        message: savedMessage,
      });

      setMessageText('');
      scrollToBottom();
      onConversationActivity?.();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedUser || !currentUser) {
      return;
    }

    socket.emit('typing', {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  };

  if (!selectedUser || !currentUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="empty-state-card">
            <span className="empty-state-icon">💬</span>
            <h2>Select a user to start chatting</h2>
            <p>Choose a conversation from the left panel.</p>
          </div>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers?.includes(selectedUser._id);
  const conversationStatus = isUserOnline ? 'Online' : formatLastSeen(selectedUser?.lastSeenAt);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="user-info">
          <div className="chat-header-avatar">
            {selectedUser.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3>{selectedUser.username}</h3>
            <span className={`status ${isUserOnline ? 'online' : 'offline'}`}>
              {isUserOnline ? '● Online' : conversationStatus}
            </span>
          </div>
        </div>
        <div className="chat-header-meta">
          <span className="meta-pill">
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message._id || `${getId(message.senderId)}-${message.createdAt}-${index}`}
              message={message}
              currentUserId={currentUser._id}
              selectedUser={selectedUser}
              isPartnerOnline={isUserOnline}
              isFirstInGroup={index === 0 || !isSameSender(messages[index - 1], message)}
              isLastInGroup={index === messages.length - 1 || !isSameSender(message, messages[index + 1])}
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
