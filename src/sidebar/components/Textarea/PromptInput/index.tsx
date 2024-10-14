import type { TextAreaProps } from '@nextui-org/react'
import { Textarea } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

const PromptInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames = {}, ...props }, ref) => {
    const { t } = useTranslation()

    return (
      <Textarea
        ref={ref}
        aria-label="Prompt"
        className="min-h-[40px]"
        classNames={{
          ...classNames,
          label: cn('hidden', classNames?.label),
          input: cn('py-0', classNames?.input)
        }}
        minRows={1}
        placeholder={t('promptPlaceholder')}
        radius="lg"
        variant="bordered"
        {...props}
      />
    )
  }
)

PromptInput.displayName = 'PromptInput'

export default PromptInput
