import { useEffect, useState } from 'react'

import ContextMenu from '@/pageContent/PageOverlay/ContextMenu'
import Overlay from '@/pageContent/PageOverlay/Overlay'

const App = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)

  const closeOverlay = () => {
    setIsOverlayVisible(false)
    setSelectedText(null)
  }

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const text = selection.toString()
        const scrollY = window.scrollY || document.documentElement.scrollTop

        if (text.length > 0 && !isOverlayVisible) {
          const { clientX: left, clientY: top } = event
          setSelectedText(text)
          setMenuPosition({ left: left, top: top + scrollY })
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
  }, [isOverlayVisible])

  return (
    <Overlay isVisible={isOverlayVisible} onClose={closeOverlay}>
      {menuPosition && selectedText && (
        <ContextMenu
          left={menuPosition.left}
          top={menuPosition.top}
          onClose={closeOverlay}
          text={selectedText}
        />
      )}
    </Overlay>
  )
}

export default App
