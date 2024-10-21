import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Image } from '@nextui-org/react'
import { Tooltip } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { SidePanelAction } from '@/server/types/sidePanel/SidePanelActions'
import logo from '@/shared/assets/logo.svg'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

interface ContextMenuProps {
  left: number
  top: number
  onClose: () => void
  text: string
  overlayRef: React.RefObject<HTMLDivElement>
}

const ContextMenu: React.FC<ContextMenuProps> = ({ left, top, onClose, text, overlayRef }) => {
  const { sendMessage } = useChromePort()
  const { copied, copy } = useClipboard()
  const { t } = useTranslation()

  const handleSendMessage = () => {
    sendMessage(ServerEndpoints.sidePanelHandler, { action: SidePanelAction.OPEN })

    sendMessage(ServerEndpoints.setMessageContext, { context: text })
  }

  return (
    <div
      className="z-[10000] flex items-center justify-center gap-2 rounded-lg border-1 border-content2 bg-background p-1 text-foreground"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`
      }}
      onClick={onClose}
    >
      <Tooltip
        content={t('pageContent.contextMenu.askAI')}
        portalContainer={overlayRef.current ?? undefined}
      >
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
      <Tooltip
        content={copied ? t('copied') : t('copy')}
        portalContainer={overlayRef.current ?? undefined}
      >
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="border-none text-base"
          onClick={() => copy(text)}
        >
          <Icon icon="akar-icons:copy" />
        </Button>
      </Tooltip>
      <Tooltip
        content={t('pageContent.contextMenu.highlight')}
        portalContainer={overlayRef.current ?? undefined}
      >
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Icon icon="fluent:copy-select-20-filled" />
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
