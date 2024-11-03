import { Image } from '@nextui-org/react'

import { Integrations } from '@/shared/types/Integrations'
import ApiConfigurationModel from '@/sidebar/components/Settings/Integrations/ApiConfigurationModal'
import { useGroqStore } from '@/sidebar/stores/groqStore'

const ConfigureGroq = () => {
  const { integration, active, connected, verifyingConnection, verifyConnection, setActive } =
    useGroqStore()

  return (
    <ApiConfigurationModel
      integration={integration}
      integrationName={Integrations.groq}
      configureUrl="https://console.groq.com/keys"
      connected={connected}
      active={active}
      verifyConnection={verifyConnection}
      verifyingConnection={verifyingConnection}
      IntegrationIcon={
        <Image
          src="https://www.google.com/s2/favicons?domain=https://groq.com/&sz=128"
          width="32"
          height="32"
        />
      }
      onActiveToggle={setActive}
    />
  )
}

export default ConfigureGroq
