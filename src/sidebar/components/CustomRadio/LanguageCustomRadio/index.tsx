import type { RadioProps } from '@nextui-org/react'

import enFlag from '@/shared/assets/flags/en.svg'
import ukFlag from '@/shared/assets/flags/uk.svg'
import { Language } from '@/shared/types/Languages'
import { CustomRadio } from '@/sidebar/components/CustomRadio'

interface LanguageCustomRadioProps extends RadioProps {
  language: Language
}

const languageFlags: Record<Language, string> = {
  en: enFlag,
  uk: ukFlag
}

export const LanguageCustomRadio = (props: LanguageCustomRadioProps) => {
  const { language, ...rest } = props
  const imageSrc = languageFlags[language]

  return (
    <CustomRadio
      {...rest}
      imageSrc={imageSrc}
      imageWrapperClassName="flex justify-center left-0 right-0"
    />
  )
}
