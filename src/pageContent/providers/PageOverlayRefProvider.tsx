/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode, useRef, RefObject } from 'react'

interface PageOverlayRefContextProps {
  pageOverlayRef: RefObject<HTMLDivElement>
}

const PageOverlayRefContext = createContext<PageOverlayRefContextProps | undefined>(undefined)

export const PageOverlayRefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pageOverlayRef = useRef<HTMLDivElement>(null)

  return (
    <PageOverlayRefContext.Provider value={{ pageOverlayRef }}>
      {children}
    </PageOverlayRefContext.Provider>
  )
}

export const usePageOverlayRef = (): PageOverlayRefContextProps => {
  const context = useContext(PageOverlayRefContext)
  if (!context) {
    throw new Error('usePageOverlay must be used within a PageOverlayProvider')
  }
  return context
}
