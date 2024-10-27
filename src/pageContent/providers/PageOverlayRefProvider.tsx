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
/**
 * Hook to access the page overlay ref context.
 * @returns {PageOverlayRefContextProps} The context containing the overlay ref
 * @throws {Error} When used outside of PageOverlayRefProvider
 */
export const usePageOverlayRef = (): PageOverlayRefContextProps => {
  const context = useContext(PageOverlayRefContext)
  if (!context) {
    throw new Error('usePageOverlayRef must be used within a PageOverlayRefProvider')
  }
  return context
}
