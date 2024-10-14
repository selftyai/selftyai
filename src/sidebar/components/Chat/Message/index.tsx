import { Icon } from '@iconify/react'
import { Button, Tooltip, Badge } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Markdown from '@/sidebar/components/Chat/Message/Markdown'

export type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: React.ReactNode
  showFeedback?: boolean
  message?: React.ReactNode
  currentAttempt?: number
  status?: string
  attempts?: number
  messageClassName?: string
  isGenerating?: boolean
  statusText?: JSX.Element
  messageLength?: number
  metadata?: Record<string, string>
  onAttemptChange?: (attempt: number) => void
  onMessageCopy?: (content: string | string[]) => void
  onContinueGenerating?: () => void
  canContinue?: boolean
  onRegenerate?: () => void
  canRegenerate?: boolean
  isLastMessage?: boolean
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
      metadata,
      onContinueGenerating,
      canContinue,
      onRegenerate,
      canRegenerate,
      isLastMessage,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation()
    const messageRef = React.useRef<HTMLDivElement>(null)

    const { copied, copy } = useClipboard()

    const hasFailed = status === 'error'

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
              <div className="flex items-center gap-2 pt-2">
                <Tooltip content={t('copyButton')} placement="bottom">
                  <Button isIconOnly radius="full" size="sm" variant="flat" onPress={handleCopy}>
                    {copied ? (
                      <Icon className="text-lg text-default-600" icon="gravity-ui:check" />
                    ) : (
                      <Icon className="text-lg text-default-600" icon="gravity-ui:copy" />
                    )}
                  </Button>
                </Tooltip>
                {metadata && !hasFailed && status !== 'aborted' && (
                  <Tooltip
                    content={
                      <div className="flex flex-col gap-2 p-2.5">
                        {Object.entries(metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-1">
                            <span className="text-tiny text-default-500">
                              {t(`responseMetadata.${key}.label`)}:
                            </span>
                            <span className="text-tiny text-default-600">
                              {t(`responseMetadata.${key}.unit`, {
                                value
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    }
                    placement="top"
                    showArrow
                  >
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-default/40">
                      <Icon className="text-lg text-default-600" icon="gravity-ui:circle-info" />
                    </div>
                  </Tooltip>
                )}
                {status === 'aborted' && (
                  <Tooltip content={t('continueButton')} placement="bottom">
                    <Button
                      isIconOnly
                      radius="full"
                      size="sm"
                      variant="flat"
                      onPress={onContinueGenerating}
                      isDisabled={!canContinue}
                    >
                      <Icon className="text-lg text-default-600" icon="gravity-ui:circle-play" />
                    </Button>
                  </Tooltip>
                )}
                {isLastMessage && (
                  <Tooltip content={t('regenerateButton')} placement="bottom">
                    <Button
                      isIconOnly
                      radius="full"
                      size="sm"
                      variant="flat"
                      isDisabled={!canRegenerate}
                      onPress={onRegenerate}
                    >
                      <Icon
                        className="text-lg text-default-600"
                        icon="gravity-ui:arrows-rotate-right"
                      />
                    </Button>
                  </Tooltip>
                )}
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
