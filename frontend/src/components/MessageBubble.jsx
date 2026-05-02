import React, { useEffect, useRef } from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.senderId._id === currentUserId;

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">{message.senderId.username}</div>
        )}
        <p className="message-text">{message.text}</p>
        <span className="message-time">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
