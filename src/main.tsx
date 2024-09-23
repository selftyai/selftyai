import { NextUIProvider } from '@nextui-org/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import ChatProvider from '@/components/Chat/ChatProvider'
import ThemeProvider from '@/components/Theme'
import AppRoutes from '@/pages'
import OllamaProvider from '@/providers/OllamaProvider'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <ThemeProvider>
        <OllamaProvider>
          <ChatProvider>
            <AppRoutes />
            <Toaster />
          </ChatProvider>
        </OllamaProvider>
      </ThemeProvider>
    </NextUIProvider>
  </StrictMode>
)
