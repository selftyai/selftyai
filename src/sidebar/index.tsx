import { NextUIProvider } from '@nextui-org/react'
import 'overlayscrollbars/overlayscrollbars.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import '@/shared/i18n'
import '@/shared/style/index.css'
import AppRoutes from '@/sidebar/pages'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <AppRoutes />
      <Toaster />
    </NextUIProvider>
  </StrictMode>
)
