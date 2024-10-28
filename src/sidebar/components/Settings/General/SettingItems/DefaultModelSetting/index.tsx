import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, cn } from '@nextui-org/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import SelectModelDropdown from '@/sidebar/components/Textarea/SelectModelDropdown'
import { useModels } from '@/sidebar/providers/ChatProvider'

const DefaultModelSetting = () => {
  const { t } = useTranslation()
  const { models } = useModels()

  const defaultModel = useLiveQuery(() => db.settings.get(SettingsKeys.defaultModel), [])

  const handleSelectDefaultModel = (model: string) => {
    db.settings.put({
      key: SettingsKeys.defaultModel,
      value: model
    })
  }

  const getDefaultModel = (model: string) => {
    return models.find((m) => m.model === model)
  }

  return (
    <div
      className={cn(
        'flex max-w-2xl overflow-hidden rounded-lg border-2 border-transparent bg-content1 shadow-md',
        'select-none rounded-lg p-4 hover:bg-content2',
        defaultModel?.value && 'border-2 border-foreground'
      )}
    >
      <div className="inline-flex w-full flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-medium">{t('settings.general.defaultModel.label')}</p>
          <p className="max-w-64 text-tiny text-default-400">
            {t('settings.general.defaultModel.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SelectModelDropdown
            selectedModel={defaultModel?.value ? getDefaultModel(defaultModel?.value) : undefined}
            models={models}
            onSelectModel={handleSelectDefaultModel}
          />
          <Button isIconOnly size="sm" onClick={() => handleSelectDefaultModel('')}>
            <Icon icon="radix-icons:reset" width={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DefaultModelSetting
