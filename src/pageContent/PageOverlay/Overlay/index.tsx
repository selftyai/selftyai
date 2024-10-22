import { usePageContent } from '@/pageContent/providers/PageContentProvider'

interface OverlayProps {
  children: React.ReactNode
}

export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const { isContextEnabled } = usePageContent()
  return (
    isContextEnabled && (
      <div
        id="selftyai-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {children}
      </div>
    )
  )
}
