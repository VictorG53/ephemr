# Ephemr - Encrypted Ephemeral Messaging

A real-time encrypted messaging application with end-to-end encryption and zero server-side storage.

**For more information about how Ephemr works, security, and privacy, visit the `/info` page in the application.**

## Installation

### Webapp

```bash
cd webapp
npm install
```

### WebSocket

```bash
cd websocket
npm install
```

## Development

### Start the WebSocket server

```bash
cd websocket
npm run dev
# Server starts on http://localhost:8080
```

### Start the webapp (in another terminal)

```bash
cd webapp
npm run dev
# Vite starts on http://localhost:5173
# Open http://localhost:5173
```

Vite automatically connects to the WebSocket server (localhost:8080).

## Production

### Build the webapp

```bash
cd webapp
npm run build
# Files are generated in webapp/dist
```

### Start the complete server

```bash
cd websocket
npm start
# The server serves the webapp from webapp/dist
# Access http://localhost:8080
```

## Project Structure

```
ephemr/
├── webapp/              (React + Tailwind + Vite)
│   ├── src/
│   │   ├── components/  (React components)
│   │   ├── utils/       (Crypto utilities)
│   │   └── App.jsx
│   └── vite.config.js
├── websocket/           (Node.js + Express + WebSocket)
│   ├── server.js        (Main server)
│   └── package.json
└── README.md
```
