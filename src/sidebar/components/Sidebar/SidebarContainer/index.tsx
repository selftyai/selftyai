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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import logo from '@/shared/assets/logo.svg'
import Markdown from '@/sidebar/components/Chat/Message/Markdown'
import RecentPromptDropdown from '@/sidebar/components/Sidebar/SidebarContainer/RecentPromptDropdown'
import { Section, groupConversations } from '@/sidebar/components/Sidebar/SidebarContainer/utils'
import SidebarDrawer from '@/sidebar/components/Sidebar/SidebarDrawer'
import { useChat } from '@/sidebar/providers/ChatProvider'

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
    selectedConversation,
    conversations,
    deleteConversation,
    pinConversation,
    unpinConversation
  } = useChat()
  const { t } = useTranslation()

  const [chatsToShow, setChatsToShow] = useState(MAX_CHATS_TO_DISPLAY)
  const [sections, showMore, onShowMore] = useMemo(() => {
    const onShowMore = () => {
      setChatsToShow((prev) => prev + MAX_CHATS_TO_DISPLAY)
    }

    const sections = conversations ? groupConversations(conversations, chatsToShow) : []

    const totalChatsCount = conversations?.length ?? 0
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
          {t('extensionName')}
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
            chrome?.tts?.stop()
            if (isOpen) onOpenChange()
          }}
        >
          {t('newChat')}
        </Button>

        <Listbox
          aria-label="Chats"
          variant="flat"
          onAction={(key) => {
            if (key === 'show-more') return onShowMore()

            chrome?.tts?.stop()
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
                    titleNode: <></>,
                    conversations: []
                  } as Section
                ]
              : []
          }
          emptyContent={
            <div className="flex h-full items-center justify-center text-sm text-default-400">
              {t('noConversations')}
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
                {t('showMore')}
              </ListboxItem>
            ) : (
              <ListboxSection
                classNames={{
                  base: 'py-0',
                  heading: 'py-0 pl-[10px] text-small text-default-400'
                }}
                title={section.titleNode}
                items={section.conversations}
                key={section.key}
              >
                {(conversation) => (
                  <ListboxItem
                    key={`${conversation.id}`}
                    className={cn(
                      'relative h-[44px] truncate px-[12px] py-[10px] text-default-500',
                      selectedConversation?.id === conversation.id &&
                        'bg-default-100 text-default-foreground'
                    )}
                    classNames={{
                      title: 'truncate'
                    }}
                    endContent={
                      <RecentPromptDropdown
                        onDelete={async () => deleteConversation(conversation!.id)}
                        onPin={async () => pinConversation(conversation!.id)}
                        onUnpin={async () => unpinConversation(conversation!.id)}
                        pinned={conversation.pinned}
                        selected={selectedConversation?.id === conversation.id}
                      />
                    }
                    textValue={conversation.title}
                  >
                    <Markdown className="[&>p]:truncate" children={conversation.title} />
                  </ListboxItem>
                )}
              </ListboxSection>
            )
          }
        </Listbox>
      </OverlayScrollbarsComponent>

      <Spacer y={8} />

      <div className="mt-auto flex flex-col">
        {!window.location.search.includes('fullscreen') && (
          <Button
            className="justify-start text-small text-default-600"
            startContent={
              <Icon className="text-default-600" icon="solar:monitor-line-duotone" width={24} />
            }
            variant="light"
            onClick={() =>
              window.open(`${chrome.runtime.getURL('index.html')}?fullscreen`, '_child', 'noopener')
            }
          >
            {t('fullPage')}
          </Button>
        )}
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
          onClick={() => {
            chrome?.tts?.stop()
            navigator('/settings')
          }}
        >
          {t('settings.title')}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-dvh w-full py-1 md:py-4">
      <SidebarDrawer
        className="h-full flex-none rounded-[14px] bg-default-50"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        {content}
      </SidebarDrawer>
      <div className="flex w-full flex-col px-1 md:px-4 lg:max-w-[calc(100%_-_288px)]">
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
              <div className="flex items-center justify-center text-small font-semibold leading-5 text-foreground">
                <div className="flex-1 truncate text-center">
                  <Markdown className="[&>p]:truncate" children={title || ''} />
                </div>
              </div>
              <div className="truncate text-small font-normal leading-5 text-default-500">
                {subTitle}
              </div>
            </div>
          )}
          {header}
        </header>
        <main className="flex h-full max-h-[calc(100%_-_40px)] flex-col rounded-none rounded-b-medium border-0 border-b border-l border-r border-divider">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Sidebar
