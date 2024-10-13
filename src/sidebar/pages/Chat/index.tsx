import { Icon } from '@iconify/react'
import { Card, CardHeader, CardBody, Avatar, Button } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import logo from '@/shared/assets/logo.svg'
import Conversation from '@/sidebar/components/Chat/Conversation'
import SidebarContainer from '@/sidebar/components/Sidebar/SidebarContainer'
import Textarea from '@/sidebar/components/Textarea'
import { useScrollAnchor } from '@/sidebar/hooks/useScrollAnchor'
import { useChat } from '@/sidebar/providers/ChatProvider'

const Chat = () => {
  const [prompt, setPrompt] = useState<string>()

  const { theme } = useTheme()
  const { messages, selectedConversation } = useChat()
  const { scrollRef, scrollToBottom, showScrollToBottom, handleScroll } = useScrollAnchor()
  const { t } = useTranslation()

  const prompts = t('prompts', { returnObjects: true }) as {
    id: string
    text: string
    icon: string
    color: string
  }[]

  return (
    <div className="h-full w-full max-w-full">
      <SidebarContainer
        classNames={{
          header: 'min-h-[40px] h-[40px] py-[12px] justify-center overflow-hidden'
        }}
        title={selectedConversation?.title}
      >
        <div className="relative mx-auto flex h-full max-h-[90dvh] w-full flex-col px-0 sm:px-6 lg:max-w-3xl">
          {selectedConversation ? (
            <OverlayScrollbarsComponent
              ref={scrollRef}
              className="relative flex h-full flex-1 flex-col gap-6 overflow-y-auto pb-8 md:p-6"
              options={{
                scrollbars: {
                  autoHide: 'scroll',
                  theme: theme?.includes('dark') ? 'os-theme-light' : 'os-theme-dark'
                },
                overflow: { x: 'hidden', y: 'scroll' }
              }}
              events={{
                scroll(_, event) {
                  if (event.target instanceof HTMLElement) {
                    handleScroll(event.target)
                  }
                },
                updated(instance) {
                  handleScroll(instance.elements().scrollOffsetElement)
                }
              }}
              defer
            >
              <Conversation
                messages={messages}
                isGenerating={selectedConversation?.generating || false}
              />
              {showScrollToBottom && (
                <Button
                  variant="flat"
                  isIconOnly
                  radius="full"
                  className="fixed bottom-[27vh] left-[45vw] z-10 bg-content1 transition-opacity duration-300 lg:left-[calc(40vw_+_288px)]"
                  onClick={scrollToBottom}
                >
                  <Icon icon="akar-icons:arrow-down" />
                </Button>
              )}
            </OverlayScrollbarsComponent>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-10">
              <Avatar
                src={logo}
                size="lg"
                radius="sm"
                isBordered
                className="bg-foreground dark:bg-background"
              />
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {prompts.map((message) => (
                  <Card
                    key={message.id}
                    className="h-auto cursor-pointer bg-default-100 px-[20px] py-[16px] hover:bg-default-100/80"
                    shadow="none"
                    isPressable
                    onPress={() => {
                      setPrompt(message.text)
                    }}
                  >
                    <CardHeader className="p-0 pb-[9px]">
                      {<Icon className={message.color} icon={message.icon} width={24} />}
                    </CardHeader>
                    <CardBody className="p-0 text-small text-default-400">{message.text}</CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex max-w-full flex-col gap-2 px-2.5">
            <Textarea selectedPrompt={prompt} />
            <p className="hidden px-2 text-center text-xs font-medium leading-5 text-default-500 sm:block">
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </SidebarContainer>
    </div>
  )
}

export default Chat
