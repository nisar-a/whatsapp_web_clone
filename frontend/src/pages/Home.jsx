import React, { useState, useEffect } from 'react';
import { getAllUsers, createOrLoginUser } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './Home.css';
import io from 'socket.io-client';

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState({});
  const [loading, setLoading] = useState(true);
  const [loginMode, setLoginMode] = useState(true);
  const [username, setUsername] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('✓ Connected to server');

      // Notify server that user is online
      if (currentUser) {
        newSocket.emit('user_online', currentUser._id);
      }
    });

    // Listen for online users update
    newSocket.on('online_users', (users) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
    });

    // Listen for typing indicator
    newSocket.on('user_typing', (data) => {
      setTyping((prev) => ({
        ...prev,
        [data.senderId]: true,
      }));
    });

    // Listen for stop typing
    newSocket.on('user_stop_typing', (data) => {
      setTyping((prev) => ({
        ...prev,
        [data.senderId]: false,
      }));
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Disconnected from server');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Handle user login/signup
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

      // Store user to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(user));

      setLoginMode(false);
      const usersResponse = await getAllUsers();
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user switch
  const handleSwitchUser = async () => {
    setCurrentUser(null);
    setSelectedUser(null);
    setUsername('');
    setLoginMode(true);
    localStorage.removeItem('currentUser');
  };

  // Check localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setLoginMode(false);
        setLoading(false);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

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
        <div className="login-box">
          <div className="login-header">
            <h1>💬 WhatsApp Clone</h1>
            <p>Sign in to your account</p>
          </div>

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
              Login
            </button>
          </form>

          <p className="demo-info">Demo: Try usernames like "alice", "bob", "charlie"</p>
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
        />
        <ChatWindow
          currentUser={currentUser}
          selectedUser={selectedUser}
          socket={socket}
          onlineUsers={onlineUsers}
          typing={typing}
        />
      </div>
    </div>
  );
};

export default Home;
