import { Outlet } from 'react-router-dom'

import ChatProvider from '@/sidebar/providers/ChatProvider'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import OllamaProvider from '@/sidebar/providers/OllamaProvider'

const ProvidersWrapper = () => {
  return (
    <LanguageProvider>
      <OllamaProvider>
        <ChatProvider>
          <Outlet />
        </ChatProvider>
      </OllamaProvider>
    </LanguageProvider>
  )
}

export default ProvidersWrapper
