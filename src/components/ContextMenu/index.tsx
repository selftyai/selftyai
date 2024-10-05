import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Image, Tooltip } from '@nextui-org/react'
import React from 'react'

import logo from '@/assets/logo.svg'

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
      className="z-[1000] flex items-center justify-center gap-1 rounded-lg bg-background p-1"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`
      }}
      onClick={onClose}
    >
      <Tooltip content="Ask AI">
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Image width={35} height={30} src={logo} removeWrapper />
        </Button>
      </Tooltip>
      <Button isIconOnly size="sm" variant="light" className="border-none text-base">
        <Icon icon="akar-icons:copy" />
      </Button>
      <Button isIconOnly size="sm" variant="light" className="border-none text-base">
        <Icon icon="mingcute:quill-pen-ai-line" />
      </Button>
      <Button isIconOnly size="sm" variant="light" className="border-none text-base">
        <Icon icon="f7:pencil-outline" />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="border-none text-base"
        onClick={onClose}
      >
        <Icon icon="uiw:close" />
      </Button>
    </div>
  )
}

export default ContextMenu
