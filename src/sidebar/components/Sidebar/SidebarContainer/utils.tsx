import { Icon } from '@iconify/react'
import i18next from 'i18next'

import type { Conversation } from '@/shared/types/Conversation'

export type Section = {
  key: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  titleNode: any
  conversations: Conversation[]
}

function getLastMessageDate(conversation: Conversation): Date | null {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  return lastMessage ? new Date(lastMessage.createdAt) : null
}

export const groupConversations = (
  conversations: Conversation[],
  conversationsToShow: number
): Section[] => {
  const sections: Section[] = []

  const pinnedConversations = conversations.filter((conversation) => conversation.isPinned)
  const unpinnedConversations = conversations.filter((conversation) => !conversation.isPinned)

  unpinnedConversations.sort((a, b) => {
    const dateA = getLastMessageDate(a)
    const dateB = getLastMessageDate(b)
    return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0)
  })

  const conversationsToDisplay = unpinnedConversations.slice(0, conversationsToShow)

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const sevenDaysAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
  const thirtyDaysAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)

  const dateSections = [
    {
      key: 'today',
      title: i18next.t('today'),
      icon: 'solar:star-fall-bold-duotone',
      matches: (date: Date | null) => date !== null && date >= todayStart
    },
    {
      key: 'yesterday',
      title: i18next.t('yesterday'),
      icon: 'solar:star-angle-bold-duotone',
      matches: (date: Date | null) => date !== null && date >= yesterdayStart && date < todayStart
    },
    {
      key: 'previous7Days',
      title: i18next.t('previous7Days'),
      icon: 'solar:star-shine-bold-duotone',
      matches: (date: Date | null) =>
        date !== null && date >= sevenDaysAgoStart && date < yesterdayStart
    },
    {
      key: 'previous30Days',
      title: i18next.t('previous30Days'),
      icon: 'solar:stars-line-line-duotone',
      matches: (date: Date | null) =>
        date !== null && date >= thirtyDaysAgoStart && date < sevenDaysAgoStart
    },
    {
      key: 'other',
      title: i18next.t('other'),
      icon: 'solar:star-rings-line-duotone',
      matches: (date: Date | null) => date !== null && date < thirtyDaysAgoStart
    }
  ]

  const chatsByDateSection = dateSections.reduce(
    (acc, { key }) => {
      acc[key] = [] as Conversation[]
      return acc
    },
    {} as { [key: string]: Conversation[] }
  )

  conversationsToDisplay.forEach((chat) => {
    const chatDate = getLastMessageDate(chat)
    const section = chatDate && dateSections.find(({ matches }) => matches(chatDate))

    if (!section) {
      return
    }

    chatsByDateSection[section.key].push(chat)
  })

  if (pinnedConversations.length > 0) {
    sections.push({
      key: 'pinned',
      title: i18next.t('pinned'),
      titleNode: (
        <span className="flex items-center gap-2 font-medium text-default-700">
          <Icon icon="solar:pin-bold-duotone" width={24} />
          {i18next.t('pinned')}
        </span>
      ),
      conversations: pinnedConversations
    })
  }

  dateSections.forEach(({ key, title, icon }) => {
    const conversations = chatsByDateSection[key]
    if (conversations.length > 0) {
      sections.push({
        key,
        title,
        titleNode: (
          <span className="flex items-center gap-2 font-medium text-default-700">
            <Icon icon={icon} width={24} />
            {title}
          </span>
        ),
        conversations
      })
    }
  })

  return sections
}
