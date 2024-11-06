import { Icon } from '@iconify/react'
import { Button, Tooltip } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { Model } from '@/shared/db/models/Model'
import { ToolInvocation } from '@/shared/db/models/ToolInvocation'
import AttemptsControls from '@/sidebar/components/Chat/Message/AttemptsControls'
import ContextField from '@/sidebar/components/Chat/Message/ContextField'
import EditMessageForm from '@/sidebar/components/Chat/Message/EditMessageForm'
import Markdown from '@/sidebar/components/Chat/Message/Markdown'
import ReadAloudButton from '@/sidebar/components/Chat/Message/ReadAloudButton'
import ToolInvocations from '@/sidebar/components/Chat/Message/ToolInvocations'

export type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: React.ReactNode
  showFeedback?: boolean
  message?: React.ReactNode
  messageContext?: string
  currentAttempt?: number
  status?: string
  attempts?: number
  messageClassName?: string
  isGenerating?: boolean
  statusText?: string
  messageLength?: number
  metadata?: Record<string, string>
  tools: ToolInvocation[]
  model?: Model
  onAttemptChange?: (attempt: number) => void
  onMessageCopy?: (content: string | string[]) => void
  onContinueGenerating?: () => void
  canContinue?: boolean
  onRegenerate?: () => void
  onEdit: (newMessage: string) => void
  canRegenerate?: boolean
  canEdit?: boolean
  isLastMessage?: boolean
}

const MessageCard = memo(
  React.forwardRef<HTMLDivElement, MessageCardProps>(
    (
      {
        avatar,
        message,
        messageContext,
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
        tools,
        canEdit,
        onEdit,
        isGenerating,
        isLastMessage,
        ...props
      },
      ref
    ) => {
      const { t } = useTranslation()
      const messageRef = React.useRef<HTMLDivElement>(null)
      const [isEditing, setIsEditing] = React.useState(false)
      const { copied, copy } = useClipboard()

      const hasFailed = status === 'error'

      const getStringValue = (message: React.ReactNode) => {
        let stringValue = ''

        if (typeof message === 'string') {
          stringValue = message
        } else if (Array.isArray(message)) {
          message.forEach((child) => {
            const childString =
              typeof child === 'string' ? child : child?.props?.children?.toString()

            if (childString) {
              stringValue += childString + '\n'
            }
          })
        }

        return stringValue || messageRef.current?.textContent || ''
      }

      const handleCopy = React.useCallback(() => {
        const valueToCopy = getStringValue(message)

        copy(valueToCopy)
        onMessageCopy?.(valueToCopy)
      }, [copy, message, onMessageCopy])

      return (
        <React.Fragment>
          <div {...props} ref={ref} className={cn('group/message flex flex-col gap-3', className)}>
            {avatar && <div className="relative flex-none">{avatar}</div>}

            {canEdit && !isEditing && (
              <Tooltip content={t('editMessage')} showArrow placement="top">
                <Button
                  isIconOnly
                  radius="full"
                  size="sm"
                  variant="ghost"
                  className="invisible border-0 ring-0 group-hover/message:visible"
                  onPress={() => setIsEditing(true)}
                >
                  <Icon className="text-large text-default-600" icon="akar-icons:pencil" />
                </Button>
              </Tooltip>
            )}

            {isEditing ? (
              <EditMessageForm
                message={getStringValue(message)}
                onCancel={() => setIsEditing(false)}
                onEdit={(newMessage) => {
                  setIsEditing(false)
                  onEdit(newMessage)
                }}
              />
            ) : (
              <div className={cn('w-full overflow-hidden', !avatar && 'w-fit')}>
                <div
                  className={cn(
                    'group relative w-full rounded-medium text-default-600',
                    messageClassName
                  )}
                >
                  <ContextField messageContext={messageContext} />
                  <ToolInvocations tools={tools} />
                  <div ref={messageRef} className="text-small">
                    {typeof message === 'string' ? <Markdown children={message} /> : message}
                  </div>
                  {showFeedback && (
                    <div
                      className={cn(
                        'invisible mt-3 flex items-center gap-2 transition-all duration-500 group-hover/message:visible',
                        (attempts > 1 || isLastMessage) && 'visible'
                      )}
                    >
                      {attempts > 1 && !hasFailed && (
                        <AttemptsControls
                          attempts={attempts}
                          currentAttempt={currentAttempt}
                          onAttemptChange={onAttemptChange}
                        />
                      )}
                      <ReadAloudButton message={message} />
                      <Tooltip showArrow content={t('copyButton')} placement="bottom">
                        <Button
                          isIconOnly
                          radius="sm"
                          size="sm"
                          variant="ghost"
                          className="border-0 ring-0"
                          onPress={handleCopy}
                        >
                          {copied ? (
                            <Icon className="text-lg text-default-600" icon="gravity-ui:check" />
                          ) : (
                            <Icon className="text-lg text-default-600" icon="gravity-ui:copy" />
                          )}
                        </Button>
                      </Tooltip>
                      {metadata && !hasFailed && status !== 'aborted' && (
                        <Tooltip
                          showArrow
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
                        >
                          <div className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-small px-4 hover:!bg-default">
                            <Icon
                              className="min-w-8 text-lg text-default-600"
                              icon="gravity-ui:circle-info"
                            />
                          </div>
                        </Tooltip>
                      )}
                      {tools.length > 0 && (
                        <Tooltip
                          showArrow
                          content={
                            <div className="flex flex-col gap-2 p-2.5">
                              <p>{t('invokedTools')}</p>
                              <ul className="list-inside list-disc">
                                {tools.map((tool) => (
                                  <li key={tool.id}>
                                    {t(`tools.${tool.toolName}`, {
                                      provider: t(`tools.${tool.subName}`)
                                    })}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          }
                          placement="top"
                        >
                          <div className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-small hover:!bg-default">
                            <Icon
                              className="min-w-8 text-lg text-default-600"
                              icon="lucide:toy-brick"
                            />
                          </div>
                        </Tooltip>
                      )}
                      {status === 'aborted' && (
                        <Tooltip showArrow content={t('continueButton')} placement="bottom">
                          <Button
                            isIconOnly
                            radius="sm"
                            size="sm"
                            variant="ghost"
                            className="border-0 ring-0"
                            onPress={onContinueGenerating}
                            isDisabled={!canContinue}
                          >
                            <Icon
                              className="text-lg text-default-600"
                              icon="gravity-ui:circle-play"
                            />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip showArrow content={t('regenerateButton')} placement="bottom">
                        <Button
                          isIconOnly
                          radius="sm"
                          size="sm"
                          variant="ghost"
                          className="border-0 ring-0"
                          isDisabled={!canRegenerate}
                          onPress={onRegenerate}
                        >
                          <Icon
                            className="text-lg text-default-600"
                            icon="gravity-ui:arrows-rotate-right"
                          />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </div>
                {hasFailed && (
                  <div className="group relative mt-2 flex w-full flex-col gap-2 rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground sm:flex-row">
                    <div className="text-small">{statusText}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          {!showFeedback && attempts > 1 && !isEditing && !isGenerating && (
            <AttemptsControls
              className="-mt-2 ml-auto w-full justify-end"
              attempts={attempts}
              currentAttempt={currentAttempt}
              onAttemptChange={onAttemptChange}
            />
          )}
        </React.Fragment>
      )
    }
  )
)

export default MessageCard

MessageCard.displayName = 'MessageCard'
