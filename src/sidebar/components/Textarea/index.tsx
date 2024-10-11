import { Icon } from '@iconify/react'
import {
  Button,
  Tooltip,
  Image,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem
} from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import React, { memo, useMemo } from 'react'

import { Model } from '@/shared/types/Model'
import PromptInput from '@/sidebar/components/Textarea/PromptInput'
import { useEnterSubmit } from '@/sidebar/hooks/useEnterSubmit'
import { useChat, useModels } from '@/sidebar/providers/ChatProvider'

const TextArea = memo(() => {
  const { sendMessage, isGenerating, hasError, regenerateResponse, stopGenerating } = useChat()
  const { selectedModel, models, selectModel } = useModels()
  const { formRef, onKeyDown } = useEnterSubmit()

  const groupedModels = useMemo(() => {
    return models.reduce(
      (acc, model) => {
        if (!acc[model.provider]) {
          acc[model.provider] = []
        }
        acc[model.provider].push(model)
        return acc
      },
      {} as Record<string, Model[]>
    )
  }, [models])

  const [prompt, setPrompt] = React.useState<string>('')
  const [images, setImages] = React.useState<string[]>([])

  const imageRef = React.useRef<HTMLInputElement>(null)

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
      {hasError && (
        <div>
          <Button
            size="sm"
            startContent={<Icon className="text-medium" icon="solar:restart-linear" />}
            variant="flat"
            isDisabled={!selectedModel}
            onPress={regenerateResponse}
          >
            Regenerate
          </Button>
        </div>
      )}
      <form
        className="flex w-full flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70"
        onSubmit={onSubmit}
        ref={formRef}
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
              <Tooltip showArrow content={isGenerating ? 'Stop generating' : 'Send message'}>
                <Button
                  isIconOnly
                  color={isGenerating ? 'default' : !prompt ? 'default' : 'primary'}
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
            selectedModel?.hasVision && (
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
          <Dropdown className="bg-content1" placement="top-start">
            <DropdownTrigger>
              <Button
                size="sm"
                startContent={
                  <Icon className="text-medium text-warning-500" icon="proicons:sparkle" />
                }
                variant="flat"
              >
                {selectedModel ? selectedModel.name : 'Select Model'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="models"
              className="p-0 pt-2"
              variant="faded"
              onAction={(e) => selectModel(e as string)}
              items={Object.keys(groupedModels)
                .map((provider) => ({
                  key: provider,
                  models: groupedModels[provider]
                }))
                .filter((provider) => provider.models.length > 0)}
              emptyContent="No models available, visit settings"
            >
              {(provider) => (
                <DropdownSection
                  classNames={{
                    heading: 'text-tiny px-[10px]'
                  }}
                  title={chrome.i18n.getMessage(`${provider.key}Models`)}
                  items={provider.models.map((model, index) => ({ ...model, index }))}
                >
                  {(model) => (
                    <DropdownItem
                      key={model.model}
                      className="text-default-500 data-[hover=true]:text-default-500"
                      classNames={{
                        description: 'text-default-500 text-tiny'
                      }}
                      endContent={
                        selectedModel?.name === model.name && (
                          <Icon
                            className="text-default-foreground"
                            height={24}
                            icon="solar:check-circle-bold"
                            width={24}
                          />
                        )
                      }
                    >
                      {model.name}
                    </DropdownItem>
                  )}
                </DropdownSection>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* <p className="py-1 text-tiny text-default-400">{prompt.length}/2000</p> */}
        </div>
      </form>
    </div>
  )
})

export default TextArea
