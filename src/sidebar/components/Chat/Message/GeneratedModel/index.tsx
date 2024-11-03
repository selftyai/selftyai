import { Icon } from '@iconify/react'
import { Image, Tooltip } from '@nextui-org/react'

import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'

interface GeneratedModelProps {
  model: Model
}

const GeneratedModel = ({ model }: GeneratedModelProps) => {
  const icons = {
    [Integrations.githubModels]: (
      <Icon className="min-w-6 text-large text-default-500" icon="simple-icons:github" />
    ),
    [Integrations.ollama]: (
      <Icon className="min-w-6 text-large text-default-500" icon="simple-icons:ollama" />
    ),
    [Integrations.groq]: (
      <Image
        src="https://www.google.com/s2/favicons?domain=https://groq.com/&sz=128"
        width={24}
        height={24}
        className="min-w-6"
        fallbackSrc={<Icon className="text-large text-default-500" icon="majesticons:robot-line" />}
      />
    ),
    default: <Icon className="text-large text-default-500" icon="majesticons:robot-line" />
  }

  return (
    <div className="flex items-center space-x-2">
      {icons[model.provider as keyof typeof icons] ?? icons.default}
      <Tooltip content={model.name} placement="top">
        <span className="line-clamp-1">{model.name}</span>
      </Tooltip>
    </div>
  )
}

export default GeneratedModel
