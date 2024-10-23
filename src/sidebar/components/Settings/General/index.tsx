import React from 'react'
import { useTranslation } from 'react-i18next'

import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import CustomSwitch from '@/sidebar/components/CustomSwitch'
import sendMessageAsync from '@/sidebar/utils/sendMessageAsync'

const GeneralSettings: React.FC = () => {
  const { t } = useTranslation()

  const [isSelected, setIsSelected] = React.useState<boolean>(true)

  React.useEffect(() => {
    const changeIsContextEnabled = async () => {
      await sendMessageAsync<boolean>({
        type: ServerEndpoints.setIsContextEnabled,
        payload: isSelected
      })
    }

    changeIsContextEnabled()
  }, [isSelected])

  return (
    <div className="flex flex-col gap-4">
      <CustomSwitch
        label={t('settings.general.isPageOverlayEnabled.label')}
        description={t('settings.general.isPageOverlayEnabled.description')}
        isSelected={isSelected}
        onValueChange={setIsSelected}
      />
    </div>
  )
}

export default GeneralSettings
