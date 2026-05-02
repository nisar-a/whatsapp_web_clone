# WhatsApp Web Clone

A full-stack real-time messaging application built with **React**, **Node.js/Express**, **MongoDB**, and **Socket.IO**.

## ✨ Features

- ✅ User authentication (username-based, no password)
- ✅ Real-time messaging with Socket.IO
- ✅ Online/offline status
- ✅ Typing indicators
- ✅ Message persistence in MongoDB
- ✅ Two-panel layout (Sidebar + Chat Window)
- ✅ WhatsApp Web inspired UI
- ✅ Responsive design
- ✅ Auto-scroll to latest messages
- ✅ User switching

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - WebSocket library for real-time events

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **MongoDB** (local or Atlas) - [Download/Setup](https://www.mongodb.com/)

## 🚀 Installation & Setup

### 1. Clone or Extract the Project

```bash
cd "d:\Projects\humble tree\whatsapp clone"
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

Edit `.env` file and ensure MongoDB URI is correct:

```env
MONGODB_URI=mongodb://localhost:27017/whatsapp_clone
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Note:** If using MongoDB Atlas, replace with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp_clone
```

Start the backend server:

```bash
npm run dev
```

This will start the server on `http://localhost:5000`

Expected output:
```
🚀 WhatsApp Clone Server running on http://localhost:5000
📡 Socket.IO listening on http://localhost:5000
✓ Connected to MongoDB
```

### 3. Frontend Setup

In a new terminal, navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

Check `.env` file (should be already configured):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the development server:

```bash
npm start
```

This will open the application in your browser at `http://localhost:3000`

## 🧪 Testing the Application

1. **Open the login page** at `http://localhost:3000`
2. **Create first user** - Enter a username (e.g., "alice")
3. **Login successfully** - You're logged in as alice
4. **Open a new tab/window** and go to `http://localhost:3000`
5. **Create second user** - Enter a different username (e.g., "bob")
6. **Start chatting** - Select alice from the chat list and send messages
7. **Switch users** - Use the 🔄 button to switch between accounts

### Demo Usernames
Try these usernames for testing:
- alice
- bob
- charlie
- david
- emma

## 📁 Project Structure

```
whatsapp-clone/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Message.js            # Message schema
│   ├── controllers/
│   │   ├── userController.js     # User logic
│   │   └── messageController.js  # Message logic
│   ├── routes/
│   │   ├── userRoutes.js         # User endpoints
│   │   └── messageRoutes.js      # Message endpoints
│   ├── socket/
│   │   └── socket.js             # Socket.IO events
│   ├── .env                      # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Main server file
│
└── frontend/
    ├── public/
    │   └── index.html            # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx       # Sidebar component
    │   │   ├── ChatWindow.jsx    # Chat window component
    │   │   ├── MessageBubble.jsx # Message bubble component
    │   │   └── ChatWindow.css
    │   ├── pages/
    │   │   ├── Home.jsx          # Home page
    │   │   └── Home.css
    │   ├── services/
    │   │   └── api.js            # API calls
    │   ├── App.js                # Main app component
    │   ├── App.css               # Main styles
    │   ├── index.js              # React entry point
    │   └── index.css             # Global styles
    ├── .env                      # Environment variables
    ├── .gitignore
    ├── package.json
    └── README.md
```

## 🔌 API Endpoints

### User Endpoints

#### Create/Login User
- **POST** `/api/users`
- **Body:** `{ "username": "alice" }`
- **Response:** `{ "user": {...}, "message": "User created successfully" }`

#### Get All Users
- **GET** `/api/users`
- **Response:** `[{ "_id": "...", "username": "alice", "isOnline": true }, ...]`

#### Get User by ID
- **GET** `/api/users/:userId`
- **Response:** `{ "_id": "...", "username": "alice", "isOnline": true }`

### Message Endpoints

#### Send Message
- **POST** `/api/messages`
- **Body:** `{ "senderId": "...", "receiverId": "...", "text": "Hello!" }`
- **Response:** `{ "data": {...}, "message": "Message sent successfully" }`

#### Get Conversation
- **GET** `/api/messages/:senderId/:receiverId`
- **Response:** `[{ "_id": "...", "senderId": {...}, "receiverId": {...}, "text": "...", "createdAt": "..." }, ...]`

## 🔌 Socket.IO Events

### Client → Server

- **`user_online`** - Emit when user joins
  ```javascript
  socket.emit('user_online', userId);
  ```

- **`send_message`** - Send message in real-time
  ```javascript
  socket.emit('send_message', { senderId, receiverId, text });
  ```

- **`typing`** - Emit when user starts typing
  ```javascript
  socket.emit('typing', { senderId, receiverId });
  ```

- **`stop_typing`** - Emit when user stops typing
  ```javascript
  socket.emit('stop_typing', { senderId, receiverId });
  ```

### Server → Client

- **`receive_message`** - Receive real-time message
- **`online_users`** - List of online users
- **`user_typing`** - Someone is typing
- **`user_stop_typing`** - Someone stopped typing

## 🧪 Features Breakdown

### 1. Authentication
- Users create account with just a username
- No password required (simplified for demo)
- User data stored in MongoDB
- User switching capability

### 2. Messaging
- Send messages between any two users
- Messages stored in MongoDB with timestamps
- Full conversation history
- Message persistence across sessions

### 3. Real-Time Updates
- Socket.IO for instant message delivery
- Online/offline status updates
- Typing indicators
- Live user status changes

### 4. UI/UX
- WhatsApp Web inspired design
- Two-panel layout
- Auto-scroll to latest messages
- Responsive design
- Message bubbles (sent/received styling)

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Ensure MongoDB is running locally: `mongod`
- Or update `MONGODB_URI` in `.env` with your Atlas URI
- Check if the connection string is correct

### Issue: "CORS error"
**Solution:**
- Backend: Ensure `CLIENT_URL` in `.env` is `http://localhost:3000`
- Frontend: Ensure `REACT_APP_API_URL` is `http://localhost:5000/api`

### Issue: "Socket connection failed"
**Solution:**
- Both servers (Backend and Frontend) must be running
- Check that ports 5000 and 3000 are available
- Clear browser cache and refresh

### Issue: "Messages not appearing"
**Solution:**
- Ensure both users are selected correctly
- Check browser console for errors
- Verify database connection is active

## 🚀 Deployment

### Deploy Backend to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Deploy
git push heroku main
```

### Deploy Frontend to Netlify/Vercel

```bash
# Using Netlify CLI
npm run build
netlify deploy --prod --dir=build
```

Update environment variables on deployment platforms accordingly.

## 📝 Database Schema

### User Collection
```json
{
  "_id": ObjectId,
  "username": String (unique),
  "isOnline": Boolean,
  "socketId": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Message Collection
```json
{
  "_id": ObjectId,
  "senderId": ObjectId (ref: User),
  "receiverId": ObjectId (ref: User),
  "text": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

## 🎯 Future Enhancements

- 🔐 Password authentication with JWT
- 👥 Group chats
- 🖼️ Image/file sharing
- 🎤 Voice messages
- 📞 Voice/video calls
- ❤️ Message reactions
- 🔍 Search functionality
- 🌙 Dark mode
- 🌐 Multi-language support

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Happy Chatting! 💬**
