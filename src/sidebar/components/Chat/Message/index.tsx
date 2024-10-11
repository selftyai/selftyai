import { Icon } from '@iconify/react'
import { Button, Tooltip, Badge } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import React from 'react'

import Markdown from '@/sidebar/components/Chat/Message/Markdown'

export type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: React.ReactNode
  showFeedback?: boolean
  message?: React.ReactNode
  currentAttempt?: number
  status?: 'success' | 'failed'
  attempts?: number
  messageClassName?: string
  isGenerating?: boolean
  statusText?: JSX.Element
  messageLength?: number
  onAttemptChange?: (attempt: number) => void
  onMessageCopy?: (content: string | string[]) => void
}

const MessageCard = React.forwardRef<HTMLDivElement, MessageCardProps>(
  (
    {
      avatar,
      message,
      statusText,
      showFeedback,
      attempts = 1,
      currentAttempt = 1,
      status,
      onMessageCopy,
      onAttemptChange,
      className,
      messageClassName,
      ...props
    },
    ref
  ) => {
    const messageRef = React.useRef<HTMLDivElement>(null)

    const { copied, copy } = useClipboard()

    const hasFailed = status === 'failed'

    const handleCopy = React.useCallback(() => {
      let stringValue = ''

      if (typeof message === 'string') {
        stringValue = message
      } else if (Array.isArray(message)) {
        message.forEach((child) => {
          const childString = typeof child === 'string' ? child : child?.props?.children?.toString()

          if (childString) {
            stringValue += childString + '\n'
          }
        })
      }

      const valueToCopy = stringValue || messageRef.current?.textContent || ''

      copy(valueToCopy)

      onMessageCopy?.(valueToCopy)
    }, [copy, message, onMessageCopy])

    return (
      <div {...props} ref={ref} className={cn('flex gap-3', className)}>
        <div className="relative flex-none">
          <Badge
            isOneChar
            color="danger"
            content={<Icon className="text-background" icon="gravity-ui:circle-exclamation-fill" />}
            isInvisible={!hasFailed}
            placement="bottom-right"
            shape="circle"
          >
            {avatar}
          </Badge>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div
            className={cn(
              'group relative w-full rounded-medium bg-content2 px-4 py-3 text-default-600',
              messageClassName
            )}
          >
            <div ref={messageRef} className={'text-small'}>
              {typeof message === 'string' ? <Markdown message={message} /> : message}
            </div>
            {attempts > 1 && !hasFailed && (
              <div className="flex w-full items-center justify-end">
                <button
                  onClick={() => onAttemptChange?.(currentAttempt > 1 ? currentAttempt - 1 : 1)}
                >
                  <Icon
                    className="cursor-pointer text-default-400 hover:text-default-500"
                    icon="gravity-ui:circle-arrow-left"
                  />
                </button>
                <button
                  onClick={() =>
                    onAttemptChange?.(currentAttempt < attempts ? currentAttempt + 1 : attempts)
                  }
                >
                  <Icon
                    className="cursor-pointer text-default-400 hover:text-default-500"
                    icon="gravity-ui:circle-arrow-right"
                  />
                </button>
                <p className="px-1 text-tiny font-medium text-default-500">
                  {currentAttempt}/{attempts}
                </p>
              </div>
            )}
            {showFeedback && (
              <div className="flex items-center justify-between pt-3">
                <Tooltip content="Copy">
                  <Button isIconOnly radius="full" size="sm" variant="flat" onPress={handleCopy}>
                    {copied ? (
                      <Icon className="text-lg text-default-600" icon="gravity-ui:check" />
                    ) : (
                      <Icon className="text-lg text-default-600" icon="gravity-ui:copy" />
                    )}
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
          {hasFailed && (
            <div className="group relative flex w-full flex-col gap-2 rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground sm:flex-row">
              <div className="text-small">{statusText}</div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

export default MessageCard

MessageCard.displayName = 'MessageCard'
