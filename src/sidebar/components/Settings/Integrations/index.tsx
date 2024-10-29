import { Link, Chip, Image } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useTranslation } from 'react-i18next'

import aimlapiLogo from '@/sidebar/assets/aimlapi-logo.jpeg'
import lmStudioLogo from '@/sidebar/assets/lm-studio-logo.png'
import ConfigureGroq from '@/sidebar/components/Settings/Integrations/Groq'
import IntegrationItem from '@/sidebar/components/Settings/Integrations/IntegrationItem'
import ConfigureOllama from '@/sidebar/components/Settings/Integrations/Ollama/ConfigureOllama'
import { useTheme } from '@/sidebar/providers/ThemeProvider'

interface IntegrationsProps {
  className?: string
}

const Integrations = ({ className, ...props }: IntegrationsProps) => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const integrations = [
    {
      id: 'ollama',
      title: t('settings.integrations.ollama.title'),
      subTitle: (
        <Link href="https://ollama.com" target="_blank">
          {t('settings.integrations.ollama.website')}
        </Link>
      ),
      description: t('settings.integrations.ollama.description'),
      icon: 'simple-icons:ollama',
      actionButtons: <ConfigureOllama />
    },
    {
      id: 'groq',
      title: t('settings.integrations.groq.title'),
      subTitle: (
        <Link href="https://groq.com/" target="_blank">
          {t('settings.integrations.groq.website')}
        </Link>
      ),
      description: t('settings.integrations.groq.description'),
      icon: (
        <Image
          src="https://www.google.com/s2/favicons?domain=https://groq.com/&sz=128"
          width="32"
          height="32"
        />
      ),
      actionButtons: <ConfigureGroq />
    },
    {
      id: 'lmStudio',
      title: t('settings.integrations.lmStudio.title'),
      subTitle: (
        <Link href="https://lmstudio.ai/" target="_blank">
          {t('settings.integrations.lmStudio.website')}
        </Link>
      ),
      description: t('settings.integrations.lmStudio.description'),
      icon: <Image src={lmStudioLogo} width="32" height="32" />,
      actionButtons: (
        <Chip color="secondary" variant="dot">
          {t('comingSoon')}
        </Chip>
      )
    },
    {
      id: 'aimlapi',
      title: t('settings.integrations.aimlapi.title'),
      subTitle: (
        <Link href="https://aimlapi.com/" target="_blank">
          {t('settings.integrations.aimlapi.website')}
        </Link>
      ),
      description: t('settings.integrations.aimlapi.description'),
      icon: <Image src={aimlapiLogo} width="32" height="32" />,
      actionButtons: (
        <Chip color="secondary" variant="dot">
          {t('comingSoon')}
        </Chip>
      )
    },
    {
      id: 'openai',
      title: t('settings.integrations.openai.title'),
      subTitle: (
        <Link href="https://platform.openai.com/" target="_blank">
          {t('settings.integrations.openai.website')}
        </Link>
      ),
      description: t('settings.integrations.openai.description'),
      icon: 'simple-icons:openai',
      actionButtons: (
        <Chip color="secondary" variant="dot">
          {t('comingSoon')}
        </Chip>
      )
    },
    {
      id: 'anthropic',
      title: t('settings.integrations.anthropic.title'),
      subTitle: (
        <Link href="https://www.anthropic.com/api" target="_blank">
          {t('settings.integrations.anthropic.website')}
        </Link>
      ),
      description: t('settings.integrations.anthropic.description'),
      icon: 'simple-icons:anthropic',
      actionButtons: (
        <Chip color="secondary" variant="dot">
          {t('comingSoon')}
        </Chip>
      )
    }
  ]

  return (
    <OverlayScrollbarsComponent
      className={cn('max-h-[75dvh] px-2', className)}
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
