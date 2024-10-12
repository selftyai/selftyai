import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Image } from '@nextui-org/react'
import React, { useEffect } from 'react'

import Tooltip from '@/pageContent/PageOverlay/CustomTooltip'
import { SidePanelAction } from '@/server/types/sidePanel/SidePanelActions'
import logo from '@/shared/assets/logo.svg'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

interface ContextMenuProps {
  left: number
  top: number
  onClose: () => void
  text: string
}

const ContextMenu: React.FC<ContextMenuProps> = ({ left, top, onClose, text }) => {
  const { sendMessage, addMessageListener } = useChromePort()

  useEffect(() => {
    const removeListener = addMessageListener((message: string) => {
      console.log('Received message:', message)
    })

    return () => removeListener()
  }, [addMessageListener, text])

  const handleSendMessage = () => {
    sendMessage(ServerEndpoints.sidePanelHandlerer, { action: SidePanelAction.OPEN })

    sendMessage(ServerEndpoints.setMessageContext, { context: text })
  }

  const handleSendMessageClose = () => {
    sendMessage(ServerEndpoints.sidePanelHandlerer, { action: SidePanelAction.CLOSE })
  }

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
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="border-none text-base"
          onClick={handleSendMessage}
        >
          <Image width={35} height={35} src={logo} removeWrapper />
        </Button>
      </Tooltip>
      <Tooltip content={chrome.i18n.getMessage('tooltip_copy')}>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="border-none text-base"
          onClick={handleSendMessageClose}
        >
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
