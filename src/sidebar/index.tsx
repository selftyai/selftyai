import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import '@/shared/style/index.css'
import AppRoutes from '@/sidebar/pages'
import ChatProvider from '@/sidebar/providers/ChatProvider'
import OllamaProvider from '@/sidebar/providers/OllamaProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
