import { Icon } from '@iconify/react'
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Chip,
  Image,
  Tooltip
} from '@nextui-org/react'
import { memo, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'
import useMediaQuery from '@/sidebar/hooks/useMediaQuery'

interface SelectModelDropdownProps {
  withIcon?: boolean
  models: Model[]
  selectedModel?: Model
  onSelectModel: (model: string) => void
}

const SelectModelDropdown = memo(
  ({ withIcon, models, selectedModel, onSelectModel }: SelectModelDropdownProps) => {
    const { t } = useTranslation()
    const navigator = useNavigate()

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

    const getIcon = (provider: string) => {
      switch (provider) {
        case Integrations.ollama:
          return <Icon className="text-large text-default-500" icon="simple-icons:ollama" />
        case Integrations.githubModels:
          return <Icon className="text-large text-default-500" icon="simple-icons:github" />
        case Integrations.groq:
          return (
            <Image
              src="https://www.google.com/s2/favicons?domain=https://groq.com/&sz=128"
              width={24}
              height={24}
              fallbackSrc={
                <Icon className="text-large text-default-500" icon="majesticons:robot-line" />
              }
            />
          )
        default:
          return <Icon className="text-large text-default-500" icon="majesticons:robot-line" />
      }
    }

    const isMobile = useMediaQuery('(max-width: 640px)')

    return (
      <Dropdown className="bg-content1" placement="top-start">
        <DropdownTrigger>
          <Button
            size="sm"
            variant="flat"
            className="h-auto min-h-8 whitespace-normal py-1"
            isIconOnly={isMobile && withIcon}
          >
            {isMobile && withIcon ? (
              <Tooltip content={selectedModel ? selectedModel.name : t('selectModel')}>
                <Icon className="text-medium text-warning-500" icon="proicons:sparkle" />
              </Tooltip>
            ) : (
              <div className="inline-flex gap-2">
                <Icon className="text-medium text-warning-500" icon="proicons:sparkle" />
                <p>{selectedModel ? selectedModel.name : t('selectModel')}</p>
              </div>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="models"
          className="max-h-[300px] overflow-y-auto p-0 pt-2"
          variant="faded"
          onAction={(e) => onSelectModel(e as string)}
          items={Object.keys(groupedModels)
            .map((provider) => ({
              key: provider,
              models: groupedModels[provider]
            }))
            .filter((provider) => provider.models.length > 0)}
          emptyContent={
            <div className="flex flex-col gap-2 pb-2 text-center">
              <Trans
                i18nKey="noModelsAvailable"
                components={{
                  SettingsLink: (
                    <Button
                      size="sm"
                      color="default"
                      className="text-default-600"
                      onClick={() => navigator('/settings?tab=integrations')}
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
        >
          {(provider) => (
            <DropdownSection
              classNames={{
                heading: 'text-tiny px-[10px]'
              }}
              title={t(provider.key)}
              items={provider.models
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .map((model, index) => ({ ...model, index }))}
            >
              {(model) => (
                <DropdownItem
                  key={model.model}
                  className="text-default-500 data-[hover=true]:text-default-500"
                  classNames={{
                    description: 'text-default-500 text-tiny truncate'
                  }}
                  startContent={getIcon(model.provider)}
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
                  textValue={model.model}
                >
                  {model.name}
                  {model.vision && (
                    <Chip color="success" size="sm" variant="flat" radius="sm" className="ml-2">
                      <Icon icon="solar:eye-linear" width={16} />
                    </Chip>
                  )}
                  {model.supportTool && (
                    <Chip color="secondary" size="sm" variant="flat" radius="sm" className="ml-2">
                      <Icon icon="lucide:toy-brick" width={16} />
                    </Chip>
                  )}
                </DropdownItem>
              )}
            </DropdownSection>
          )}
        </DropdownMenu>
      </Dropdown>
    )
  }
)

export default SelectModelDropdown
