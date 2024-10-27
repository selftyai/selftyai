import { Outlet } from 'react-router-dom'

import { BranchProvider } from '@/sidebar/providers/BranchProvider'
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
              <BranchProvider>
                <Outlet />
              </BranchProvider>
            </ChatProvider>
          </GroqProvider>
        </OllamaProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default ProvidersWrapper
