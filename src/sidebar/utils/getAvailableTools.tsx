import { Icon } from '@iconify/react'
import { Image } from '@nextui-org/react'
import i18n from 'i18next'

import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'

interface ToolItem {
  id: string
  name: string
  icon: JSX.Element
}

export interface ToolSection {
  id: string
  name: string
  items: ToolItem[]
}

export default async function getAvailableTools() {
  const integrations = await db.integrations.toArray()
  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.active &&
      [Integrations.tavily, Integrations.google].includes(integration.name as Integrations)
  )

  const tools: ToolSection[] = [
    {
      id: 'web_search',
      name: i18n.t('settings.plugins.webSearch.title'),
      items: [
        {
          id: Integrations.google,
          name: i18n.t('settings.plugins.webSearch.google.title'),
          icon: <Icon width={24} height={24} icon="logos:google-icon" />
        },
        {
          id: Integrations.tavily,
          name: i18n.t('settings.plugins.webSearch.tavily.title'),
          icon: (
            <Image
              src="https://www.google.com/s2/favicons?domain=https://tavily.com/&sz=128"
              width="24"
              height="24"
            />
          )
        }
      ].filter((item) =>
        filteredIntegrations.map((integration) => integration.name).includes(item.id)
      )
    }
  ]

  return tools.filter((section) => section.items.length > 0)
}
