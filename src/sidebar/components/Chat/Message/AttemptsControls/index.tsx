import { Icon } from '@iconify/react'
import { Button, cn } from '@nextui-org/react'

interface AttemptsControlsProps {
  attempts: number
  currentAttempt: number
  onAttemptChange?: (attempt: number) => void
  className?: string
}

const AttemptsControls = ({
  attempts,
  currentAttempt,
  onAttemptChange,
  className
}: AttemptsControlsProps) => (
  <div className={cn('flex items-center', className)}>
    <Button
      isIconOnly
      radius="sm"
      size="sm"
      variant="ghost"
      className="border-0 ring-0"
      isDisabled={currentAttempt === 1}
      onPress={() => onAttemptChange?.(currentAttempt > 1 ? currentAttempt - 1 : 1)}
    >
      <Icon className="text-small text-default-600" icon="akar-icons:chevron-left" />
    </Button>
    <p className="px-1 text-small font-medium text-default-500">
      {currentAttempt}/{attempts}
    </p>
    <Button
      isIconOnly
      radius="sm"
      size="sm"
      variant="ghost"
      className="border-0 ring-0"
      isDisabled={currentAttempt === attempts}
      onPress={() => onAttemptChange?.(currentAttempt < attempts ? currentAttempt + 1 : attempts)}
    >
      <Icon className="text-small text-default-600" icon="akar-icons:chevron-right" />
    </Button>
  </div>
)

export default AttemptsControls
