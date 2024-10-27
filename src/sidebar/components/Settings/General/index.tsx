import IsContextEnabledSetting from '@/sidebar/components/Settings/General/SettingItems/IsContextEnabledSetting'
import IsOverlayEnabledSetting from '@/sidebar/components/Settings/General/SettingItems/IsOverlayEnabledSetting'
import UseCustomPromptsSetting from '@/sidebar/components/Settings/General/SettingItems/UseCustomPromptsSetting'

const GeneralSettings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <IsOverlayEnabledSetting />
      <IsContextEnabledSetting />
      <UseCustomPromptsSetting />
    </div>
  )
}

export default GeneralSettings