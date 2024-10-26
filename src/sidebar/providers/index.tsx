import { Outlet } from 'react-router-dom'

import ChatProvider from '@/sidebar/providers/ChatProvider'
import GroqProvider from '@/sidebar/providers/GroqProvider'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import OllamaProvider from '@/sidebar/providers/OllamaProvider'
import ThemeProvider from '@/sidebar/providers/ThemeProvider'

const ProvidersWrapper = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <OllamaProvider>
          <GroqProvider>
            <ChatProvider>
              <Outlet />
            </ChatProvider>
          </GroqProvider>
        </OllamaProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default ProvidersWrapper
