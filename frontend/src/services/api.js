import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const createOrLoginUser = (username) =>
  api.post('/users', { username });

export const getAllUsers = () => api.get('/users');

export const getUserById = (userId) => api.get(`/users/${userId}`);

// Message APIs
export const sendMessage = (senderId, receiverId, text) =>
  api.post('/messages', { senderId, receiverId, text });

export const getConversation = (senderId, receiverId) =>
  api.get(`/messages/${senderId}/${receiverId}`);

export const getAllMessages = () => api.get('/messages');

export default api;
