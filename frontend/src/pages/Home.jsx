import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  createOrLoginUser,
  getAllUsers,
  getConversationSummaries,
} from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './Home.css';

const CURRENT_USER_KEY = 'currentUser';
const SAVED_ACCOUNTS_KEY = 'savedAccounts';

const readJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const persistSavedAccount = (user) => {
  const existingAccounts = readJSON(localStorage.getItem(SAVED_ACCOUNTS_KEY), []);
  const nextAccounts = [user, ...existingAccounts.filter((account) => account._id !== user._id)].slice(0, 5);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  return nextAccounts;
};

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chatSummaries, setChatSummaries] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState({});
  const [loading, setLoading] = useState(true);
  const [loginMode, setLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [rememberedAccounts, setRememberedAccounts] = useState([]);

  const refreshUsers = async () => {
    const response = await getAllUsers();
    setUsers(response.data);
  };

  const refreshConversationSummaries = async (userId) => {
    if (!userId) {
      setChatSummaries([]);
      return;
    }

    try {
      const response = await getConversationSummaries(userId);
      setChatSummaries(response.data);
    } catch (error) {
      console.error('Error loading conversation summaries:', error);
    }
  };

  // Restore saved session and remembered accounts
  useEffect(() => {
    const savedUser = readJSON(localStorage.getItem(CURRENT_USER_KEY), null);
    const savedAccounts = readJSON(localStorage.getItem(SAVED_ACCOUNTS_KEY), []);

    setRememberedAccounts(savedAccounts);

    if (savedUser) {
      setCurrentUser(savedUser);
      setLoginMode(false);
    }

    setLoading(false);
  }, []);

  // Load users and summaries when signed in
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const loadData = async () => {
      try {
        await refreshUsers();
        await refreshConversationSummaries(currentUser._id);
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };

    loadData();
  }, [currentUser]);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) {
      setSocket(null);
      return undefined;
    }

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('✓ Connected to server');

      if (currentUser) {
        newSocket.emit('user_online', currentUser._id);
      }
    });

    newSocket.on('online_users', (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on('user_status_update', ({ userId, isOnline, lastSeenAt }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isOnline,
                lastSeenAt,
              }
            : user
        )
      );
    });

    newSocket.on('user_typing', (data) => {
      setTyping((prev) => ({
        ...prev,
        [data.senderId]: true,
      }));
    });

    newSocket.on('user_stop_typing', (data) => {
      setTyping((prev) => ({
        ...prev,
        [data.senderId]: false,
      }));
    });

    newSocket.on('message_read_receipt', () => {
      if (currentUser) {
        refreshConversationSummaries(currentUser._id);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser]);

  const rememberAccount = (user) => {
    const nextAccounts = persistSavedAccount(user);
    setRememberedAccounts(nextAccounts);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
      setLoading(true);
      const response = await createOrLoginUser(username);
      const user = response.data.user;
      setCurrentUser(user);
      setLoginMode(false);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      rememberAccount(user);
      await refreshUsers();
      await refreshConversationSummaries(user._id);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSavedAccount = async (account) => {
    setLoading(true);
    try {
      setCurrentUser(account);
      setLoginMode(false);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(account));
      rememberAccount(account);
      await refreshUsers();
      await refreshConversationSummaries(account._id);
    } catch (error) {
      console.error('Error switching account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchUser = () => {
    setCurrentUser(null);
    setSelectedUser(null);
    setUsername('');
    setLoginMode(true);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const handleConversationActivity = async () => {
    if (currentUser) {
      await refreshConversationSummaries(currentUser._id);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (loginMode || !currentUser) {
    return (
      <div className="login-container">
        <div className="login-box auth-card">
          <div className="login-header">
            <div className="brand-mark">WA</div>
            <h1>WhatsApp Clone</h1>
            <p>Pick a saved account or sign in with a username</p>
          </div>

          {rememberedAccounts.length > 0 && (
            <div className="saved-accounts">
              <div className="saved-accounts-title">Remembered accounts</div>
              <div className="saved-accounts-grid">
                {rememberedAccounts.map((account) => (
                  <button
                    key={account._id}
                    type="button"
                    className="saved-account-card"
                    onClick={() => handleUseSavedAccount(account)}
                  >
                    <span className="saved-account-avatar">
                      {account.username?.[0]?.toUpperCase()}
                    </span>
                    <span className="saved-account-name">{account.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                autoFocus
              />
            </div>
            <button type="submit" className="login-button">
              Continue
            </button>
          </form>

          <p className="demo-info">Try usernames like alice, bob, or charlie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="chat-container">
        <Sidebar
          users={users}
          currentUser={currentUser}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onSwitchUser={handleSwitchUser}
          onlineUsers={onlineUsers}
          chatSummaries={chatSummaries}
        />
        <ChatWindow
          currentUser={currentUser}
          selectedUser={selectedUser}
          socket={socket}
          onlineUsers={onlineUsers}
          typing={typing}
          onConversationActivity={handleConversationActivity}
        />
      </div>
    </div>
  );
};

export default Home;
