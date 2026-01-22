import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Trash2, Zap, Eye, Server } from 'lucide-react'

export default function Info() {
  const navigate = useNavigate()

  return (
    <div className="h-screen bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Ephemr</h1>
        <p className="text-sm text-gray-400 mb-6">Encrypted Ephemeral Messaging</p>

        {/* How it works */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">How it works</h2>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Lock size={24} className="text-gray-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">End-to-End Encryption</h3>
                  <p className="text-xs text-gray-400">
                    All messages are encrypted on your device using AES-256-GCM. The encryption key is derived from your channel code using SHA-256. The server never sees your messages in plain text.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Eye size={24} className="text-gray-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">No Storage</h3>
                  <p className="text-xs text-gray-400">
                    Messages are not stored anywhere. They only exist in memory while the server is running. When you restart the server or close the connection, all messages are permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Zap size={24} className="text-gray-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Real-time Messaging</h3>
                  <p className="text-xs text-gray-400">
                    Messages are delivered instantly through WebSocket connections. All users in the same channel receive encrypted messages in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Trash2 size={24} className="text-gray-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Ephemeral Channels</h3>
                  <p className="text-xs text-gray-400">
                    Channels are automatically created when the first user joins and deleted when the last user leaves. A channel only exists as long as someone is connected to it.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Server size={24} className="text-gray-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Stateless Server</h3>
                  <p className="text-xs text-gray-400">
                    The server only relays encrypted messages. It doesn't store any data about users, channels, or messages. Each message is routed to all connected clients in a channel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Footer */}
        <section className="mb-12 text-center">
          <p className="text-gray-500 text-xs">
            Made by <a href="https://github.com/VictorG53" target="_blank" rel="noopener noreferrer" className="underline">Victor Girault</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
