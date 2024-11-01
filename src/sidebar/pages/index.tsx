import { HashRouter, Routes, Route } from 'react-router-dom'

import ErrorBoundary from '@/sidebar/components/ErrorBoundary'
import Chat from '@/sidebar/pages/Chat'
import Settings from '@/sidebar/pages/Settings'
import ProvidersWrapper from '@/sidebar/providers'

chrome.runtime.connect({ name: 'sidebar' })

const AppRoutes = () => (
  <HashRouter>
    <Routes>
      <Route
        path="/"
        element={
          <ErrorBoundary>
            <ProvidersWrapper />
          </ErrorBoundary>
        }
      >
        <Route index element={<Chat />} />
        <Route path="/:conversationId" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  </HashRouter>
)

export default AppRoutes
