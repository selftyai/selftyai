import { Outlet } from 'react-router-dom'

import { BranchProvider } from '@/sidebar/providers/BranchProvider'
import ChatProvider from '@/sidebar/providers/ChatProvider'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import OllamaProvider from '@/sidebar/providers/OllamaProvider'
import ReadAloudProvider from '@/sidebar/providers/ReadAloudProvider'
import ThemeProvider from '@/sidebar/providers/ThemeProvider'

const ProvidersWrapper = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <OllamaProvider>
          <ChatProvider>
            <BranchProvider>
              <ReadAloudProvider>
                <Outlet />
              </ReadAloudProvider>
            </BranchProvider>
          </ChatProvider>
        </OllamaProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default ProvidersWrapper
