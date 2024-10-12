import { Icon } from '@iconify/react/dist/iconify.js'
import { Button } from '@nextui-org/react'

import { useChat } from '@/sidebar/providers/ChatProvider'

const ContextField = () => {
  const { messageContext, setMessageContext } = useChat()
  return (
    messageContext && (
      <div className="w-full p-2 pb-0">
        <div className="flex gap-2 rounded rounded-b-md rounded-t-lg bg-content3 p-2">
          <Icon icon="mage:l-arrow-down-right" className="mx-2 h-8 min-w-4" />
          <span className="line-clamp-2 flex-1 text-xs">{messageContext}</span>
          <Button
            isIconOnly
            onClick={() => setMessageContext(undefined)}
            variant="light"
            size="sm"
            className="border-none text-base"
          >
            <Icon icon="bitcoin-icons:cross-filled" />
          </Button>
        </div>
      </div>
    )
  )
}

export default ContextField
