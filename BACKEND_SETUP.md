# Backend Setup & API Documentation

## 🔧 Installation

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)

### Install Dependencies
```bash
cd backend
npm install
```

### Environment Configuration

Create/Update `.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/whatsapp_clone

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# For MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp_clone
```

### Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## 📊 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

## 👥 User APIs

### 1. Create/Login User

**Endpoint:** `POST /users`

**Request:**
```json
{
  "username": "alice"
}
```

**Response (Success - 201):**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice",
    "isOnline": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Existing - 200):**
```json
{
  "message": "User logged in",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice",
    "isOnline": false
  }
}
```

**Error (400):**
```json
{
  "error": "Username is required"
}
```

---

### 2. Get All Users

**Endpoint:** `GET /users`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "alice",
    "isOnline": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:31:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "bob",
    "isOnline": false,
    "createdAt": "2024-01-15T10:32:00Z",
    "updatedAt": "2024-01-15T10:32:00Z"
  }
]
```

---

### 3. Get User by ID

**Endpoint:** `GET /users/:userId`

**Example:** `GET /users/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "alice",
  "isOnline": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:31:00Z"
}
```

**Error (404):**
```json
{
  "error": "User not found"
}
```

---

## 💬 Message APIs

### 1. Send Message

**Endpoint:** `POST /messages`

**Request:**
```json
{
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "text": "Hello Bob!"
}
```

**Response (201):**
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "507f2f77bcf86cd799439020",
    "senderId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "alice"
    },
    "receiverId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob"
    },
    "text": "Hello Bob!",
    "createdAt": "2024-01-15T10:35:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Validation Errors (400):**
```json
{
  "error": "All fields are required"
}
```

```json
{
  "error": "Cannot send message to yourself"
}
```

---

### 2. Get Conversation Between Two Users

**Endpoint:** `GET /messages/:senderId/:receiverId`

**Example:** `GET /messages/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012`

**Response (200):**
```json
[
  {
    "_id": "507f2f77bcf86cd799439020",
    "senderId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "alice"
    },
    "receiverId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob"
    },
    "text": "Hello Bob!",
    "createdAt": "2024-01-15T10:35:00Z"
  },
  {
    "_id": "507f2f77bcf86cd799439021",
    "senderId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob"
    },
    "receiverId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "alice"
    },
    "text": "Hi Alice! How are you?",
    "createdAt": "2024-01-15T10:36:00Z"
  }
]
```

---

### 3. Get All Messages (Optional)

**Endpoint:** `GET /messages`

**Response (200):**
```json
[
  {
    "_id": "507f2f77bcf86cd799439020",
    "senderId": {...},
    "receiverId": {...},
    "text": "Hello Bob!",
    "createdAt": "2024-01-15T10:35:00Z"
  }
  // ... more messages
]
```

---

## 🔌 Socket.IO Events

### Connection Flow

**Client sends:**
```javascript
socket.emit('user_online', userId);
```

**Server broadcasts:**
```javascript
socket.on('online_users', (userIds) => {
  // userIds = ['userId1', 'userId2', 'userId3']
});
```

---

### Send Message in Real-Time

**Client sends:**
```javascript
socket.emit('send_message', {
  senderId: 'user1Id',
  receiverId: 'user2Id',
  text: 'Hello!',
  createdAt: new Date()
});
```

**Receiver gets:**
```javascript
socket.on('receive_message', (data) => {
  console.log(data);
  // { senderId, receiverId, text, createdAt }
});
```

---

### Typing Indicator

**When user starts typing:**
```javascript
socket.emit('typing', {
  senderId: 'user1Id',
  receiverId: 'user2Id'
});
```

**Receiver sees:**
```javascript
socket.on('user_typing', (data) => {
  // Show typing indicator for data.senderId
});
```

**When user stops typing:**
```javascript
socket.emit('stop_typing', {
  senderId: 'user1Id',
  receiverId: 'user2Id'
});
```

**Receiver gets:**
```javascript
socket.on('user_stop_typing', (data) => {
  // Hide typing indicator for data.senderId
});
```

---

## 🧪 Testing with cURL

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice"}'
```

### Get All Users
```bash
curl http://localhost:5000/api/users
```

### Send Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "senderId":"507f1f77bcf86cd799439011",
    "receiverId":"507f1f77bcf86cd799439012",
    "text":"Hello!"
  }'
```

### Get Conversation
```bash
curl http://localhost:5000/api/messages/userid1/userid2
```

---

## 📝 Error Handling

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## 🗄️ Database Models

### User Model

```javascript
{
  _id: ObjectId,
  username: String (unique, lowercase),
  isOnline: Boolean,
  socketId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  text: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📦 Project Files

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── models/
│   ├── User.js                  # User schema
│   └── Message.js               # Message schema
├── controllers/
│   ├── userController.js        # User business logic
│   └── messageController.js     # Message business logic
├── routes/
│   ├── userRoutes.js            # User endpoints
│   └── messageRoutes.js         # Message endpoints
├── socket/
│   └── socket.js                # Socket.IO events
├── server.js                    # Main server entry
├── package.json
├── .env                         # Environment variables
└── .gitignore
```

---

## 🚀 Deployment Checklist

- [ ] Update `MONGODB_URI` to production database
- [ ] Update `CLIENT_URL` to production frontend URL
- [ ] Set `PORT` environment variable
- [ ] Enable CORS for production domain
- [ ] Use environment-specific variables
- [ ] Enable HTTPS in production
- [ ] Set up proper error logging
- [ ] Configure rate limiting
- [ ] Enable authentication/authorization

---

## 🔗 Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [MongoDB Docs](https://docs.mongodb.com/)

---

**Happy coding! 🚀**
