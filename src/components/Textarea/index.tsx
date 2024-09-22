import { Icon } from '@iconify/react'
import { Button, Tooltip, Image, Badge, Spinner } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import React from 'react'

import { useChat } from '@/components/Chat/ChatProvider'
import PromptInput from '@/components/Textarea/PromptInput'

interface ComponentProps {
  regenerateActive?: boolean
}

export default function Component({ regenerateActive }: ComponentProps) {
  const { sendMessage, isGenerating, selectedModel } = useChat()

  const [isRegenerating, setIsRegenerating] = React.useState<boolean>(false)
  const [prompt, setPrompt] = React.useState<string>('')
  const [images, setImages] = React.useState<string[]>([])

  const imageRef = React.useRef<HTMLInputElement>(null)

  const onRegenerate = () => {
    setIsRegenerating(true)

    setTimeout(() => {
      setIsRegenerating(false)
    }, 1000)
  }

  const onRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (prompt) {
      sendMessage(prompt, images)
      setPrompt('')
      setImages([])
    }
  }

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const reader = new FileReader()

        reader.onload = () => {
          setImages((prev) => [...prev, reader.result as string])
        }

        reader.readAsDataURL(file)
      }

      e.target.value = ''
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        {regenerateActive && (
          <Button
            isDisabled={isRegenerating}
            size="sm"
            startContent={
              <Icon
                className={cn('text-medium', isRegenerating ? 'origin-center animate-spin' : '')}
                icon="solar:restart-linear"
              />
            }
            variant="flat"
            onPress={onRegenerate}
          >
            Regenerate
          </Button>
        )}
      </div>
      <form
        className="flex w-full flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70"
        onSubmit={onSubmit}
      >
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
                src={image}
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
              <Tooltip showArrow content="Send message">
                <Button
                  isIconOnly
                  color={!prompt ? 'default' : 'primary'}
                  isDisabled={
                    !prompt || isGenerating || isRegenerating || typeof selectedModel === 'string'
                  }
                  radius="lg"
                  size="sm"
                  variant="solid"
                  type="submit"
                >
                  {isGenerating ? (
                    <Spinner size="sm" />
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
          onValueChange={setPrompt}
          startContent={
            typeof selectedModel !== 'string' &&
            selectedModel.hasVision && (
              <>
                <input
                  ref={imageRef}
                  accept="image/*"
                  className="hidden"
                  type="file"
                  multiple
                  onChange={onImageChange}
                />
                <Tooltip showArrow content="Add Image">
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
        <div className="flex w-full flex-wrap items-end justify-between gap-2 px-4 pb-4">
          <p className="py-1 text-tiny text-warning-400">
            {typeof selectedModel === 'string' ? 'Model is not selected' : null}
          </p>
          <p className="py-1 text-tiny text-default-400">{prompt.length}/2000</p>
        </div>
      </form>
    </div>
  )
}
