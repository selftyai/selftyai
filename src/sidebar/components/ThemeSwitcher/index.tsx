import type { RadioProps } from '@nextui-org/react'
import { Image, useRadio, VisuallyHidden } from '@nextui-org/react'
import { cn } from '@nextui-org/react'

import darkTheme from '@/shared/assets/dark-theme.svg'
import lightTheme from '@/shared/assets/light-theme.svg'

interface ThemeCustomRadioProps extends RadioProps {
  variant: 'light' | 'dark'
}

export const ThemeCustomRadio = (props: ThemeCustomRadioProps) => {
  const { variant } = props
  const {
    Component,
    children,
    description,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getControlProps
  } = useRadio(props)
  const wrapperProps = getWrapperProps()

  const themeVariant = {
    light: lightTheme,
    dark: darkTheme
  }

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        'group inline-flex flex-row-reverse justify-between overflow-visible hover:bg-content2',
        'max-w-[300px] cursor-pointer gap-4 rounded-large border-1 border-default-200 px-4 py-2.5 shadow-md',
        'relative h-[132px] flex-1 basis-1/2 overflow-hidden'
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span
        {...getWrapperProps()}
        className={cn(
          wrapperProps['className'],
          'border-2 border-default',
          'group-data-[selected=true]:border-default-foreground'
        )}
      >
        <span
          {...getControlProps()}
          className={cn(
            'z-10 h-2 w-2 origin-center scale-0 rounded-full bg-default-foreground text-primary-foreground opacity-0 transition-transform-opacity group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100 motion-reduce:transition-none'
          )}
        />
      </span>
      <div {...getLabelWrapperProps()}>
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-foreground opacity-70">{description}</span>
        )}
      </div>
      <div className="absolute left-[32px] top-[37px]">
        <Image src={themeVariant[variant]} />
      </div>
    </Component>
  )
}
