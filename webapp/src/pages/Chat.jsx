import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, LogOut, Send, User, Users, CheckCircle, XCircle, Check, Image } from 'lucide-react'
import { deriveKeyFromChannelId, encryptMessage, decryptMessage } from '../utils/crypto'

export default function Chat() {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const clientIdRef = useRef(null)
  const usernameRef = useRef(null)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Vérifier que l'utilisateur a un username, sinon rediriger vers ChannelSetup
  useEffect(() => {
    const username = sessionStorage.getItem('ephemr_username')
    if (!username) {
      navigate('/')
      return
    }

    let clientId = sessionStorage.getItem('ephemr_client_id')
    if (!clientId) {
      clientId = generateUUID()
      sessionStorage.setItem('ephemr_client_id', clientId)
    }
    clientIdRef.current = clientId
    usernameRef.current = username
  }, [navigate])

  // Se connecter au serveur WebSocket et initialiser la clé de chiffrement
  useEffect(() => {
    const initChat = async () => {
      try {
        // Dériver la clé à partir du channelId
        const key = await deriveKeyFromChannelId(channelId)
        setEncryptionKey(key)

        // Connexion WebSocket
        const wsUrl = `${import.meta.env.VITE_WS_URL}${channelId}`
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('Connecté au serveur')
          // Envoyer le message de join avec le username
          const joinMessage = JSON.stringify({
            type: 'join',
            username: usernameRef.current
          })
          ws.send(joinMessage)
        }

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('Message reçu:', data)

            // Vérifier si c'est une réponse de join
            if (data.type === 'join') {
              if (data.success) {
                console.log('Join accepté')
                setConnected(true)
              } else {
                console.error('Join rejeté:', data.message)
                // Rediriger vers ChannelSetup avec le message d'erreur
                sessionStorage.removeItem('ephemr_username')
                navigate('/', { state: { error: data.message } })
              }
              return
            }

            // Vérifier si c'est un message de statut
            if (data.type === 'status') {
              console.log('Mise à jour du nombre d\'utilisateurs:', data.userCount)
              setUserCount(data.userCount)
              return
            }

            // Sinon, c'est un message chiffré
            const decrypted = await decryptMessage(data, key)
            const message = JSON.parse(decrypted)

            // Identifier si c'est notre message
            message.isOwn = message.clientId === clientIdRef.current

            setMessages((prev) => [...prev, message])
          } catch (error) {
            console.error('Erreur déchiffrement:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('Erreur WebSocket:', error)
          setConnected(false)
        }

        ws.onclose = () => {
          console.log('Déconnecté du serveur')
          setConnected(false)
        }

        wsRef.current = ws
      } catch (error) {
        console.error('Erreur initialisation:', error)
      }
    }

    initChat()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [channelId, navigate])

  // Scroll vers le bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !encryptionKey || !wsRef.current) return

    const message = {
      type: 'text',
      content: inputValue,
      timestamp: new Date().toISOString(),
      clientId: clientIdRef.current,
      username: usernameRef.current
    }

    try {
      const encrypted = await encryptMessage(JSON.stringify(message), encryptionKey)
      wsRef.current.send(JSON.stringify(encrypted))
      setInputValue('')
    } catch (error) {
      console.error('Erreur envoi:', error)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(channelId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxSize = 1024

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !encryptionKey || !wsRef.current) return

    try {
      const resizedImage = await resizeImage(file)

      const message = {
        type: 'image',
        content: resizedImage,
        timestamp: new Date().toISOString(),
        clientId: clientIdRef.current,
        username: usernameRef.current
      }

      const encrypted = await encryptMessage(JSON.stringify(message), encryptionKey)
      wsRef.current.send(JSON.stringify(encrypted))
    } catch (error) {
      console.error('Error sending image:', error)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Channel id: <span>{channelId}</span></h2>
            <div className="flex items-center gap-2 mt-1">
              {connected ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-gray-400">
                    Connected • {userCount} {userCount === 1 ? 'user' : 'users'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-sm text-gray-400">Disconnected</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-lg transition cursor-pointer ${copied ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={copied ? 'Copied!' : 'Copy link'}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition cursor-pointer"
              title="Leave channel"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Waiting for messages...</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
              <div className={`${msg.isOwn ? 'bg-green-600' : 'bg-gray-600'} rounded-full w-8 h-8 flex items-center justify-center shrink-0`}>
                {msg.isOwn ? <User size={16} /> : <Users size={16} />}
              </div>
              <div className={`flex-1 ${msg.isOwn ? 'flex justify-end' : ''}`}>
                <div className={`${msg.isOwn ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg p-3 wrap-break-word max-w-xs`}>
                  {msg.type === 'image' ? (
                    <img src={msg.content} alt="Shared image" className="rounded max-w-full h-auto mb-2" />
                  ) : (
                    <p className="text-white">{msg.content}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-2 text-right">
                    {msg.username} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={!connected}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!connected}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white w-10 h-10 rounded-lg transition cursor-pointer flex items-center justify-center"
            title="Send image"
          >
            <Image size={20} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!connected || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white w-10 h-10 rounded-lg transition cursor-pointer flex items-center justify-center"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
