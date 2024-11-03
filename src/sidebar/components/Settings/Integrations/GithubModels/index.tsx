import { Icon } from '@iconify/react'

import { Integrations } from '@/shared/types/Integrations'
import ApiConfigurationModel from '@/sidebar/components/Settings/Integrations/ApiConfigurationModal'
import { useGithubStore } from '@/sidebar/stores/githubStore'

const ConfigureGithubModels = () => {
  const { apiKey, integration, active, setActive } = useGithubStore()

  return (
    <ApiConfigurationModel
      integration={integration}
      integrationName={Integrations.githubModels}
      configureUrl="https://github.com/settings/tokens"
      connected={apiKey !== ''}
      active={active}
      canVerifyConnection={false}
      IntegrationIcon={<Icon icon="simple-icons:github" width="32" height="32" />}
      onActiveToggle={setActive}
    />
  )
}

export default ConfigureGithubModels
