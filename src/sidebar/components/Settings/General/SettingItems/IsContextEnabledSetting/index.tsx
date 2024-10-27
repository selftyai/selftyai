import { useLiveQuery } from 'dexie-react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import sendMessageToContentScript from '@/shared/utils/sendMessageToContentScript'
import CustomSwitch from '@/sidebar/components/CustomSwitch'

const IsContextEnabledSetting = () => {
  const { t } = useTranslation()

  const isContextEnabled = useLiveQuery(
    () => db.settings.get(SettingsKeys.isContextInPromptEnabled),
    []
  )

  const handleIsContextEnabledChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    await db.settings.put({
      key: SettingsKeys.isContextInPromptEnabled,
      value: isChecked ? 'true' : 'false'
    })
    sendMessageToContentScript({
      type: ContentScriptServerEndpoints.setIsContextInPromptEnabled,
      payload: isChecked
    })
  }

  return (
    <CustomSwitch
      label={t('settings.general.isUsingContextInPrompt.label')}
      description={t('settings.general.isUsingContextInPrompt.description')}
      isSelected={isContextEnabled?.value === 'true'}
      onChange={handleIsContextEnabledChange}
    />
  )
}

export default IsContextEnabledSetting
