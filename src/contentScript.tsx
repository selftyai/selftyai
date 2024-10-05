import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'
import ReactDOM from 'react-dom'

import ContextMenu from '@/components/ContextMenu'

console.log('Hello from content script!')

const overlayDiv = document.createElement('div')
overlayDiv.className = 'context-menu-overlay'
overlayDiv.style.position = 'absolute'
overlayDiv.style.top = '0'
overlayDiv.style.left = '0'
overlayDiv.style.width = '100%'
overlayDiv.style.height = '100%'
overlayDiv.style.display = 'none'
overlayDiv.style.zIndex = '9999'
overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
overlayDiv.style.pointerEvents = 'none'
document.body.appendChild(overlayDiv)

let activeMenuDiv: HTMLDivElement | null = null

export const renderSelectionMessage = (
  text: string,
  left: number,
  top: number,
  onClose: () => void
) => {
  if (activeMenuDiv) {
    activeMenuDiv.remove()
    activeMenuDiv = null
  }

  overlayDiv.style.display = 'block'

  activeMenuDiv = document.createElement('div')
  activeMenuDiv.className = 'context-menu'
  activeMenuDiv.style.position = 'absolute'
  activeMenuDiv.style.left = `${left}px`
  activeMenuDiv.style.top = `${top}px`
  activeMenuDiv.style.pointerEvents = 'auto'
  overlayDiv.appendChild(activeMenuDiv)

  ReactDOM.render(
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ContextMenu text={text} left={0} top={0} onClose={onClose} />
      </ThemeProvider>
    </NextUIProvider>,
    activeMenuDiv
  )

  return activeMenuDiv
}

const handleSelection = (event: MouseEvent) => {
  const selection = window.getSelection()

  if (selection && selection.rangeCount > 0) {
    const selectedText = selection.toString()

    if (selectedText.length > 0) {
      const { clientX: mouseX, clientY: mouseY } = event
      const scrollY = window.scrollY || document.documentElement.scrollTop

      renderSelectionMessage(selectedText, mouseX, mouseY + scrollY, () => {
        console.log('Context menu closed')
        if (activeMenuDiv) {
          activeMenuDiv.remove()
          activeMenuDiv = null
          overlayDiv.style.display = 'none'
        }
      })
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (activeMenuDiv && !activeMenuDiv.contains(event.target as Node)) {
    activeMenuDiv.remove()
    activeMenuDiv = null
    overlayDiv.style.display = 'none'
  }
}

document.addEventListener('mouseup', handleSelection)
document.addEventListener('mousedown', handleClickOutside)
