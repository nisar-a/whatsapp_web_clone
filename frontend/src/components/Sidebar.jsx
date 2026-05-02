import React from 'react';
import './ChatWindow.css';

const Sidebar = ({
  users,
  currentUser,
  selectedUser,
  onSelectUser,
  onSwitchUser,
  onlineUsers,
}) => {
  // Filter out current user from users list
  const otherUsers = users.filter((user) => user._id !== currentUser?._id);

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="current-user-info">
          <div className="user-avatar">{currentUser?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h3>{currentUser?.username}</h3>
            <span className="my-status">My Account</span>
          </div>
        </div>
        <button className="switch-user-btn" onClick={onSwitchUser} title="Switch User">
          🔄
        </button>
      </div>

      {/* Users List */}
      <div className="users-list">
        <div className="list-header">
          <h4>Chats</h4>
        </div>

        {otherUsers.length === 0 ? (
          <div className="no-users">No users available</div>
        ) : (
          otherUsers.map((user) => {
            const isSelected = user._id === selectedUser?._id;
            const isOnline = onlineUsers?.includes(user._id);

            return (
              <div
                key={user._id}
                className={`user-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectUser(user)}
              >
                <div className="user-avatar">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="user-details">
                  <h4>{user.username}</h4>
                  <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                    {isOnline ? '● Online' : '● Offline'}
                  </span>
                </div>
                {isOnline && <div className="online-indicator"></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
