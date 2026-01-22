require('dotenv').config()

const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')
const path = require('path')

const app = express()
const server = http.createServer(app)

// CORS configuration
app.use(cors())

// Store channels : { channelId: Set<WebSocket> }
const channels = new Map()
// Store usernames by channel : { channelId: Map<WebSocket, username> }
const channelUsernames = new Map()

// Serve static files
const distPath = path.join(__dirname, '../webapp/dist')
app.use(express.static(distPath))

// Create WebSocket Server without auto-handling
const wss = new WebSocket.Server({ noServer: true })

// Normalize channelId (lowercase, alphanumeric only)
const normalizeChannelId = (id) => {
  return id
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Keep only letters and numbers
}

// Upgrade HTTP to WebSocket
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url
  const match = pathname.match(/^\/chat\/([a-zA-Z0-9\-]+)$/)

  if (!match) {
    socket.destroy()
    return
  }

  let channelId = match[1]
  // Normaliser le channelId
  channelId = normalizeChannelId(channelId)

  // Vérifier que le channelId n'est pas vide après normalisation
  if (!channelId) {
    socket.destroy()
    return
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    let isJoined = false
    let username = null

    // Initialize channel and usernames if necessary
    if (!channels.has(channelId)) {
      channels.set(channelId, new Set())
      channelUsernames.set(channelId, new Map())
      console.log(`✓ Channel created: ${channelId}`)
    }

    const channelClients = channels.get(channelId)
    const usernamesInChannel = channelUsernames.get(channelId)

    // Notify all clients of the user count
    const broadcastStatus = () => {
      const statusMessage = JSON.stringify({ type: 'status', userCount: channelClients.size })
      console.log(`📢 Broadcasting status to ${channelClients.size} client(s): ${statusMessage}`)
      channelClients.forEach((client) => {
        try {
          if (client && client.readyState === 1) { // 1 = OPEN
            client.send(statusMessage)
          }
        } catch (e) {
          console.error('Error sending status:', e)
        }
      })
    }

    // Handle received messages
    ws.on('message', (data) => {
      try {
        // Convert Buffer to string if needed
        const messageData = data instanceof Buffer ? data.toString() : data
        const parsedData = JSON.parse(messageData)

        // Handle "join" message
        if (parsedData.type === 'join' && !isJoined) {
          username = parsedData.username

          // Check if username is already taken
          const existingUsernames = Array.from(usernamesInChannel.values())
          if (existingUsernames.includes(username)) {
            const errorMessage = JSON.stringify({
              type: 'join',
              success: false,
              message: 'Username already taken'
            })
            ws.send(errorMessage)
            console.log(`✗ Connection attempt with username already taken: ${username}`)
            ws.close()
            return
          }

          // Accept connection
          isJoined = true
          channelClients.add(ws)
          usernamesInChannel.set(ws, username)

          console.log(`+ Client connected to ${channelId} as "${username}" (${channelClients.size} clients)`)

          // Send join confirmation
          const joinConfirm = JSON.stringify({
            type: 'join',
            success: true
          })
          ws.send(joinConfirm)

          // Send status with a slight delay
          setTimeout(broadcastStatus, 100)
          return
        }

        // If not yet joined, ignore other messages
        if (!isJoined) {
          return
        }

        // Relay encrypted message to ALL clients in the channel (including sender)
        channelClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(messageData)
          }
        })
      } catch (error) {
        console.error('Error processing message:', error)
      }
    })

    // Handle disconnection
    ws.on('close', () => {
      if (isJoined) {
        channelClients.delete(ws)
        const disconnectingUsername = usernamesInChannel.get(ws)
        usernamesInChannel.delete(ws)
        console.log(`- Client "${disconnectingUsername}" disconnected from ${channelId} (${channelClients.size} clients)`)

        // Notify remaining clients of user count
        if (channelClients.size > 0) {
          broadcastStatus()
        } else {
          // Delete channel if empty
          channels.delete(channelId)
          channelUsernames.delete(channelId)
          console.log(`✗ Channel deleted: ${channelId}`)
        }
      }
    })

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${channelId}:`, error)
    })
  })
})

// SPA Fallback - serve index.html for all routes
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Start server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`🚀 Ephemr server started on port ${PORT}`)
  console.log(`   http://localhost:${PORT}`)
})
