import { Icon } from '@iconify/react'
import {
  Button,
  ScrollShadow,
  Listbox,
  ListboxItem,
  ListboxSection,
  Spacer,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
  Image
} from '@nextui-org/react'
import React from 'react'
import Markdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'

import logo from '@/shared/assets/logo.svg'
import SidebarDrawer from '@/sidebar/components/Sidebar/SidebarDrawer'
import { useChat } from '@/sidebar/providers/ChatProvider'

function RecentPromptDropdown({
  onDelete,
  selected
}: {
  onDelete: () => void
  selected?: boolean
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Icon
          className={cn('hidden text-default-500 group-hover:block', selected && 'block')}
          icon="solar:menu-dots-bold"
          width={24}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dropdown menu with icons"
        className="py-2"
        variant="faded"
        onAction={(key) => {
          if (key === 'delete') {
            onDelete()
          }
        }}
      >
        {/* <DropdownItem
          key="rename"
          className="text-default-500 data-[hover=true]:text-default-500"
          startContent={
            <Icon className="text-default-300" height={20} icon="solar:pen-linear" width={20} />
          }
        >
          Rename
        </DropdownItem> */}
        {/* <DropdownItem
          key="archive"
          className="text-default-500 data-[hover=true]:text-default-500"
          startContent={
            <Icon
              className="text-default-300"
              height={20}
              icon="solar:folder-open-linear"
              width={20}
            />
          }
        >
          Archive
        </DropdownItem> */}
        <DropdownItem
          key="delete"
          className="text-danger-500 data-[hover=true]:text-danger-500"
          color="danger"
          startContent={
            <Icon
              className="text-danger-500"
              height={20}
              icon="solar:trash-bin-minimalistic-linear"
              width={20}
            />
          }
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default function Component({
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
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigator = useNavigate()
  const { chatId, deleteConversation, conversations, setChatId } = useChat()

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

      <ScrollShadow className="-mr-6 h-full max-h-full pr-6">
        <Button
          fullWidth
          className="mb-6 mt-2 h-[44px] justify-start gap-3 bg-default-foreground px-3 py-[10px] text-default-50"
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
          aria-label="Recent chats"
          variant="flat"
          onAction={(key) => {
            navigator(`/${key}`)
            onOpenChange()
          }}
        >
          <ListboxSection
            classNames={{
              base: 'py-0',
              heading: 'py-0 pl-[10px] text-small text-default-400'
            }}
            title="Recent"
            items={conversations}
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
          {/* <ListboxItem
              key="show-more"
              className="h-[44px] px-[12px] py-[10px] text-default-400"
              endContent={
                <Icon className="text-default-300" icon="solar:alt-arrow-down-linear" width={20} />
              }
            >
              Show more
            </ListboxItem> */}
        </Listbox>
      </ScrollShadow>

      <Spacer y={8} />

      <div className="mt-auto flex flex-col">
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
          <Button isIconOnly className="flex lg:hidden" size="sm" variant="light" onPress={onOpen}>
            <Icon
              className="text-default-500"
              height={24}
              icon="solar:hamburger-menu-outline"
              width={24}
            />
          </Button>
          {(title || subTitle) && (
            <div className="w-full min-w-[120px] sm:w-auto">
              <div className="truncate text-small font-semibold leading-5 text-foreground">
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
