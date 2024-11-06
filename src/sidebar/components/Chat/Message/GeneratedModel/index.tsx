import { Icon } from '@iconify/react'
import { Badge, Avatar } from '@nextui-org/react'

import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'

interface GeneratedModelProps {
  model: Model
  showBadge?: boolean
}

const GeneratedModel = ({ model, showBadge }: GeneratedModelProps) => {
  const icons = {
    [Integrations.githubModels]: (
      <Avatar
        size="sm"
        isBordered
        className="h-4 w-4"
        icon={<Icon className="text-large" icon="simple-icons:github" />}
      />
    ),
    [Integrations.ollama]: (
      <Avatar
        isBordered
        className="h-4 w-4"
        size="sm"
        icon={<Icon className="text-large" icon="simple-icons:ollama" />}
      />
    ),
    [Integrations.groq]: (
      <Avatar
        isBordered
        size="sm"
        className="h-4 w-4"
        src="https://www.google.com/s2/favicons?domain=https://groq.com/&sz=128"
        fallback={<Icon className="text-large" icon="majesticons:robot-line" />}
      />
    ),
    default: (
      <Avatar
        isBordered
        className="h-4 w-4"
        size="sm"
        icon={<Icon className="text-large" icon="majesticons:robot-line" />}
      />
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge
        isOneChar
        color="danger"
        content={<Icon className="text-background" icon="gravity-ui:circle-exclamation-fill" />}
        isInvisible={!showBadge}
        placement="bottom-right"
        shape="circle"
      >
        {icons[model.provider as keyof typeof icons] ?? icons.default}
      </Badge>

      <span className="line-clamp-1 text-small font-medium">{model.name}</span>
    </div>
  )
}

export default GeneratedModel
