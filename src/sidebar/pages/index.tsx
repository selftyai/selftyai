import { HashRouter, Routes, Route } from 'react-router-dom'

import Chat from '@/sidebar/pages/Chat'
import Settings from '@/sidebar/pages/Settings'

import ProvidersWrapper from '../providers'

const AppRoutes = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<ProvidersWrapper />}>
        <Route index element={<Chat />} />
        <Route path="/:conversationId" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  </HashRouter>
)

export default AppRoutes
