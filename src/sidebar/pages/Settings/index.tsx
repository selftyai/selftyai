import { Tab, Tabs } from '@nextui-org/react'
import { useSearchParams } from 'react-router-dom'

import AppearanceSetting from '@/sidebar/components/Settings/AppearanceSetting'
import Integrations from '@/sidebar/components/Settings/Integrations'
import SidebarContainer from '@/sidebar/components/Sidebar/SidebarContainer'

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div className="flex h-full max-h-[100dvh] w-full max-w-full flex-col">
      <SidebarContainer
        classNames={{
          header: 'min-h-[40px] h-[40px] py-[12px] justify-center overflow-hidden'
        }}
      >
        <div className="w-full flex-1 p-4">
          <div className="flex items-center gap-x-3">
            <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>
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
            selectedKey={searchParams.get('tab') || 'appearance'}
            onSelectionChange={(key) => {
              searchParams.set('tab', key as string)
              setSearchParams(searchParams)
            }}
          >
            <Tab key="appearance" title="Appearance">
              <AppearanceSetting />
            </Tab>
            <Tab key="integrations" title="Integrations">
              <Integrations className="max-h-[75dvh]" />
            </Tab>
          </Tabs>
        </div>
      </SidebarContainer>
    </div>
  )
}

export default Settings
