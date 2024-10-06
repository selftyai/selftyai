import { NextUIProvider } from '@nextui-org/react'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

interface OverlayProps {
  isVisible: boolean
  onClose: () => void
  children: React.ReactNode
}

const Overlay: React.FC<OverlayProps> = ({ isVisible, onClose, children }) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!document.getElementById('selftyai-overlay')?.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  return ReactDOM.createPortal(
    <NextUIProvider>
      <div
        className="overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
      >
        {children}
      </div>
    </NextUIProvider>,
    document.body
  )
}

export default Overlay
