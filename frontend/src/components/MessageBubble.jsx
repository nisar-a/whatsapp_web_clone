import React from 'react';
import './MessageBubble.css';

const getId = (value) => value?._id || value;

const hasBeenReadBy = (message, userId) => {
  if (!message || !userId) {
    return false;
  }

  return Array.isArray(message.readBy)
    ? message.readBy.some((reader) => getId(reader) === userId)
    : false;
};

const MessageBubble = ({
  message,
  currentUserId,
  selectedUser,
  isPartnerOnline,
  isFirstInGroup,
  isLastInGroup,
}) => {
  const isOwn = getId(message.senderId) === currentUserId;
  const partnerId = selectedUser?._id;
  const wasReadByPartner = isOwn && partnerId ? hasBeenReadBy(message, partnerId) : false;
  const isDelivered = isOwn && !wasReadByPartner && Boolean(isPartnerOnline);
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`message-row ${isOwn ? 'own' : 'other'} ${isFirstInGroup ? 'group-start' : 'group-mid'} ${isLastInGroup ? 'group-end' : 'group-continuation'}`}
    >
      <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && isFirstInGroup && (
          <div className="message-sender">{message.senderId?.username || 'User'}</div>
        )}

        <p className="message-text">{message.text}</p>

        <div className="message-footer">
          <span className="message-time">{timestamp}</span>
          {isOwn && (
            <span className={`message-status ${wasReadByPartner ? 'read' : isDelivered ? 'delivered' : 'sent'}`}>
              {wasReadByPartner ? '✓✓ Read' : isDelivered ? '✓ Delivered' : '✓ Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
