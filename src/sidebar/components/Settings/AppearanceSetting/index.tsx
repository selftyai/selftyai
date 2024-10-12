import { RadioGroup } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ThemeCustomRadio } from '@/sidebar/components/ThemeSwitcher'

interface AppearanceSettingCardProps {
  className?: string
}

const AppearanceSetting = React.forwardRef<HTMLDivElement, AppearanceSettingCardProps>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()

    return (
      <div ref={ref} className={cn('p-2', className)} {...props}>
        <div>
          <p className="text-base font-medium text-default-700">
            {t('settings.appearance.theme.label')}
          </p>
          <p className="mt-1 text-sm font-normal text-default-400">
            {t('settings.appearance.theme.description')}
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
              {t('settings.appearance.theme.options.light')}
            </ThemeCustomRadio>
            <ThemeCustomRadio value="dark" variant="dark">
              {t('settings.appearance.theme.options.dark')}
            </ThemeCustomRadio>
          </RadioGroup>
        </div>
      </div>
    )
  }
)

AppearanceSetting.displayName = 'AppearanceSetting'

export default AppearanceSetting
