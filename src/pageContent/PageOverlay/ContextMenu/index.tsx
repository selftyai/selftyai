import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Image } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Tooltip from '@/pageContent/PageOverlay/ContextMenu/CustomTooltip'
import useContextMenuState from '@/pageContent/hooks/useContextMenu'
import { SidePanelAction } from '@/server/types/sidePanel/SidePanelActions'
import logo from '@/shared/assets/logo.svg'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

const ContextMenu: React.FC = () => {
  const { sendMessage } = useChromePort()
  const { copied, copy } = useClipboard()
  const { t } = useTranslation()

  const { menuPosition, selectedText, closeOverlay } = useContextMenuState()

  const handleSendMessage = () => {
    sendMessage(ServerEndpoints.sidePanelHandler, { action: SidePanelAction.OPEN })

    sendMessage(ServerEndpoints.setMessageContext, { context: selectedText })
  }

  if (!menuPosition || !selectedText) return null

  return (
    <div
      className="pointer-events-auto z-[10000] flex items-center justify-center gap-2 rounded-lg border-1 border-content2 bg-background p-1 text-foreground"
      style={{
        position: 'absolute',
        left: `${menuPosition.left}px`,
        top: `${menuPosition.top}px`
      }}
    >
      <Tooltip content={t('pageContent.contextMenu.askAI')}>
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
      <Tooltip content={copied ? t('copied') : t('copy')}>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="border-none text-base"
          onClick={() => copy(selectedText)}
        >
          <Icon icon="akar-icons:copy" />
        </Button>
      </Tooltip>
      <Tooltip content={t('pageContent.contextMenu.highlight')}>
        <Button isIconOnly size="sm" variant="light" className="border-none text-base">
          <Icon icon="fluent:copy-select-20-filled" />
        </Button>
      </Tooltip>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="border-none text-base"
        onClick={closeOverlay}
      >
        <Icon icon="uiw:close" />
      </Button>
    </div>
  )
}

export default ContextMenu
