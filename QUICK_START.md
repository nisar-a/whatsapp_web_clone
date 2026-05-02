# Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Step 1: Start MongoDB

**Windows:**
```bash
mongod
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas:**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get your connection string
- Update `backend/.env` with your connection string

---

### Step 2: Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
🚀 WhatsApp Clone Server running on http://localhost:5000
📡 Socket.IO listening on http://localhost:5000
✓ Connected to MongoDB
```

---

### Step 3: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

Browser should open automatically to `http://localhost:3000`

---

## 🧪 Quick Test

1. Enter username: `alice` → Login
2. Open new browser tab → `http://localhost:3000`
3. Enter username: `bob` → Login
4. In alice's window → Select "bob" from chat list
5. Type message and click Send
6. See message appear in bob's window instantly! 🎉

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Start `mongod` or use MongoDB Atlas |
| Port 5000 already in use | Change `PORT` in `backend/.env` |
| Port 3000 already in use | React will ask to use another port |
| Module not found errors | Run `npm install` in both folders |
| Socket connection failed | Ensure backend is running |
| CORS errors | Check `.env` files in both folders |

---

## 📱 Test Multiple Users

Open in different browsers/tabs:
- `http://localhost:3000` → Login as alice
- `http://localhost:3000` → Login as bob (different browser/incognito)
- `http://localhost:3000` → Login as charlie (different device on same network)

Then chat between them in real-time!

---

## 🔗 Useful Links

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB Atlas: `https://www.mongodb.com/cloud/atlas`
- Socket.IO Docs: `https://socket.io/docs`
- React Docs: `https://react.dev`

---

**Need help?** Check the main `README.md` for detailed documentation.
