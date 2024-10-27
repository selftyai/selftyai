import IsContextEnabledSetting from '@/sidebar/components/Settings/General/SettingItems/IsContextEnabledSetting'
import IsOverlayEnabledSetting from '@/sidebar/components/Settings/General/SettingItems/IsOverlayEnabledSetting'
import UseCustomPromtsSetting from '@/sidebar/components/Settings/General/SettingItems/UseCustomPromtsSetting'

const GeneralSettings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <IsOverlayEnabledSetting />
      <IsContextEnabledSetting />
      <UseCustomPromtsSetting />
    </div>
  )
}

export default GeneralSettings
