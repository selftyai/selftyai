import { RadioGroup } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import { Language, supportedLanguages } from '@/shared/types/Languages'
import sendMessageToContentScript from '@/shared/utils/sendMessageToContentScript'
import { LanguageCustomRadio } from '@/sidebar/components/CustomRadio/LanguageCustomRadio'
import { ThemeCustomRadio } from '@/sidebar/components/CustomRadio/ThemeCustomRadio'
import { useLanguage } from '@/sidebar/providers/LanguageProvider'
import { useTheme } from '@/sidebar/providers/ThemeProvider'

interface AppearanceSettingCardProps {
  className?: string
}

const AppearanceSetting = React.forwardRef<HTMLDivElement, AppearanceSettingCardProps>(
  ({ className, ...props }, ref) => {
    const { t, i18n } = useTranslation()
    const { theme, changeTheme } = useTheme()
    const { changeLanguage } = useLanguage()

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
        <div ref={ref} className="flex flex-col gap-4">
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
              onChange={(e) => changeTheme(e.target.value)}
              value={theme}
            >
              <ThemeCustomRadio value="light" variant="light">
                {t('settings.appearance.theme.options.light')}
              </ThemeCustomRadio>
              <ThemeCustomRadio value="dark" variant="dark">
                {t('settings.appearance.theme.options.dark')}
              </ThemeCustomRadio>
            </RadioGroup>
          </div>
          <div>
            <p className="text-base font-medium text-default-700">
              {t('settings.appearance.language.label')}
            </p>
            <p className="mt-1 text-sm font-normal text-default-400">
              {t('settings.appearance.language.description')}
            </p>
            <RadioGroup
              classNames={{
                wrapper: 'mt-4 flex-wrap gap-x-2 gap-y-2'
              }}
              orientation="horizontal"
              onChange={(e) => {
                changeLanguage(e.target.value as Language)
                sendMessageToContentScript({
                  type: ContentScriptServerEndpoints.languageChanged,
                  payload: e.target.value
                })
              }}
              value={i18n.language}
            >
              {Object.entries(supportedLanguages).map(([key, language]) => (
                <LanguageCustomRadio key={language} value={language} language={language}>
                  {t(`settings.appearance.language.options.${key}`)}
                </LanguageCustomRadio>
              ))}
            </RadioGroup>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    )
  }
)

AppearanceSetting.displayName = 'AppearanceSetting'

export default AppearanceSetting
