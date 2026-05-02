# Frontend Setup & Component Documentation

## 🎨 Installation

### Prerequisites
- Node.js v14+
- npm or yarn

### Install Dependencies
```bash
cd frontend
npm install
```

### Environment Configuration

Create/Update `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Start Development Server

```bash
npm start
```

Application opens at `http://localhost:3000`

---

## 📱 Component Structure

### 1. Home.jsx (Page Component)

**Location:** `src/pages/Home.jsx`

**Responsibilities:**
- User authentication (login/signup)
- Socket.IO connection management
- Global state management for users and messages
- Real-time event listeners
- User switching

**Key Features:**
- Form-based user login
- Automatic reconnection on mount
- Online users tracking
- Typing indicator state management
- Message history persistence

**Main State:**
```javascript
const [currentUser, setCurrentUser] = useState(null);
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [socket, setSocket] = useState(null);
const [onlineUsers, setOnlineUsers] = useState([]);
const [typing, setTyping] = useState({});
const [loading, setLoading] = useState(true);
const [loginMode, setLoginMode] = useState(true);
```

---

### 2. Sidebar.jsx (Component)

**Location:** `src/components/Sidebar.jsx`

**Responsibilities:**
- Display list of users (excluding current user)
- Highlight selected user
- Show online/offline status
- Allow user selection for chatting
- Display current logged-in user
- Provide user switching button

**Props:**
```javascript
{
  users: Array,           // All users
  currentUser: Object,    // Logged-in user
  selectedUser: Object,   // Currently selected user for chat
  onSelectUser: Function, // Callback when user is selected
  onSwitchUser: Function, // Callback to switch/logout
  onlineUsers: Array      // List of online user IDs
}
```

**Features:**
- User avatar with initials
- Online/offline indicators
- Responsive design
- Smooth selection highlight

---

### 3. ChatWindow.jsx (Component)

**Location:** `src/components/ChatWindow.jsx`

**Responsibilities:**
- Display chat header with selected user info
- Render message history
- Handle real-time messages from Socket.IO
- Provide message input form
- Auto-scroll to latest message
- Show typing indicators

**Props:**
```javascript
{
  currentUser: Object,    // Logged-in user
  selectedUser: Object,   // User being chatted with
  socket: Object,         // Socket.IO instance
  onlineUsers: Array,     // List of online user IDs
  typing: Object          // Typing status by user ID
}
```

**Features:**
- Message fetch on user selection
- Real-time message receive
- Typing indicator detection
- Auto-scroll functionality
- Empty state message
- Loading state

**Main State:**
```javascript
const [messages, setMessages] = useState([]);
const [messageText, setMessageText] = useState('');
const [loading, setLoading] = useState(false);
```

---

### 4. MessageBubble.jsx (Component)

**Location:** `src/components/MessageBubble.jsx`

**Responsibilities:**
- Render individual message bubble
- Style based on sent/received
- Display sender name (for received messages)
- Show message timestamp

**Props:**
```javascript
{
  message: Object,    // Message data
  currentUserId: String // Current user ID
}
```

**Message Object:**
```javascript
{
  _id: String,
  senderId: {
    _id: String,
    username: String
  },
  receiverId: {
    _id: String,
    username: String
  },
  text: String,
  createdAt: Date
}
```

**Features:**
- Left alignment for received messages
- Right alignment for sent messages
- Color coding (green for sent, gray for received)
- Timestamp display

---

## 🔗 API Service (api.js)

**Location:** `src/services/api.js`

**Base URL:** `http://localhost:5000/api` (from `.env`)

### Available Functions

#### User APIs

```javascript
// Create or login user
createOrLoginUser(username)
// Returns: { user, message }

// Get all users
getAllUsers()
// Returns: [{ _id, username, isOnline }, ...]

// Get user by ID
getUserById(userId)
// Returns: { _id, username, isOnline }
```

#### Message APIs

```javascript
// Send message
sendMessage(senderId, receiverId, text)
// Returns: { data: message, message: "Message sent successfully" }

// Get conversation between two users
getConversation(senderId, receiverId)
// Returns: [{ _id, senderId, receiverId, text, createdAt }, ...]

// Get all messages
getAllMessages()
// Returns: [{ ... }, ...]
```

---

## 🎯 User Flow

### 1. **Login Screen**
```
User lands on http://localhost:3000
↓
Sees login form
↓
Enters username
↓
Clicks Login button
↓
POST /api/users with username
↓
User created/retrieved from database
↓
User redirected to chat interface
```

### 2. **Chat Interface**
```
User sees login page → Chat page
↓
Sidebar loads with all other users
↓
User selects another user
↓
GET /api/messages/:senderId/:receiverId
↓
Message history loads
↓
Chat window becomes active
```

### 3. **Sending Message**
```
User types message in input
↓
User clicks Send button
↓
POST /api/messages
↓
Message saved to database
↓
Socket.IO 'send_message' event emitted
↓
Receiver's Socket.IO receives 'receive_message'
↓
Message appears instantly in receiver's chat
```

### 4. **Real-Time Updates**
```
User connects → Socket.IO 'user_online' event
↓
Server broadcasts updated online users list
↓
All clients receive 'online_users' event
↓
Sidebar updates with online status
↓
When user disconnects → Same reverse flow
```

---

## 📊 State Management Flow

```
Home Component (Main State Manager)
├── currentUser
├── users
├── selectedUser
├── socket
├── onlineUsers
└── typing

Sidebar Component (Props from Home)
└── Displays users and handles selection

ChatWindow Component (Props from Home)
├── Displays messages
├── Sends new messages
└── Listens for real-time updates
```

---

## 🔌 Socket.IO Integration

### Connection Setup (in Home.jsx)

```javascript
useEffect(() => {
  const newSocket = io(process.env.REACT_APP_SOCKET_URL);
  
  newSocket.on('connect', () => {
    newSocket.emit('user_online', currentUser._id);
  });
  
  newSocket.on('online_users', (users) => {
    setOnlineUsers(users);
  });
  
  setSocket(newSocket);
  
  return () => newSocket.close();
}, [currentUser]);
```

### Receiving Messages (in ChatWindow.jsx)

```javascript
useEffect(() => {
  socket?.on('receive_message', (data) => {
    if (isConversation(data)) {
      setMessages(prev => [...prev, data]);
    }
  });
}, [socket, selectedUser]);
```

---

## 🎨 Styling Architecture

### CSS Files

1. **index.css** - Global styles, login page
2. **App.css** - Main layout, sidebar, chat window, messages
3. **Home.css** - Page-specific styles
4. **ChatWindow.css** - ChatWindow component (included in App.css)
5. **MessageBubble.css** - MessageBubble component (included in App.css)

### Design System

```
Colors:
- Primary: #128c7e (WhatsApp green)
- Secondary: #25d366 (Bright green)
- Background: #fff (White)
- Border: #e0e0e0 (Light gray)
- Text: #333 (Dark gray)

Spacing:
- Small: 8px
- Medium: 15px
- Large: 20px

Font:
- Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Size: 12px - 32px
```

---

## 🧪 Testing Checklist

- [ ] User can login with username
- [ ] Users list displays (excluding current user)
- [ ] Selecting user shows conversation history
- [ ] Can send and receive messages in real-time
- [ ] Typing indicator appears/disappears
- [ ] Online status updates correctly
- [ ] Messages persist after refresh
- [ ] Can switch between users
- [ ] No errors in browser console
- [ ] Responsive on mobile

---

## 📦 NPM Packages

```json
{
  "react": "^18.2.0",           // UI Library
  "react-dom": "^18.2.0",       // DOM Rendering
  "react-scripts": "5.0.1",     // Build tools
  "axios": "^1.4.0",            // HTTP Client
  "socket.io-client": "^4.5.4"  // Real-time Communication
}
```

---

## 🚀 Build for Production

```bash
npm run build
```

Creates optimized build in `build/` folder.

Deploy to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting

---

## 🔗 Useful Resources

- [React Docs](https://react.dev)
- [Axios Docs](https://axios-http.com/)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [CSS Flexbox Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)

---

**Happy coding! 🎉**
