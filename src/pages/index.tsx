import { HashRouter, Routes, Route } from 'react-router-dom'

import Chat from '@/pages/Chat'
import Settings from '@/pages/Settings'

const AppRoutes = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/:chatId" element={<Chat />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </HashRouter>
)

export default AppRoutes
