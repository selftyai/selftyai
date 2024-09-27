import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import ChatProvider from '@/components/Chat/ChatProvider'
import AppRoutes from '@/pages'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <ChatProvider>
          <AppRoutes />
          <Toaster />
        </ChatProvider>
      </NextThemesProvider>
    </NextUIProvider>
  </StrictMode>
)
