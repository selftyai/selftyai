import { Icon } from '@iconify/react/dist/iconify.js'
import { Tab, Tabs, Tooltip } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import AppearanceSetting from '@/sidebar/components/Settings/AppearanceSetting'
import General from '@/sidebar/components/Settings/General'
import Integrations from '@/sidebar/components/Settings/Integrations'
import Plugins from '@/sidebar/components/Settings/Plugins'
import SidebarContainer from '@/sidebar/components/Sidebar/SidebarContainer'
import useMediaQuery from '@/sidebar/hooks/useMediaQuery'

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  const isSmallScreen = useMediaQuery(`(max-width: 580px)`)

  const tabs = [
    {
      id: 'general',
      title: t('settings.general.title'),
      icon: 'line-md:cog-loop',
      children: <General />
    },
    {
      id: 'appearance',
      title: t('settings.appearance.title'),
      icon: 'lucide:palette',
      children: <AppearanceSetting />
    },
    {
      id: 'integrations',
      title: t('settings.integrations.title'),
      icon: 'fluent:glance-horizontal-sparkles-24-regular',
      children: <Integrations />
    },
    {
      id: 'plugins',
      title: t('settings.plugins.title'),
      icon: 'lucide:toy-brick',
      children: <Plugins />
    }
  ]

  return (
    <div className="flex h-full max-h-[100dvh] w-full max-w-full flex-col">
      <SidebarContainer
        classNames={{
          header: 'min-h-[40px] h-[40px] py-[12px] justify-center overflow-hidden'
        }}
      >
        <div className="w-full flex-1 p-4">
          <div className="flex items-center gap-x-3">
            <h1 className="text-3xl font-bold leading-9 text-default-foreground">
              {t('settings.title')}
            </h1>
          </div>
          <Tabs
            aria-label="Navigation Tabs"
            classNames={{
              tabList: 'w-full relative rounded-none p-0 gap-4 lg:gap-6',
              tab: 'max-w-fit px-0 h-12',
              cursor: 'w-full',
              tabContent: 'text-default-400'
            }}
            radius="full"
            variant="underlined"
            selectedKey={searchParams.get('tab') || 'general'}
            onSelectionChange={(key) => {
              searchParams.set('tab', key as string)
              setSearchParams(searchParams)
            }}
            items={tabs}
          >
            {(tab) => (
              <Tab
                key={tab.id}
                title={
                  <Tooltip isDisabled={!isSmallScreen} content={tab.title}>
                    <div className="flex items-center space-x-2 max-[580px]:px-3">
                      <Icon icon={tab.icon} width={24} height={24} />
                      <span className="max-[580px]:hidden">{tab.title}</span>
                    </div>
                  </Tooltip>
                }
              >
                {tab.children}
              </Tab>
            )}
          </Tabs>
        </div>
      </SidebarContainer>
    </div>
  )
}

export default Settings
