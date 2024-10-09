import { Link, Chip, Image } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import aimlapiLogo from '@/sidebar/assets/aimlapi-logo.jpeg'
import groqLogo from '@/sidebar/assets/groq-logo.png'
import lmStudioLogo from '@/sidebar/assets/lm-studio-logo.png'
import IntegrationItem from '@/sidebar/components/Settings/Integrations/IntegrationItem'
import ConfigureOllama from '@/sidebar/components/Settings/Integrations/Ollama/ConfigureOllama'

interface AppearanceSettingCardProps {
  className?: string
}

const Integrations = ({ className, ...props }: AppearanceSettingCardProps) => {
  const { theme } = useTheme()

  const integrations = [
    {
      id: 'ollama',
      title: 'Ollama',
      subTitle: (
        <Link href="https://ollama.com" target="_blank">
          ollama.com
        </Link>
      ),
      description: 'Generate AI responses with your own models based on Ollama.',
      icon: 'simple-icons:ollama',
      actionButtons: <ConfigureOllama />
    },
    {
      id: 'groq',
      title: 'Groq',
      subTitle: (
        <Link href="https://groq.com/" target="_blank">
          groq.com
        </Link>
      ),
      description: 'Generate AI responses with Groq. Use your API key to get started.',
      icon: <Image src={groqLogo} width="32" height="32" />,
      actionButtons: (
        <Chip color="secondary" variant="dot">
          Coming soon
        </Chip>
      )
    },
    {
      id: 'lmstudion',
      title: 'LM Studio',
      subTitle: (
        <Link href="https://lmstudio.ai/" target="_blank">
          lmstudio.ai
        </Link>
      ),
      description: 'Generate AI responses with your own models based on LM Studio.',
      icon: <Image src={lmStudioLogo} width="32" height="32" />,
      actionButtons: (
        <Chip color="secondary" variant="dot">
          Coming soon
        </Chip>
      )
    },
    {
      id: 'aimlapi',
      title: 'AI/ML API',
      subTitle: (
        <Link href="https://aimlapi.com/" target="_blank">
          aimlapi.com
        </Link>
      ),
      description: 'Generate AI responses with AI/ML. Use your API key to get started.',
      icon: <Image src={aimlapiLogo} width="32" height="32" />,
      actionButtons: (
        <Chip color="secondary" variant="dot">
          Coming soon
        </Chip>
      )
    },
    {
      id: 'openai',
      title: 'OpenAI',
      subTitle: (
        <Link href="https://platform.openai.com/" target="_blank">
          platform.openai.com
        </Link>
      ),
      description: 'Generate AI responses with OpenAI. Use your API key to get started.',
      icon: 'simple-icons:openai',
      actionButtons: (
        <Chip color="secondary" variant="dot">
          Coming soon
        </Chip>
      )
    },
    {
      id: 'anthropic',
      title: 'Anthropic',
      subTitle: (
        <Link href="https://www.anthropic.com/api" target="_blank">
          anthropic.com/api
        </Link>
      ),
      description: 'Generate AI responses with Anthropic. Use your API key to get started.',
      icon: 'simple-icons:anthropic',
      actionButtons: (
        <Chip color="secondary" variant="dot">
          Coming soon
        </Chip>
      )
    }
  ]

  return (
    <OverlayScrollbarsComponent
      className={cn('p-2', className)}
      options={{
        scrollbars: {
          autoHide: 'scroll',
          theme: theme?.includes('dark') ? 'os-theme-light' : 'os-theme-dark'
        },
        overflow: { x: 'hidden', y: 'scroll' }
      }}
      defer
      {...props}
    >
      <div className="flex flex-row flex-wrap gap-3 sm:gap-2 md:gap-4">
        {integrations.map((integration) => (
          <IntegrationItem key={integration.id} {...integration} />
        ))}
      </div>
    </OverlayScrollbarsComponent>
  )
}

Integrations.displayName = 'Integrations'

export default Integrations
