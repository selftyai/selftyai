import { useEffect, useRef, useState } from 'react'

import ContextMenu from '@/pageContent/PageOverlay/ContextMenu'
import Overlay from '@/pageContent/PageOverlay/Overlay'
import LanguageProvider from '@/sidebar/providers/LanguageProvider'
import ThemeProvider from '@/sidebar/providers/ThemeProvider'

const App = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const closeOverlay = () => {
    setIsOverlayVisible(false)
    setSelectedText(null)
    window.getSelection()?.empty()
  }

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        return
      }

      const selection = window.getSelection()

      if (selection && selection.rangeCount > 0) {
        const text = selection.toString().trim()

        const scrollY = window.scrollY || document.documentElement.scrollTop

        if (text.length > 0 && text !== selectedText && !isOverlayVisible) {
          const { clientX: left, clientY: top } = event

          setSelectedText(text)
          setMenuPosition({ left, top: top + scrollY })
          setIsOverlayVisible(true)
        }
      }
    }

    const handleClickOutside = () => {
      if (isOverlayVisible) {
        closeOverlay()
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOverlayVisible, selectedText])

  return (
    <ThemeProvider parent={ref.current!}>
      <LanguageProvider>
        <div ref={ref} className="text-foreground">
          <Overlay isVisible={isOverlayVisible} onClose={closeOverlay}>
            {menuPosition && selectedText && (
              <ContextMenu
                left={menuPosition.left}
                top={menuPosition.top}
                onClose={closeOverlay}
                text={selectedText}
                overlayRef={ref}
              />
            )}
          </Overlay>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
