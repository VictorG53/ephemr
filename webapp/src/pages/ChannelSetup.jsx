import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Info, AlertCircle } from 'lucide-react'

export default function ChannelSetup() {
  const [channelCode, setChannelCode] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Afficher l'erreur si elle vient d'une redirection
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error)
    }
  }, [location.state])

  const normalizeChannelCode = (code) => {
    // Extract code if full URL is pasted
    if (code.includes('/chat/')) {
      code = code.split('/chat/')[1]
    }
    // Convert to lowercase and keep only alphanumeric characters
    return code
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '') // Keep only letters and numbers
  }

  const handleChannelCodeChange = (e) => {
    const normalized = normalizeChannelCode(e.target.value)
    setChannelCode(normalized)
  }

  const handleJoinChannel = () => {
    if (channelCode.trim() && username.trim()) {
      // Save username to session storage
      sessionStorage.setItem('ephemr_username', username.trim())
      navigate(`/chat/${channelCode}`)
    }
  }

  return (
    <div className="flex items-center justify-center h-full relative">
      <button
        onClick={() => navigate('/info')}
        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition cursor-pointer"
        title="Learn more about Ephemr"
      >
        <Info size={20} className="text-gray-400" />
      </button>

      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold">Ephemr</h1>
        <p className="text-gray-400">Encrypted Ephemeral Messaging</p>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinChannel()}
            className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Channel code"
            value={channelCode}
            onChange={handleChannelCodeChange}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinChannel()}
            className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleJoinChannel}
            disabled={!channelCode.trim() || !username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            title="Join channel"
          >
            <span>Join</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
