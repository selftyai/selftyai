import { Icon } from '@iconify/react'
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection
} from '@nextui-org/react'
import type { Selection } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useChat, useModels } from '@/sidebar/providers/ChatProvider'
import getAvailableTools, { ToolSection } from '@/sidebar/utils/getAvailableTools'

const SelectToolDropdown = () => {
  const { t } = useTranslation()
  const navigator = useNavigate()

  const [availableTools, setAvailableTools] = useState<ToolSection[]>([])

  const { selectedModel } = useModels()
  const { tools, setTools } = useChat()

  const [selectedTools, setSelectedTools] = useState<Selection>(new Set(tools))

  const filterIds = (idsArray: string[], allTools: ToolSection[]): string[] => {
    const itemToSection: { [itemId: string]: string } = {}
    for (const section of allTools) {
      for (const item of section.items) {
        itemToSection[item.id] = section.id
      }
    }

    const sectionToItem: Map<string, string> = new Map()

    for (const itemId of idsArray) {
      const sectionId = itemToSection[itemId]
      if (sectionId !== undefined) {
        sectionToItem.set(sectionId, itemId)
      }
    }

    const resultIds: string[] = []
    const seenItems = new Set<string>()

    for (const itemId of idsArray) {
      const sectionId = itemToSection[itemId]
      const lastItemId = sectionToItem.get(sectionId)

      if (itemId === lastItemId && !seenItems.has(itemId)) {
        resultIds.push(itemId)
        seenItems.add(itemId)
      }
    }

    return resultIds
  }

  useEffect(() => {
    getAvailableTools().then(setAvailableTools)
  }, [])

  return (
    <Dropdown
      className="bg-content1"
      showArrow
      isDisabled={!selectedModel || !selectedModel.supportTool}
    >
      <DropdownTrigger>
        <Button
          size="sm"
          startContent={<Icon className="text-medium text-default-500" icon="lucide:toy-brick" />}
          variant="flat"
        >
          {t('tools', { count: tools.length })}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="tools"
        className="p-0 pt-2"
        closeOnSelect={false}
        variant="faded"
        selectionMode="multiple"
        selectedKeys={selectedTools}
        emptyContent={
          <div className="flex flex-col gap-2 pb-2 text-center">
            <Trans
              i18nKey="noPluginsAvailable"
              components={{
                SettingsLink: (
                  <Button
                    size="sm"
                    color="default"
                    className="text-default-600"
                    onClick={() => navigator('/settings?tab=plugins')}
                    startContent={
                      <Icon
                        className="text-default-600"
                        icon="solar:settings-minimalistic-line-duotone"
                        width={16}
                      />
                    }
                  />
                )
              }}
            />
          </div>
        }
        onSelectionChange={(keys) => {
          const tools = filterIds([...keys].map(String), availableTools)

          setTools(tools)
          setSelectedTools(new Set(tools))
        }}
        items={availableTools}
      >
        {(tool) => (
          <DropdownSection
            key={`tools-${tool.id}`}
            classNames={{
              heading: 'text-tiny px-[10px]'
            }}
            title={tool.name}
            items={tool.items}
          >
            {(item) => (
              <DropdownItem
                key={item.id}
                className="text-default-500 data-[hover=true]:text-default-500"
                classNames={{
                  description: 'text-default-500 text-tiny truncate'
                }}
                startContent={item.icon}
                textValue={item.name}
                title={item.name}
              />
            )}
          </DropdownSection>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}

export default SelectToolDropdown
