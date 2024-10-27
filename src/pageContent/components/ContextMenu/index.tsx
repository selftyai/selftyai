import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Image } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Tooltip from '@/pageContent/components/ContextMenu/CustomTooltip'
import useContextMenuState from '@/pageContent/hooks/useContextMenu'
import { usePageContent } from '@/pageContent/providers/PageContentProvider'
import { SidePanelAction } from '@/server/types/sidePanel/SidePanelActions'
import logo from '@/shared/assets/logo.svg'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

const ContextMenu: React.FC = () => {
  const { sendMessage } = useChromePort()
  const { copied, copy } = useClipboard()
  const { t } = useTranslation()

  const { menuPosition, selectedText, closeOverlay } = useContextMenuState()
  const { isContextInPromptEnabled } = usePageContent()

  const handleSendMessage = () => {
    if (!isContextInPromptEnabled) return
    sendMessage(ServerEndpoints.sidePanelHandler, { action: SidePanelAction.OPEN })

    sendMessage(ServerEndpoints.setMessageContext, { context: selectedText })
  }

  return (
    <AnimatePresence>
      {menuPosition && selectedText && (
        <motion.div
          className="pointer-events-auto z-[10000] flex items-center justify-center gap-2 rounded-lg border-1 border-content2 bg-background p-1 text-foreground"
          style={{
            position: 'absolute',
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`
          }}
          key={selectedText}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.125, ease: 'easeOut' } }}
          transition={{ type: 'spring', stiffness: 232, damping: 17 }}
        >
          <Tooltip
            content={
              isContextInPromptEnabled
                ? t('pageContent.contextMenu.askAI.tooltip')
                : t('pageContent.contextMenu.askAI.isContextInPromptFalseTooltip')
            }
          >
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="border-none text-base"
              onClick={handleSendMessage}
              disabled={!isContextInPromptEnabled}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ContextMenu
