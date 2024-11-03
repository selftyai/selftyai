import { Icon } from '@iconify/react'
import { Button, Tooltip, Image, Badge } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import React, { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { File } from '@/shared/db/models/File'
import ContextField from '@/sidebar/components/Textarea/ContextField'
import PromptInput from '@/sidebar/components/Textarea/PromptInput'
import { useEnterSubmit } from '@/sidebar/hooks/useEnterSubmit'
import { useChat, useModels } from '@/sidebar/providers/ChatProvider'

import SelectModelDropdown from './SelectModelDropdown'
import SelectToolDropdown from './SelectToolDropdown'

interface TextAreaProps {
  selectedPrompt?: string
  clearPrompt?: () => void
}

const TextArea = memo(({ selectedPrompt, clearPrompt }: TextAreaProps) => {
  const {
    sendMessage,
    messages,
    selectedConversation,
    stopGenerating,
    messageContext,
    setMessageContext
  } = useChat()
  const { selectedModel, models, selectModel } = useModels()
  const { formRef, onKeyDown } = useEnterSubmit()
  const { t } = useTranslation()

  const hasError = messages ? messages[messages.length - 1]?.error === 'error' : false
  const isGenerating = selectedConversation?.generating

  const [prompt, setPrompt] = React.useState<string>('')
  const [images, setImages] = React.useState<Omit<File, 'conversationId' | 'messageId'>[]>([])

  const imageRef = React.useRef<HTMLInputElement>(null)

  const onRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (prompt && selectedModel) {
      sendMessage(prompt, images)
      setPrompt('')
      setImages([])
      clearPrompt?.()
    }
  }

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const reader = new FileReader()

        reader.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              name: file.name,
              type: 'image',
              data: reader.result as string
            }
          ])
        }

        reader.readAsDataURL(file)
      }

      e.target.value = ''
    }
  }

  useEffect(() => {
    if (selectedPrompt) {
      setPrompt(selectedPrompt)
    }
  }, [selectedPrompt])

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        className="flex w-full flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70"
        onSubmit={onSubmit}
        ref={formRef}
      >
        <ContextField messageContext={messageContext} setMessageContext={setMessageContext} />
        <div className="group flex gap-2 px-4 pt-4">
          {images.map((image, index) => (
            <Badge
              key={index}
              isOneChar
              className="opacity-0 group-hover:opacity-100"
              content={
                <Button
                  isIconOnly
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={() => onRemoveImage(index)}
                >
                  <Icon className="text-foreground" icon="iconamoon:close-thin" width={16} />
                </Button>
              }
            >
              <Image
                alt="uploaded image cover"
                className="size-14 rounded-small border-small border-default-200/50 object-cover"
                src={image.data}
              />
            </Badge>
          ))}
        </div>
        <PromptInput
          classNames={{
            inputWrapper: '!bg-transparent shadow-none',
            innerWrapper: 'relative',
            input: 'pt-1 pl-2 pb-6 !pr-10 text-medium'
          }}
          endContent={
            <div className="flex items-end gap-2">
              <Tooltip showArrow content={t(isGenerating ? 'stopButton' : 'promptButton')}>
                <Button
                  isIconOnly
                  color={isGenerating || !prompt ? 'default' : 'primary'}
                  isDisabled={!isGenerating && (!prompt || !selectedModel || hasError)}
                  radius="lg"
                  size="sm"
                  variant="solid"
                  type={isGenerating ? 'button' : 'submit'}
                  onPress={isGenerating ? stopGenerating : undefined}
                >
                  {isGenerating ? (
                    <Icon
                      className="text-danger [&>path]:stroke-[2px]"
                      icon="solar:stop-bold"
                      width={20}
                    />
                  ) : (
                    <Icon
                      className={cn(
                        '[&>path]:stroke-[2px]',
                        !prompt ? 'text-default-600' : 'text-primary-foreground'
                      )}
                      icon="solar:arrow-up-linear"
                      width={20}
                    />
                  )}
                </Button>
              </Tooltip>
            </div>
          }
          minRows={3}
          radius="lg"
          value={prompt}
          variant="flat"
          onKeyDown={onKeyDown}
          onValueChange={setPrompt}
          startContent={
            selectedModel?.vision && (
              <>
                <input
                  ref={imageRef}
                  accept="image/*"
                  className="hidden"
                  type="file"
                  multiple
                  onChange={onImageChange}
                />
                <Tooltip showArrow content={t('addImage')}>
                  <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    variant="light"
                    onClick={() => {
                      if (imageRef.current) {
                        imageRef.current.click()
                      }
                    }}
                  >
                    <Icon
                      className="text-default-500"
                      icon="solar:gallery-minimalistic-linear"
                      width={20}
                    />
                  </Button>
                </Tooltip>
              </>
            )
          }
        />
        <div className="flex w-full flex-wrap items-end justify-between gap-2 px-3 pb-4">
          <div className="inline-flex flex-wrap gap-2">
            <SelectModelDropdown
              models={models}
              onSelectModel={selectModel}
              selectedModel={selectedModel}
            />
            <SelectToolDropdown />
          </div>

          {/* <p className="py-1 text-tiny text-default-400">{prompt.length}/2000</p> */}
        </div>
      </form>
    </div>
  )
})

export default TextArea
