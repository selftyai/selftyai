import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import AppRoutes from '@/pages'
import ChatProvider from '@/providers/ChatProvider'
import OllamaProvider from '@/providers/OllamaProvider'

import './index.css'

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
