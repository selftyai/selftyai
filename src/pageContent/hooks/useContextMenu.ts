import { RefObject, useCallback, useLayoutEffect, useState } from 'react'

const MENU_PADDING = 4 // set padding for the context menu in pixels

const useContextMenuState = (menuRef: RefObject<HTMLElement>) => {
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)

  const closeOverlay = () => {
    setSelectedText(null)
    window.getSelection()?.removeAllRanges()
  }

  const adjustMenuPosition = useCallback(
    (position: { left: number; top: number }) => {
      const menu = menuRef.current
      if (!menu) return position

      const scrollY = window.scrollY || document.documentElement.scrollTop

      const menuRect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      return {
        left: Math.min(
          position.left + MENU_PADDING,
          viewportWidth - menuRect.width - getScrollbarWidth() * 1.5 - MENU_PADDING
        ),
        top: Math.min(
          position.top + MENU_PADDING,
          viewportHeight - menuRect.height + scrollY - MENU_PADDING
        )
      }
    },
    [menuRef]
  )

  const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth

  useLayoutEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        return
      }

      const selection = window.getSelection()
      const scrollY = window.scrollY || document.documentElement.scrollTop

      if (selection && selection.rangeCount > 0) {
        const text = selection.toString().trim()

        if (text.length > 0 && text !== selectedText) {
          const { clientX: left, clientY: top } = event

          setSelectedText(text)
          setMenuPosition({ left, top: top + scrollY })
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
  }, [selectedText])

  useLayoutEffect(() => {
    if (menuPosition && menuRef.current) {
      const timeoutId = setTimeout(() => {
        const adjustedPosition = adjustMenuPosition(menuPosition)
        setMenuPosition(adjustedPosition)
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [menuPosition, menuRef, adjustMenuPosition])

  return {
    menuPosition,
    selectedText,
    closeOverlay
  }
}

export default useContextMenuState
