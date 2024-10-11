import { Icon } from '@iconify/react'
import { Card, CardHeader, CardBody, Avatar, Button } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import logo from '@/shared/assets/logo.svg'
import Conversation from '@/sidebar/components/Chat/Conversation'
import SidebarContainer from '@/sidebar/components/Sidebar/SidebarContainer'
import Textarea from '@/sidebar/components/Textarea'
import { useScrollAnchor } from '@/sidebar/hooks/useScrollAnchor'
import { suggestions } from '@/sidebar/pages/Chat/utils'
import { useChat } from '@/sidebar/providers/ChatProvider'

const Chat = () => {
  const { chatId } = useParams()
  const { theme } = useTheme()
  const { messages, setChatId, isGenerating, conversations } = useChat()
  const { scrollRef, scrollToBottom, showScrollToBottom, handleScroll } = useScrollAnchor()

  useEffect(() => {
    setChatId(chatId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId])

  return (
    <div className="h-full w-full max-w-full">
      <SidebarContainer
        classNames={{
          header: 'min-h-[40px] h-[40px] py-[12px] justify-center overflow-hidden'
        }}
        title={
          chatId
            ? conversations.find((conversation) => conversation.id === chatId)?.title
            : undefined
        }
      >
        <div className="relative mx-auto flex h-full max-h-[90dvh] w-full flex-col px-0 sm:px-6 lg:max-w-3xl">
          {messages.length > 0 || chatId ? (
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
              <Conversation messages={messages} isGenerating={isGenerating} />
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

          <div className="mt-auto flex max-w-full flex-col gap-2 px-2.5">
            <Textarea />
            <p className="hidden px-2 text-center text-xs font-medium leading-5 text-default-500 sm:block">
              {chrome.i18n.getMessage('disclaimer')}
            </p>
          </div>
        </div>
      </SidebarContainer>
    </div>
  )
}

export default Chat
