import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Image } from '@nextui-org/react'
import React from 'react'

import logo from '@/assets/logo.svg'
import Tooltip from '@/components/PageOverlay/CustomTooltip'

interface ContextMenuProps {
  left: number
  top: number
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({ left, top, onClose }) => {
  return (
    <div
      className="z-[10000] flex items-center justify-center gap-1 rounded-lg bg-background p-1 dark"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`
      }}
      onClick={onClose}
    >
      <Tooltip content={chrome.i18n.getMessage('tooltip_askAI')}>
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Image width={35} height={30} src={logo} removeWrapper />
        </Button>
      </Tooltip>
      <Tooltip content={chrome.i18n.getMessage('tooltip_copy')}>
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Icon icon="akar-icons:copy" />
        </Button>
      </Tooltip>
      <Tooltip content={chrome.i18n.getMessage('tooltip_improveWriting')}>
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Icon icon="mingcute:quill-pen-ai-line" />
        </Button>
      </Tooltip>
      <Tooltip content={chrome.i18n.getMessage('tooltip_continueWriting')}>
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Icon icon="f7:pencil-outline" />
        </Button>
      </Tooltip>

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
