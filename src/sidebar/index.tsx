import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'
import 'overlayscrollbars/overlayscrollbars.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import '@/shared/i18n'
import '@/shared/style/index.css'
import AppRoutes from '@/sidebar/pages'
import ChatProvider from '@/sidebar/providers/ChatProvider'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import OllamaProvider from '@/sidebar/providers/OllamaProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <LanguageProvider>
          <OllamaProvider>
            <ChatProvider>
              <AppRoutes />
              <Toaster />
            </ChatProvider>
          </OllamaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </NextUIProvider>
  </StrictMode>
)
