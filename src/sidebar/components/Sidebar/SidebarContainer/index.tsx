import { Icon } from '@iconify/react'
import {
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Spacer,
  useDisclosure,
  cn,
  Image
} from '@nextui-org/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import React, { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'

import logo from '@/shared/assets/logo.svg'
import type { Conversation } from '@/shared/types/Conversation'
import RecentPromptDropdown from '@/sidebar/components/Sidebar/SidebarContainer/RecentPromptDropdown'
import SidebarDrawer from '@/sidebar/components/Sidebar/SidebarDrawer'
import { useChat } from '@/sidebar/providers/ChatProvider'

interface Section {
  key: string
  title: string
  titleNode?: React.ReactNode
  chats: Conversation[]
}

const MAX_CHATS_TO_DISPLAY = 20

const Sidebar = ({
  children,
  header,
  title,
  subTitle,
  classNames = {}
}: {
  children?: React.ReactNode
  header?: React.ReactNode
  title?: string
  subTitle?: string
  classNames?: Record<string, string>
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigator = useNavigate()
  const {
    chatId,
    deleteConversation,
    conversations,
    setChatId,
    pinConversation,
    unpinConversation
  } = useChat()

  const [chatsToShow, setChatsToShow] = useState(MAX_CHATS_TO_DISPLAY)
  const [sections, showMore, onShowMore] = useMemo(() => {
    const sections: Section[] = []

    const onShowMore = () => {
      setChatsToShow((prev) => prev + MAX_CHATS_TO_DISPLAY)
    }

    const pinnedChats = conversations.filter((chat) => chat.isPinned)
    const unpinnedChats = conversations
      .filter((chat) => !chat.isPinned)
      .sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1]?.createdAt
        const lastMessageB = b.messages[b.messages.length - 1]?.createdAt
        if (!lastMessageA || !lastMessageB) return 0
        return new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime()
      })

    if (pinnedChats.length > 0) {
      sections.push({
        key: 'pinned',
        title: 'Pinned',
        titleNode: (
          <span className="flex items-center gap-2">
            <Icon icon="solar:pin-linear" width={20} />
            Pinned
          </span>
        ),
        chats: pinnedChats
      })
    }

    const chatsToDisplay = unpinnedChats.slice(0, chatsToShow)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const sevenDaysAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const thirtyDaysAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)

    const chatsByDateSection = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      previous7Days: [] as Conversation[],
      previous30Days: [] as Conversation[],
      other: [] as Conversation[]
    }

    for (const chat of chatsToDisplay) {
      const chatDate = new Date(chat.messages[chat.messages.length - 1]?.createdAt)
      if (chatDate >= todayStart) {
        chatsByDateSection.today.push(chat)
      } else if (chatDate >= yesterdayStart) {
        chatsByDateSection.yesterday.push(chat)
      } else if (chatDate >= sevenDaysAgoStart) {
        chatsByDateSection.previous7Days.push(chat)
      } else if (chatDate >= thirtyDaysAgoStart) {
        chatsByDateSection.previous30Days.push(chat)
      } else {
        chatsByDateSection.other.push(chat)
      }
    }

    if (chatsByDateSection.today.length > 0) {
      sections.push({
        key: 'today',
        title: 'Today',
        chats: chatsByDateSection.today
      })
    }
    if (chatsByDateSection.yesterday.length > 0) {
      sections.push({
        key: 'yesterday',
        title: 'Yesterday',
        chats: chatsByDateSection.yesterday
      })
    }
    if (chatsByDateSection.previous7Days.length > 0) {
      sections.push({
        key: 'previous7Days',
        title: 'Previous 7 Days',
        chats: chatsByDateSection.previous7Days
      })
    }
    if (chatsByDateSection.previous30Days.length > 0) {
      sections.push({
        key: 'previous30Days',
        title: 'Previous 30 Days',
        chats: chatsByDateSection.previous30Days
      })
    }
    if (chatsByDateSection.other.length > 0) {
      sections.push({
        key: 'other',
        title: 'Other',
        chats: chatsByDateSection.other
      })
    }

    const totalChatsCount = unpinnedChats.length
    const showMore = totalChatsCount > chatsToShow

    return [sections, showMore, onShowMore]
  }, [conversations, chatsToShow])

  const content = (
    <div className="relative flex h-full w-72 flex-1 flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Image src={logo} className="size-8" alt="Logo" />
        </div>
        <span className="text-base font-bold uppercase leading-6 text-foreground">
          {chrome.i18n.getMessage('extensionName')}
        </span>
      </div>

      <Spacer y={8} />

      <OverlayScrollbarsComponent
        className="-mr-6 h-full max-h-full pr-6"
        options={{ scrollbars: { autoHide: 'scroll' } }}
        defer
      >
        <Button
          fullWidth
          className="sticky top-0 z-10 mb-6 h-[44px] justify-start gap-3 bg-default-foreground px-3 py-[10px] text-default-50"
          startContent={
            <Icon className="text-default-50" icon="solar:chat-round-dots-linear" width={24} />
          }
          onClick={() => {
            navigator('/')
            setChatId(undefined)
            if (isOpen) onOpenChange()
          }}
        >
          New Chat
        </Button>

        <Listbox
          aria-label="Chats"
          variant="flat"
          onAction={(key) => {
            if (key === 'show-more') return onShowMore()

            navigator(`/${key}`)
            if (isOpen) onOpenChange()
          }}
          classNames={{
            list: 'gap-4'
          }}
          items={
            sections.length
              ? [
                  ...sections,
                  {
                    key: 'show-more',
                    title: 'Show more',
                    chats: []
                  } as Section
                ]
              : []
          }
          emptyContent={
            <div className="flex h-full items-center justify-center text-sm text-default-400">
              No conversations
            </div>
          }
        >
          {(section) =>
            section.key === 'show-more' ? (
              <ListboxItem
                key="show-more"
                className={cn(
                  'h-[44px] px-[12px] py-[10px] text-default-400',
                  !showMore && 'hidden'
                )}
                endContent={
                  <Icon
                    className="text-default-300"
                    icon="solar:alt-arrow-down-linear"
                    width={20}
                  />
                }
              >
                Show more
              </ListboxItem>
            ) : (
              <ListboxSection
                classNames={{
                  base: 'py-0',
                  heading: 'py-0 pl-[10px] text-small text-default-400'
                }}
                title={section.title}
                items={section.chats}
                key={section.key}
              >
                {(conversation) => (
                  <ListboxItem
                    key={conversation.id}
                    className={cn(
                      'relative h-[44px] truncate px-[12px] py-[10px] text-default-500',
                      chatId === conversation.id && 'bg-default-100 text-default-foreground'
                    )}
                    classNames={{
                      title: 'truncate'
                    }}
                    endContent={
                      <RecentPromptDropdown
                        onDelete={() => {
                          deleteConversation(conversation.id)
                        }}
                        onPin={() => {
                          pinConversation(conversation.id)
                        }}
                        onUnpin={() => {
                          unpinConversation(conversation.id)
                        }}
                        pinned={conversation.isPinned}
                        selected={chatId === conversation.id}
                      />
                    }
                    textValue={conversation.title}
                  >
                    <Markdown
                      components={{
                        p: ({ children }) => <span>{children}</span>,
                        strong: ({ children }) => <span>{children}</span>
                      }}
                    >
                      {conversation.title}
                    </Markdown>
                  </ListboxItem>
                )}
              </ListboxSection>
            )
          }
        </Listbox>
      </OverlayScrollbarsComponent>

      <Spacer y={8} />

      <div className="mt-auto flex flex-col">
        <Button
          className="justify-start text-small text-default-600"
          startContent={
            <Icon className="text-default-600" icon="solar:monitor-line-duotone" width={24} />
          }
          variant="light"
          onClick={() => window.open(chrome.runtime.getURL('index.html'))}
        >
          Full page
        </Button>
        <Button
          className="justify-start text-default-600"
          startContent={
            <Icon
              className="text-default-600"
              icon="solar:settings-minimalistic-line-duotone"
              width={24}
            />
          }
          variant="light"
          onClick={() => navigator('/settings')}
        >
          Settings
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-dvh w-full py-4">
      <SidebarDrawer
        className="h-full flex-none rounded-[14px] bg-default-50"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        {content}
      </SidebarDrawer>
      <div className="flex w-full flex-col px-4 lg:max-w-[calc(100%_-_288px)]">
        <header
          className={cn(
            'flex h-16 min-h-16 items-center justify-between gap-2 rounded-none rounded-t-medium border-small border-divider px-4 py-3',
            classNames?.['header']
          )}
        >
          <Button
            isIconOnly
            className="mr-auto flex lg:hidden"
            size="sm"
            variant="light"
            onPress={onOpen}
          >
            <Icon
              className="text-default-500"
              height={24}
              icon="solar:sidebar-minimalistic-outline"
              width={24}
            />
          </Button>
          {(title || subTitle) && (
            <div className="w-full min-w-[120px] flex-1 sm:w-auto">
              <div className="flex items-center justify-center truncate text-small font-semibold leading-5 text-foreground">
                <Markdown
                  components={{
                    p: ({ children }) => <span>{children}</span>,
                    strong: ({ children }) => <span>{children}</span>
                  }}
                >
                  {title}
                </Markdown>
              </div>
              <div className="truncate text-small font-normal leading-5 text-default-500">
                {subTitle}
              </div>
            </div>
          )}
          {header}
        </header>
        <main className="flex h-full">
          <div className="flex h-full w-full flex-col gap-4 rounded-none rounded-b-medium border-0 border-b border-l border-r border-divider py-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Sidebar
