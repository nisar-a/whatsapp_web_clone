# Testing Guide for WhatsApp Clone

## 🧪 Testing Scenarios

### Test Environment Setup

**Prerequisites:**
- Both backend and frontend running
- MongoDB connected
- At least 2 browser windows/tabs open

---

## 📋 Test Case 1: User Authentication

### Scenario 1.1: Create New User
```
1. Open browser → http://localhost:3000
2. Enter username "alice"
3. Click Login
4. ✓ Should see chat interface
5. ✓ Should show alice in user list area
6. ✓ Check browser console - no errors
```

### Scenario 1.2: Login Existing User
```
1. Open new browser window
2. Enter username "alice" (same as before)
3. Click Login
4. ✓ Should login successfully
5. ✓ Should load previous messages/data
```

### Scenario 1.3: Invalid Login
```
1. Leave username empty
2. Click Login
3. ✓ Should show error "Username is required"
4. ✓ Should not proceed
```

---

## 💬 Test Case 2: Messaging

### Scenario 2.1: Send and Receive Message
```
SETUP:
- Window A: Logged in as "alice"
- Window B: Logged in as "bob"

ACTIONS:
1. In Window A: Select "bob" from chat list
2. In Window B: Select "alice" from chat list
3. In Window A: Type "Hello Bob!" and click Send
4.Expected Results:
   ✓ Message appears in alice's chat (green bubble, right-aligned)
   ✓ Message appears in bob's chat (gray bubble, left-aligned)
   ✓ Message appears instantly (within 1 second)
   ✓ Timestamp shows current time
   ✓ Message persists (refresh page - message still there)
```

### Scenario 2.2: Empty Message
```
1. Leave message input empty
2. Click Send
3. ✓ Message should not be sent
4. ✓ Input should remain empty
```

### Scenario 2.3: Message with Special Characters
```
1. Type: "Hello! 😊 #test @alice $100"
2. Click Send
3. ✓ Message displays correctly with special chars
4. ✓ No encoding issues
```

### Scenario 2.4: Long Message
```
1. Type very long message (>500 characters)
2. Click Send
3. ✓ Message wraps correctly
4. ✓ Displays on two lines (maintains readability)
5. ✓ Bubble resizes appropriately
```

### Scenario 2.5: Multiple Messages
```
1. Send 5+ messages consecutively
2. ✓ All appear in correct order
3. ✓ Auto-scroll to latest message
4. ✓ No messages duplicate
5. ✓ All timestamps correct
```

---

## 👥 Test Case 3: User List & Selection

### Scenario 3.1: View Users
```
1. Login as alice
2. ✓ Should see list of other users (bob, charlie, david, emma)
3. ✓ Current user (alice) should NOT appear in list
4. ✓ Each user shows initials in avatar
```

### Scenario 3.2: Select Different User
```
1. Select "charlie" from list
2. ✓ Chat window updates
3. ✓ charlie is highlighted
4. ✓ Message history with charlie loads
5. Select "david"
2. ✓ Switches to david's conversation
3. ✓ david is highlighted
4. ✓ Message history updates
```

### Scenario 3.3: No User Selected
```
1. Refresh page
2. ✓ Shows "Select a user to start chatting"
3. ✓ Message input is disabled/unavailable
```

---

## 🟢 Test Case 4: Online Status

### Scenario 4.1: User Online Status
```
1. Window A: Login as alice
2. Window B: Login as bob
3. In Window A: Check bob's status in chat list
   ✓ Should show "● Online" (green)
   ✓ Should have green indicator dot
4. Refresh Window B
   ✓ Status updates to offline
   ✓ Wait 2-3 seconds
   ✓ Status updates back to online
```

### Scenario 4.2: Multiple Online Users
```
1. Login as alice (Window A)
2. Login as bob (Window B)
3. Login as charlie (Window C)
4. In Window A: All should show "● Online"
5. Close Window B (bob)
   ✓ After 5 seconds, bob should show "● Offline"
6. Refresh Window C (charlie)
   ✓ Charlie comes back online
```

---

## ⌨️ Test Case 5: Typing Indicators

### Scenario 5.1: Show Typing
```
1. Window A: Select bob
2. Window B: Select alice
3. In Window A: Click in message input (start typing)
   ✓ In Window B: See "Typing..." indicator
   ✓ Show animated dots
4. In Window A: Stop typing for 2 seconds
   ✓ In Window B: Typing indicator disappears
```

### Scenario 5.2: Type and Send
```
1. Type some text
2. ✓ Typing indicator shows in receiver's window
3. Click Send
4. ✓ Typing indicator disappears
5. ✓ Message appears
```

---

## 🔄 Test Case 6: User Switching

### Scenario 6.1: Switch User
```
1. Logged in as alice
2. Click switch user button (🔄)
3. ✓ Back to login screen
4. ✓ localStorage cleared
5. Login as bob
6. ✓ See bob's conversations/users
7. ✓ alice not in list
```

### Scenario 6.2: Preservation of Data
```
1. Login as alice
2. Send message to bob
3. Switch to bob
4. Send message back
5. Switch to alice
6. ✓ Previous message still there
7. ✓ New message from bob visible
```

---

## 🔄 Test Case 7: Message History & Refresh

### Scenario 7.1: Refresh Page
```
1. Login as alice, send message to bob
2. Refresh page
3. ✓ Still logged in as alice
4. ✓ Users list loads
5. Select bob
6. ✓ Previous conversation visible
7. ✓ Message history intact
```

### Scenario 7.2: Browse Between Conversations
```
1. Select bob, send message
2. Select charlie, send message
3. Select david, send message
4. Switch between them
5. ✓ Each has correct message history
6. ✓ No messages mixed up
```

---

## 🎨 Test Case 8: UI/UX

### Scenario 8.1: Layout
```
✓ Left sidebar (30% width) with users
✓ Right chat window (70% width) with messages
✓ Header shows selected user info
✓ Message input at bottom
✓ Auto-scroll to latest message
```

### Scenario 8.2: Message Alignment
```
✓ Own messages: Right-aligned, green background
✓ Received messages: Left-aligned, gray background
✓ Proper spacing between messages
✓ Sender name shown for received messages
```

### Scenario 8.3: Scrolling
```
1. Send many messages (10+)
2. ✓ Auto-scroll to bottom
3. Manual scroll up
4. ✓ Old messages visible
5. Send new message
6. ✓ Auto-scroll to newest
```

### Scenario 8.4: Responsive Design
```
1. Desktop (1920x1080)
   ✓ Two-panel layout visible
2. Tablet (768px)
   ✓ Still functional
   ✓ Sidebar responsive
3. Mobile (375px)
   ✓ Stacked layout
   ✓ All elements accessible
```

---

## ⚡ Test Case 9: Performance

### Scenario 9.1: Message Sending Speed
```
1. Send message
2. Time to appear in receiver: < 1 second
3. ✓ Should not be noticeable delay
4. ✓ Real-time update working
```

### Scenario 9.2: Large Number of Messages
```
1. Send 100+ messages
2. ✓ Page doesn't crash
3. ✓ Can still scroll smoothly
4. ✓ Send new messages work
```

---

## 🔌 Test Case 10: Connection Loss

### Scenario 10.1: Disconnect and Reconnect
```
1. Browser DevTools → Network → Offline
2. Try to send message
3. ✓ Error handling (optional)
4. Go back Online
5. ✓ Reconnects automatically
6. ✓ Messages send/receive again
```

---

## 🐛 Test Case 11: Edge Cases

### Scenario 11.1: Same User Messaging (Self)
```
1. Try to message self
2. ✓ Should show error or prevent
3. ✓ Not allowed in system
```

### Scenario 11.2: Database Connection Loss
```
1. Stop MongoDB
2. Try login
3. ✓ See error message
4. Restart MongoDB
5. ✓ System recovers
```

### Scenario 11.3: Backend Server Down
```
1. Stop backend server
2. Frontend should handle gracefully
3. ✓ Show connection error
4. Restart backend
5. ✓ Reconnects automatically
```

---

## 📊 Test Case 12: Browser Compatibility

### Test on Different Browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Expected Results for Each:
✓ Login works
✓ Messaging works
✓ Real-time updates work
✓ No console errors
✓ Responsive design works

---

## ✅ Final Checklist

### Functionality
- [ ] Create/Login users
- [ ] Send messages
- [ ] Receive messages
- [ ] View message history
- [ ] Online/offline status
- [ ] Typing indicators
- [ ] User switching
- [ ] Message persistence

### UI/UX
- [ ] Two-panel layout
- [ ] Message alignment (sent/received)
- [ ] Auto-scroll to latest
- [ ] Responsive design
- [ ] No visual glitches

### Performance
- [ ] Messages appear within 1 second
- [ ] Can send multiple messages
- [ ] No lag or stuttering
- [ ] Page doesn't crash with many messages

### Error Handling
- [ ] Empty message validation
- [ ] Duplicate username handling
- [ ] Connection loss handling
- [ ] Graceful error messages

### Console
- [ ] No JavaScript errors
- [ ] No warnings (optional)
- [ ] No console spam

---

## 🚀 Report Format

When reporting bugs:

```
Bug #: [Number]
Title: [Brief description]
Severity: [Critical/High/Medium/Low]

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
- ...

Actual Result:
- ...

Screenshots/Videos: [Attach if possible]

Environment:
- Browser: [Chrome/Firefox/etc]
- OS: [Windows/Mac/Linux]
- Version: [1.0]
```

---

**Happy Testing! 🧪**
