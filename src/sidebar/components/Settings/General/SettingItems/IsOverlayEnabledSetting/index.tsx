import { useLiveQuery } from 'dexie-react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import sendMessageToContentScript from '@/shared/utils/sendMessageToContentScript'
import CustomSwitch from '@/sidebar/components/CustomSwitch'

const IsOverlayEnabledSetting = () => {
  const { t } = useTranslation()

  const isOverlayEnabled = useLiveQuery(() => db.settings.get(SettingsKeys.isPageOverlayEnable), [])

  const handleIsOverlayEnabledChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked

    await db.settings.put({
      key: SettingsKeys.isPageOverlayEnable,
      value: isChecked ? 'true' : 'false'
    })
    sendMessageToContentScript({
      type: ContentScriptServerEndpoints.setPageOverlayIsEnable,
      payload: isChecked
    })
  }

  return (
    <CustomSwitch
      label={t('settings.general.isPageOverlayEnabled.label')}
      description={t('settings.general.isPageOverlayEnabled.description')}
      isSelected={isOverlayEnabled?.value === 'true'}
      onChange={handleIsOverlayEnabledChange}
    />
  )
}

export default IsOverlayEnabledSetting
