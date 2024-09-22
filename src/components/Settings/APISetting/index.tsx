import { Button, Input, Spacer } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import * as React from 'react'

interface ProfileSettingCardProps {
  className?: string
}

const ProfileSetting = React.forwardRef<HTMLDivElement, ProfileSettingCardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-2', className)} {...props}>
      <div>
        <p className="text-base font-medium text-default-700">Groq API</p>
        <p className="mt-1 text-sm font-normal text-default-400">
          Set your groq api key to be able to use their models.
        </p>
        <Input className="mt-2" placeholder="" />
      </div>
      <Spacer y={2} />
      <div>
        <p className="text-base font-medium text-default-700">AIMLAPI API</p>
        <p className="mt-1 text-sm font-normal text-default-400">
          Set your AIMLAPI api key to be able to use their models.
        </p>
        <Input className="mt-2" placeholder="" />
      </div>
      <Button className="mt-4 bg-default-foreground text-background" size="sm">
        Save
      </Button>
    </div>
  )
)

ProfileSetting.displayName = 'ProfileSetting'

export default ProfileSetting
