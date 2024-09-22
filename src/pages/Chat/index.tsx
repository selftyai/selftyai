import { Icon } from '@iconify/react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ScrollShadow,
  Avatar
} from '@nextui-org/react'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import logo from '@/assets/logo.svg'
import { useChat } from '@/components/Chat/ChatProvider'
import Conversation from '@/components/Chat/Conversation'
import SidebarContainer from '@/components/Sidebar/SidebarContainer'
import Textarea from '@/components/Textarea'
import { suggestions, icons } from '@/pages/Chat/utils'
import type { Model } from '@/services/types/Model'

const Chat = () => {
  const { chatId } = useParams()
  const { messages, models, selectedModel, selectModel, setChatId } = useChat()

  useEffect(() => {
    setChatId(chatId)
  }, [chatId])

  const groupedModels = useMemo(() => {
    return models.reduce(
      (acc, model) => {
        return {
          ...acc,
          [model.provider]: [...(acc[model.provider] || []), model]
        }
      },
      {} as Record<string, Model[]>
    )
  }, [models])

  return (
    <div className="h-full w-full max-w-full">
      <SidebarContainer
        classNames={{
          header: 'min-h-[40px] h-[40px] py-[12px] justify-center overflow-hidden'
        }}
        header={
          <Dropdown className="bg-content1">
            <DropdownTrigger>
              <Button
                disableAnimation
                className="w-full min-w-[120px] items-center text-default-400 data-[hover=true]:bg-[unset]"
                endContent={
                  <Icon
                    className="text-default-400"
                    height={20}
                    icon="solar:alt-arrow-down-linear"
                    width={20}
                  />
                }
                variant="light"
              >
                {typeof selectedModel === 'string' ? selectedModel : selectedModel.name}
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
                        typeof selectedModel !== 'string' &&
                        selectedModel.name === model.name && (
                          <Icon
                            className="text-default-foreground"
                            height={24}
                            icon="solar:check-circle-bold"
                            width={24}
                          />
                        )
                      }
                      startContent={
                        <Icon
                          className="text-default-400"
                          height={24}
                          icon={icons[model.index % icons.length]}
                          width={24}
                        />
                      }
                    >
                      {model.name}
                    </DropdownItem>
                  )}
                </DropdownSection>
              )}
            </DropdownMenu>
          </Dropdown>
        }
      >
        <div className="relative flex h-full max-h-[90dvh] flex-col px-6">
          {messages.length > 0 ? (
            <ScrollShadow className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-6 pb-8">
              <Conversation />
            </ScrollShadow>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-10">
              <Avatar
                src={logo}
                size="lg"
                radius="sm"
                isBordered
                className="bg-background ring-0 dark:ring-2"
              />
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {suggestions.map((message) => (
                  <Card
                    key={message.key}
                    className="h-auto bg-default-100 px-[20px] py-[16px]"
                    shadow="none"
                  >
                    <CardHeader className="p-0 pb-[9px]">{message.icon}</CardHeader>
                    <CardBody className="p-0 text-small text-default-400">
                      {message.description}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex max-w-full flex-col gap-2">
            <Textarea />
            <p className="px-2 text-center text-small font-medium leading-5 text-default-500">
              {chrome.i18n.getMessage('disclaimer')}
            </p>
          </div>
        </div>
      </SidebarContainer>
    </div>
  )
}

export default Chat
