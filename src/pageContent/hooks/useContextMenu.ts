import { useEffect, useState } from 'react'

const useContextMenuState = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)

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

    const handleClickOutside = (event: MouseEvent) => {
      if (!document.getElementById('selftyai-overlay')?.contains(event.target as Node)) {
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

  return {
    isOverlayVisible,
    menuPosition,
    selectedText,
    closeOverlay
  }
}

export default useContextMenuState
