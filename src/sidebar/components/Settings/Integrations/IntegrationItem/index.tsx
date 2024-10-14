import { Icon } from '@iconify/react'
import type { CardProps } from '@nextui-org/react'
import { Card, CardBody, CardFooter, Avatar } from '@nextui-org/react'

interface IntegrationItemProps extends CardProps {
  title: string
  description: string
  subTitle?: string | React.ReactNode
  icon: string | React.ReactNode
  actionButtons: React.ReactNode
}

const IntegrationItem = ({
  title,
  description,
  icon,
  actionButtons,
  subTitle,
  ...props
}: IntegrationItemProps) => {
  return (
    <Card
      className="w-full border-small border-default-100 p-3 sm:max-w-[41dvw] lg:max-w-[320px]"
      shadow="sm"
      {...props}
    >
      <CardBody className="px-4 pb-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex max-w-[80%] flex-col gap-1">
            <p className="text-medium font-medium">{title}</p>
            {subTitle && <p className="truncate text-small text-default-500">{subTitle}</p>}
          </div>
          <Avatar
            className="bg-content2"
            icon={typeof icon === 'string' ? <Icon width="32" height="32" icon={icon} /> : icon}
          />
        </div>
        <p className="pt-4 text-small text-default-500">{description}</p>
      </CardBody>
      <CardFooter className="justify-between gap-2">
        {actionButtons}
        {/* <Button size="sm" variant="faded">
          Configure
        </Button>
        <Chip color="primary" variant="dot">
          Typescript
        </Chip> */}
      </CardFooter>
    </Card>
  )
}

export default IntegrationItem
