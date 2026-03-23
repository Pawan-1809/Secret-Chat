# 💬 Secret Chat - Anonymous Real-time Chat
<div>

**🔥 Lightning-fast anonymous chat • No signup required • Real-time messaging**
</div>

---

### Image Sharing
- Drag & drop image upload with preview
- Automatic image optimization and compression
- Support for JPEG, PNG, GIF, and WebP formats
- Real-time image sharing in chat rooms

### File Transfer
- Upload and share documents, PDFs, and other files
- Progress indicators during file upload
- File size and type validation
- Support for up to 10MB file uploads

### Dark Mode
- Beautiful dark/light theme toggle
- System preference detection
- Persistent theme settings
- Smooth theme transitions

### Multi-language Support
- International support for 4 languages:
  - English
  - Spanish (Español)
  - French (Français)
  - German (Deutsch)
- Automatic language detection
- Easy language switching
<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="200">
</div>
<blockquote>
<em>"To create a space where ideas flow freely, connections happen instantly, and privacy is respected. No barriers, no sign-ups, just pure conversation."</em>
</blockquote>
</details>

---

## ✨ Features

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="900">
</div>

<table>
<tr>
<td width="50%">

### 🚀 **Core Features**
- 🎭 **Anonymous Access** - No registration required
- ⚡ **Real-time Messaging** - Instant communication
- 🏠 **Public Rooms** - Join community discussions
- 🔒 **Private Rooms** - Secure conversations with passwords
- 📱 **Mobile Responsive** - Works on all devices
- 🎨 **Clean UI** - Modern, intuitive design

</td>
<td width="50%">

### 🛠 **Advanced Features**
- 💬 **Typing Indicators** - See who's typing
- 👥 **Live User Count** - Track room participants
- 🆔 **Auto-generated IDs** - Unique room identifiers
- 📋 **Copy Room ID** - Easy room sharing
- 🎯 **Message Types** - Text, images, files support
- 🔄 **Auto-cleanup** - Removes inactive sessions

</td>
</tr>
</table>

<div align="center">
</div>

---

## 🎮 Use Cases & Scenarios


<details>
<summary>🏢 <strong>Business & Professional</strong></summary>

- **Team Brainstorming**: Quick ideation sessions without formal meeting setup
- **Client Consultations**: Anonymous feedback collection
- **Project Discussions**: Temporary collaboration spaces
- **Support Chat**: Customer service with privacy

<div align="center">
<img src="https://media.giphy.com/media/LaVp0AyqR5bGsC5Cbm/giphy.gif" width="200">
</div>

</details>

<details>
<summary>🎓 <strong>Educational</strong></summary>

- **Study Groups**: Collaborative learning sessions
- **Q&A Sessions**: Anonymous question asking
- **Workshop Discussions**: Interactive learning environments
- **Peer Reviews**: Anonymous feedback on projects

<div align="center">
<img src="https://media.giphy.com/media/WUlplcMpOCEmTGBtBW/giphy.gif" width="200">
</div>

</details>

<details>
<summary>🎉 <strong>Social & Community</strong></summary>

- **Interest Groups**: Connect with like-minded people
- **Event Coordination**: Quick planning discussions
- **Gaming Communities**: Strategy discussions and coordination
- **Support Groups**: Safe spaces for sensitive topics

<div align="center">
<img src="https://media.giphy.com/media/du3J3cXyzhj75IOgvA/giphy.gif" width="200">
</div>

</details>

<details>
<summary>💻 <strong>Developer & Tech</strong></summary>

- **Code Reviews**: Anonymous peer feedback
- **Technical Discussions**: No-pressure knowledge sharing
- **Open Source**: Community contribution discussions
- **Hackathons**: Quick team formation and coordination

<div align="center">
<img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" width="200">
</div>

</details>

---

## 🚀 Quick Start

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="100">
</div>

### 📋 Prerequisites

Make sure you have the following installed:

```bash
# Check Node.js version (16+ required)
node --version

# Check npm version
npm --version
```

<details>
<summary>🔧 <strong>Don't have Node.js? Click here for installation</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/VTtANKl0beDFQRLDTh/giphy.gif" width="200">
</div>

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Restart your terminal

**macOS:**
```bash
# Using Homebrew
brew install node
```

**Linux:**
```bash
# Using package manager
sudo apt update
sudo apt install nodejs npm
```

</details>

### 🏁 Installation & Setup

```bash
# 1️⃣ Clone the repository
git clone https://github.com/your-username/code-bhej.git
cd code-bhej

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start the development server
npm run dev

# 4️⃣ Open your browser
# Navigate to http://localhost:5000
```

<div align="center">

**🎉 That's it! Your chat app is now running locally!**

<img src="https://user-images.githubusercontent.com/74038190/213910845-af37a709-8995-40d6-be59-724526e3c3d7.gif" width="100">

</div>

---

## 🏗️ Architecture

<details>
<summary>📁 <strong>Project Structure</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/3oKIPEqDGUULpEU0aQ/giphy.gif" width="150">
</div>

```
code-bhej/
├── 📁 client/                 # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/          # Application pages
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 lib/            # Utilities and configs
│   │   └── 📄 main.tsx        # App entry point
│   └── 📄 index.html          # HTML template
├── 📁 server/                 # Express backend
│   ├── 📄 index.ts            # Server entry point
│   ├── 📄 routes.ts           # API routes & Socket.IO
│   ├── 📄 storage.ts          # In-memory data storage
│   └── 📄 vite.ts             # Vite integration
├── 📁 shared/                 # Shared types & schemas
│   └── 📄 schema.ts           # Data models
├── 📄 package.json            # Dependencies
├── 📄 tailwind.config.ts      # Tailwind configuration
├── 📄 vite.config.ts          # Vite configuration
└── 📄 README.md               # You are here! 👋
```

</details>

---

## 🎯 API Reference

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="50">
</div>

<details>
<summary>🔌 <strong>REST API Endpoints</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="200">
</div>

### Room Management

```http
GET    /api/rooms/public          # Get all public rooms
GET    /api/rooms/:id             # Get room details
POST   /api/rooms                 # Create new room
POST   /api/rooms/:id/join        # Join room (with password if needed)
```

### Request/Response Examples

**Create Room:**
```json
POST /api/rooms
{
  "name": "My Awesome Room",
  "type": "private",
  "password": "secret123"
}

Response:
{
  "room": {
    "id": "abc12345",
    "name": "My Awesome Room",
    "type": "private",
    "participantCount": 0
  },
  "username": "Cool_Coder_123",
  "isCreator": true
}
```

</details>

<details>
<summary>⚡ <strong>WebSocket Events</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" width="200">
</div>

### Client → Server
- `join-room` - Join a chat room
- `send-message` - Send a message
- `typing` - Send typing indicator

### Server → Client
- `room-joined` - Successful room join
- `new-message` - Receive new message
- `user-joined` - User joined notification
- `user-left` - User left notification
- `user-typing` - Typing indicator

</details>

---

## 🎨 Customization

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="50">
</div>

<details>
<summary>🎨 <strong>Theming & Styling</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" width="200">
</div>

The app uses Tailwind CSS with custom CSS variables. You can easily customize colors:

```css
/* client/src/index.css */
:root {
  --primary: hsl(220.9 39.3% 11%);
  --primary-foreground: hsl(210 40% 98%);
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  /* Add your custom colors */
}
```

</details>

<details>
<summary>⚙️ <strong>Configuration Options</strong></summary>

### Environment Variables

```bash
# .env file
NODE_ENV=development           # Environment mode
PORT=5000                     # Server port
```

### Storage Configuration

By default, the app uses in-memory storage. To add persistence:

1. Set up PostgreSQL database
2. Update connection in `server/storage.ts`
3. Run database migrations

</details>

---

## 🚀 Deployment

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="50">
</div>

<details>
<summary>🌐 <strong>Deployment Options</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/du3J3cXyzhj75IOgvA/giphy.gif" width="200">
</div>

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Heroku
```bash
git push heroku main
```

### Self-hosted
```bash
npm run build
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

</details>

---

## 🤝 Contributing

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="100">
</div>

We welcome contributions! Here's how you can help:

<details>
<summary>🔧 <strong>Development Setup</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" width="200">
</div>

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

</details>

### 🐛 Reporting Issues

Found a bug? Please create an issue with:
- **Description** of the bug
- **Steps to reproduce**
- **Expected behavior**
- **Screenshots** (if applicable)
- **Environment details**

### 💡 Feature Requests

Have an idea? We'd love to hear it! Create an issue with the `enhancement` label.

---

## 🔒 Security & Privacy

<div align="center">

### 🛡️ **Your Privacy Matters**

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="100">

</div>

- **🚫 No Data Collection**: We don't store personal information
- **💾 Temporary Storage**: Messages exist only in memory
- **🔐 Optional Passwords**: Secure your private rooms
- **👤 Anonymous Users**: Auto-generated usernames
- **🧹 Auto-cleanup**: Inactive sessions are removed automatically

<details>
<summary>🔒 <strong>Security Best Practices</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" width="200">
</div>

- All inputs are validated and sanitized
- XSS protection implemented
- CORS properly configured
- No sensitive data logged
- Password protection for private rooms
- Rate limiting on API endpoints

</details>

---

## 📊 Performance

<div align="center">

### ⚡ **Built for Speed**

</div>

- **🚀 Fast Loading**: Optimized bundle size
- **📱 Mobile First**: Responsive on all devices  
- **🔄 Real-time**: Sub-second message delivery
- **💾 Memory Efficient**: Smart cleanup algorithms
- **🌐 CDN Ready**: Optimized for global deployment

---

## 🆘 Troubleshooting

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="50">
</div>

<details>
<summary>❓ <strong>Common Issues & Solutions</strong></summary>

<div align="center">
<img src="https://media.giphy.com/media/xTiTnGeUsWOEwsGoG4/giphy.gif" width="200">
</div>

### Windows ENOTSUP Error
```bash
# If you see "operation not supported on socket"
# The app now uses localhost instead of 0.0.0.0
npm run dev
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
npm run dev
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Failed
- Check if port 5000 is open
- Disable firewall/antivirus temporarily
- Try a different port in server/index.ts

</details>

---

## 📈 Roadmap

<div align="center">

### 🌟 **What's Coming Next**

<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100">

</div>

- [ ] 🖼️ **Image Sharing** - Upload and share images
- [ ] 📁 **File Transfer** - Send documents and files  
- [ ] 🌙 **Dark Mode** - Toggle between themes
- [ ] 🌍 **Multi-language** - Internationalization support
- [ ] 📱 **PWA Support** - Install as mobile app
- [ ] 🔔 **Push Notifications** - Stay updated on messages
- [ ] 🎵 **Voice Messages** - Audio communication
- [ ] 📊 **Room Analytics** - Usage statistics
- [ ] 🔐 **End-to-End Encryption** - Enhanced security
- [ ] 🤖 **Bot Integration** - Automated responses

<div align="center">
<img src="https://media.giphy.com/media/LaVp0AyqR5bGsC5Cbm/giphy.gif" width="200">
</div>


---
<div align="center">

**Built with ❤️ by developers, for developers**

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="400">

</div>

---

<div align="center">

### 🌟 **Star us on GitHub if you like this project!** 🌟

---

**Made with 💻 and ☕ | [Gmail](pawankr16123114@gmail.com) | [Instagram](https://www.instagram.com/mr._pawan_.kumar) | [LinkedIn](https://www.linkedin.com/in/pawan-kumar-467a84244/)**

<img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="100">

</div>
