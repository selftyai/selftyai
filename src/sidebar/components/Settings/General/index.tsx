import { cn } from '@nextui-org/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import DefaultModelSetting from '@/sidebar/components/Settings/General/SettingItems/DefaultModelSetting'
import IsContextEnabledSetting from '@/sidebar/components/Settings/General/SettingItems/IsContextEnabledSetting'
import IsOverlayEnabledSetting from '@/sidebar/components/Settings/General/SettingItems/IsOverlayEnabledSetting'
import UseCustomPromptsSetting from '@/sidebar/components/Settings/General/SettingItems/UseCustomPromptsSetting'
import { useTheme } from '@/sidebar/providers/ThemeProvider'

interface GeneralSettingsProps {
  className?: string
}

const GeneralSettings = ({ className, ...props }: GeneralSettingsProps) => {
  const { theme } = useTheme()
  return (
    <OverlayScrollbarsComponent
      className={cn('max-h-[75dvh] px-2', className)}
      options={{
        scrollbars: {
          autoHide: 'scroll',
          theme: theme?.includes('dark') ? 'os-theme-light' : 'os-theme-dark'
        },
        overflow: { x: 'hidden', y: 'scroll' }
      }}
      defer
      {...props}
    >
      <div className="flex flex-col gap-4">
        <IsOverlayEnabledSetting />
        <IsContextEnabledSetting />
        <UseCustomPromptsSetting />
        <DefaultModelSetting />
      </div>
    </OverlayScrollbarsComponent>
  )
}

GeneralSettings.displayName = 'GeneralSettings'

export default GeneralSettings
