import { RadioGroup } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { ThemeCustomRadio } from '@/components/Theme/Switcher'

interface AppearanceSettingCardProps {
  className?: string
}

const AppearanceSetting = React.forwardRef<HTMLDivElement, AppearanceSettingCardProps>(
  ({ className, ...props }, ref) => {
    const { theme, setTheme } = useTheme()

    return (
      <div ref={ref} className={cn('p-2', className)} {...props}>
        <div>
          <p className="text-base font-medium text-default-700">Theme</p>
          <p className="mt-1 text-sm font-normal text-default-400">
            Change the appearance of the web.
          </p>
          <RadioGroup
            classNames={{
              wrapper: 'mt-4 flex-wrap gap-x-2 gap-y-2'
            }}
            orientation="horizontal"
            onChange={(e) => {
              setTheme(e.target.value)
            }}
            defaultValue={theme}
          >
            <ThemeCustomRadio value="light" variant="light">
              Light
            </ThemeCustomRadio>
            <ThemeCustomRadio value="dark" variant="dark">
              Dark
            </ThemeCustomRadio>
          </RadioGroup>
        </div>
      </div>
    )
  }
)

AppearanceSetting.displayName = 'AppearanceSetting'

export default AppearanceSetting
