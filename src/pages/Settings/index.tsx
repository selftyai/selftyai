import { Tab, Tabs } from '@nextui-org/react'

// import APISetting from '@/components/Settings/APISetting'
import AppearanceSetting from '@/components/Settings/AppearanceSetting'
import SelfHosted from '@/components/Settings/SelfHosted'
import SidebarContainer from '@/components/Sidebar/SidebarContainer'

const Settings = () => {
  return (
    <div className="flex h-full max-h-[100dvh] w-full max-w-full flex-col">
      <SidebarContainer
        classNames={{
          header: 'min-h-[40px] h-[40px] py-[12px] justify-center overflow-hidden'
        }}
        header={<div className="ml-auto"></div>}
      >
        <div className="w-full max-w-2xl flex-1 p-4">
          <div className="flex items-center gap-x-3">
            <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>
          </div>
          <h2 className="mt-2 text-small text-default-500">
            Customize settings, appearance and more
          </h2>
          <Tabs
            fullWidth
            classNames={{
              base: 'mt-6',
              cursor: 'bg-content1 dark:bg-content1',
              panel: 'w-full p-0 pt-4'
            }}
          >
            <Tab key="appearance" title="Appearance">
              <AppearanceSetting />
            </Tab>
            {/* <Tab key="api" title="Network AI API">
              <APISetting />
            </Tab> */}
            <Tab key="self-hosted" title="Self-hosted">
              <SelfHosted className="max-h-[68dvh]" />
            </Tab>
          </Tabs>
        </div>
      </SidebarContainer>
    </div>
  )
}

export default Settings
