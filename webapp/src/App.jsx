import { Routes, Route, Navigate } from 'react-router-dom'
import Chat from './pages/Chat'
import ChannelSetup from './pages/ChannelSetup'
import Info from './pages/Info'
import './index.css'

function App() {
  return (
    <div className="h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<ChannelSetup />} />
        <Route path="/info" element={<Info />} />
        <Route path="/chat/:channelId" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App