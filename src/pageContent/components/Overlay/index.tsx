import { usePageContent } from '@/pageContent/providers/PageContentProvider'

interface OverlayProps {
  children: React.ReactNode
}

export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const { isPageOverlayEnabled } = usePageContent()
  return (
    isPageOverlayEnabled && (
      <div
        id="selftyai-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${document.documentElement.scrollHeight}px`,
          zIndex: 9999,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    )
  )
}
