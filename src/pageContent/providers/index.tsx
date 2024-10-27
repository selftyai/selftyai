import { NextUIProvider } from '@nextui-org/react'
import { ReactNode } from 'react'
import React from 'react'

import { PageContentProvider } from '@/pageContent/providers/PageContentProvider'
import { usePageOverlayRef } from '@/pageContent/providers/PageOverlayRefProvider'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import ThemeProvider from '@/sidebar/providers/ThemeProvider'

interface ProvidersWrapperProps {
  children: ReactNode
}

const ProvidersWrapper = ({ children }: ProvidersWrapperProps) => {
  const { pageOverlayRef } = usePageOverlayRef()
  const [parent, setParent] = React.useState<HTMLElement | undefined>(undefined)

  React.useEffect(() => {
    if (pageOverlayRef.current) {
      setParent(pageOverlayRef.current)
    }
  }, [pageOverlayRef])

  return (
    <div ref={pageOverlayRef} className="text-foreground">
      {parent && (
        <ThemeProvider parent={parent}>
          <LanguageProvider>
            <PageContentProvider>
              <NextUIProvider>{children}</NextUIProvider>
            </PageContentProvider>
          </LanguageProvider>
        </ThemeProvider>
      )}
    </div>
  )
}

export default ProvidersWrapper
