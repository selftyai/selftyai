import type { SwitchProps } from '@nextui-org/react'
import { cn, Switch } from '@nextui-org/react'

interface CustomSwitchProps extends SwitchProps {
  label: string
  description?: string
}

const CustomSwitch = ({ label, description, ...switchProps }: CustomSwitchProps) => {
  return (
    <Switch
      {...switchProps}
      classNames={{
        base: cn(
          'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',
          'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
          'data-[selected=true]:border-foreground shadow-md'
        ),
        wrapper: 'p-0 h-4 overflow-visible group-data-[selected=true]:bg-foreground',
        thumb: cn(
          'w-6 h-6 border-2 shadow-lg bg-content1',
          'group-data-[hover=true]:bg-content2',
          //selected
          'group-data-[selected=true]:ml-6',
          // pressed
          'group-data-[pressed=true]:w-7',
          'group-data-[selected]:group-data-[pressed]:ml-4'
        )
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-medium">{label}</p>
        {description && <p className="text-tiny text-default-400">{description}</p>}
      </div>
    </Switch>
  )
}

export default CustomSwitch
