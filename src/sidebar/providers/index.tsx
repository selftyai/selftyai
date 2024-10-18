import { Outlet } from 'react-router-dom'

import ChatProvider from '@/sidebar/providers/ChatProvider'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import OllamaProvider from '@/sidebar/providers/OllamaProvider'

import ThemeProvider from './ThemeProvider'

const ProvidersWrapper = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <OllamaProvider>
          <ChatProvider>
            <Outlet />
          </ChatProvider>
        </OllamaProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default ProvidersWrapper
