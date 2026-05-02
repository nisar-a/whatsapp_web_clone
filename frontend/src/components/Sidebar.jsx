import React from 'react';
import './ChatWindow.css';

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

const Sidebar = ({
  users,
  currentUser,
  selectedUser,
  onSelectUser,
  onSwitchUser,
  onlineUsers,
  chatSummaries,
}) => {
  const summaryByUserId = new Map(
    (chatSummaries || []).map((summary) => [summary.user._id, summary])
  );

  const otherUsers = users
    .filter((user) => user._id !== currentUser?._id)
    .map((user) => ({
      user,
      summary: summaryByUserId.get(user._id) || null,
    }))
    .sort((left, right) => {
      const leftTime = left.summary?.lastMessage?.createdAt
        ? new Date(left.summary.lastMessage.createdAt).getTime()
        : 0;
      const rightTime = right.summary?.lastMessage?.createdAt
        ? new Date(right.summary.lastMessage.createdAt).getTime()
        : 0;

      return rightTime - leftTime;
    });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="current-user-info">
          <div className="user-avatar">{currentUser?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h3>{currentUser?.username}</h3>
            <span className="my-status">
              {onlineUsers?.includes(currentUser?._id) ? 'Online now' : formatLastSeen(currentUser?.lastSeenAt)}
            </span>
          </div>
        </div>
        <button className="switch-user-btn" onClick={onSwitchUser} title="Switch User">
          ↺
        </button>
      </div>

      <div className="users-list">
        <div className="list-header">
          <h4>Chats</h4>
          <span className="list-subtitle">Recent conversations</span>
        </div>

        {otherUsers.length === 0 ? (
          <div className="no-users">No users available</div>
        ) : (
          otherUsers.map(({ user, summary }) => {
            const isSelected = user._id === selectedUser?._id;
            const isOnline = onlineUsers?.includes(user._id);
            const previewText = summary?.lastMessage?.text || 'No messages yet';
            const unreadCount = summary?.unreadCount || 0;

            return (
              <button
                key={user._id}
                type="button"
                className={`user-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectUser(user)}
              >
                <div className="user-avatar">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="user-row">
                    <h4>{user.username}</h4>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                  </div>
                  <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                    {isOnline ? '● Online' : formatLastSeen(user.lastSeenAt)}
                  </span>
                  <p className="conversation-preview">{previewText}</p>
                </div>
                {isOnline && <div className="online-indicator"></div>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
