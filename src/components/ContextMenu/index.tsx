import React from 'react'

interface ContextMenuProps {
  text?: string
  left: number
  top: number
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  text = 'This is a dynamically rendered div!',
  left,
  top,
  onClose
}) => {
  return (
    <div
      className="p-10"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        backgroundColor: 'yellow',
        border: '1px solid black',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      {text}
    </div>
  )
}

export default ContextMenu
