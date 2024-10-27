import type { RadioProps } from '@nextui-org/react'

import darkTheme from '@/shared/assets/dark-theme.svg'
import lightTheme from '@/shared/assets/light-theme.svg'
import { CustomRadio } from '@/sidebar/components/CustomRadio'

interface ThemeCustomRadioProps extends RadioProps {
  variant: 'light' | 'dark'
}

export const ThemeCustomRadio = (props: ThemeCustomRadioProps) => {
  const { variant, ...rest } = props

  const themeVariant = {
    light: lightTheme,
    dark: darkTheme
  }

  return (
    <CustomRadio {...rest} imageSrc={themeVariant[variant]} imageWrapperClassName="left-[32px]" />
  )
}
