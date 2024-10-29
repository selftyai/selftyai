import type { SwitchProps } from '@nextui-org/react'
import { cn, useSwitch, VisuallyHidden } from '@nextui-org/react'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomSwitchProps extends SwitchProps {
  label: string
  description?: string
  children?: React.ReactNode
}

/**
 * CustomSwitch component is a customizable switch component that can be used to toggle between two states.
 * It supports additional labels, descriptions, and children components that can be displayed when the switch is selected.
 *
 * @param {string} label - The label text to display next to the switch.
 * @param {string} [description] - An optional description text to display below the label.
 * @param {React.ReactNode} [children] - Optional children components to display when the switch is selected.
 * @param {SwitchProps} switchProps - Additional properties to pass to the switch component.
 *
 * @returns {JSX.Element} The rendered CustomSwitch component.
 */
const CustomSwitch = ({ label, description, children, ...switchProps }: CustomSwitchProps) => {
  const {
    Component,
    getBaseProps,
    getInputProps,
    getWrapperProps,
    getThumbProps,
    isSelected,
    slots
  } = useSwitch(switchProps)

  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col overflow-hidden rounded-lg border-2 border-transparent bg-content1 shadow-md',
        isSelected && 'border-2 border-foreground'
      )}
    >
      <Component
        {...getBaseProps()}
        className={slots.base({
          class: cn(
            'flex w-full max-w-full flex-col gap-2 rounded-lg hover:bg-content2',
            'cursor-pointer justify-between gap-2 p-4 data-[selected=true]:shadow-md max-[480px]:p-3'
          )
        })}
      >
        <div className="inline-flex w-full flex-row items-center justify-between max-[480px]:flex-wrap">
          <div className="flex flex-col gap-1">
            <p className="text-medium max-[480px]:text-sm">{label}</p>
            {description && <p className="text-tiny text-default-400">{description}</p>}
          </div>
          <div
            {...getWrapperProps()}
            className={slots.wrapper({
              class: 'mt-3 h-4 overflow-visible p-0 group-data-[selected=true]:bg-foreground'
            })}
          >
            <div
              {...getThumbProps()}
              className={slots.thumb({
                class: cn(
                  'h-6 w-6 border-2 bg-content1 shadow-lg',
                  'group-data-[hover=true]:bg-content2',
                  // selected
                  'group-data-[selected=true]:ml-6',
                  // pressed
                  'group-data-[pressed=true]:w-7',
                  'group-data-[selected]:group-data-[pressed]:ml-4'
                )
              })}
            />
          </div>
          <VisuallyHidden>
            <input {...getInputProps()} />
          </VisuallyHidden>
        </div>
      </Component>

      {children && (
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              <div className="p-4 max-[480px]:p-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default CustomSwitch
