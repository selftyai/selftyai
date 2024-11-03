import { Icon } from '@iconify/react'
import {
  Button,
  Input,
  Spacer,
  useDisclosure,
  Link,
  Modal,
  ModalContent,
  Switch,
  cn
} from '@nextui-org/react'
import React, { memo, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'
import { Integrations } from '@/shared/types/Integrations'

interface ApiConfigurationModelProps extends React.PropsWithChildren {
  integrationName: Integrations
  configureUrl: string
  integration?: Integration
  connected: boolean
  verifyingConnection?: boolean
  canVerifyConnection?: boolean
  verifyConnection?: (apiKey: string) => void
  IntegrationIcon?: React.ReactNode
  active?: boolean
  onActiveToggle?: () => void
}

const ApiConfigurationModel = memo(
  ({
    integrationName,
    integration,
    connected,
    verifyingConnection,
    verifyConnection,
    configureUrl,
    canVerifyConnection = true,
    children,
    IntegrationIcon,
    active,
    onActiveToggle
  }: ApiConfigurationModelProps) => {
    const { isOpen, onOpenChange } = useDisclosure()
    const { t } = useTranslation()

    const [input, setInput] = React.useState('')
    const [showApiKey, setShowApiKey] = React.useState(false)

    useEffect(() => {
      setInput(integration?.apiKey ?? '')
    }, [integration])

    const onSave = async () => {
      if (integration && integration.id) {
        await db.integrations.update(integration.id, { apiKey: input })
      } else {
        await db.integrations.put({
          name: integrationName,
          apiKey: input,
          active: false,
          baseURL: ''
        })
      }

      onOpenChange()
    }

    const onEnableChange = async () => {
      if (integration && integration.id) {
        await db.integrations.update(integration.id, { active: !integration.active })
      }
      onActiveToggle?.()
    }

    const onCancel = () => {
      setInput(integration?.apiKey || '')
      setShowApiKey(false)
      onOpenChange()
    }

    return (
      <div className="inline-flex gap-2">
        <Switch
          size="sm"
          isDisabled={!integration}
          isSelected={active || false}
          onChange={onEnableChange}
        />
        <Button
          size="sm"
          variant="faded"
          onClick={onOpenChange}
          startContent={
            active && (
              <Icon
                icon={connected ? 'akar-icons:circle-check' : 'akar-icons:circle-alert'}
                className={cn('size-3', connected ? 'text-success-500' : 'text-danger-500')}
              />
            )
          }
        >
          {t('settings.plugins.webSearch.tavily.action')}
        </Button>
        {children}

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-2 px-2">
                <div className="flex size-8 items-center justify-center">{IntegrationIcon}</div>
                <span className="text-base font-medium leading-6 text-foreground">
                  {t('settings.integrations.ollama.configurations.title')}
                </span>
              </div>

              <Spacer y={8} />

              <div className="mb-5 flex flex-col gap-2">
                <p className="text-base font-medium text-default-700">
                  {t(`settings.integrations.${integrationName}.apiKey.label`)}
                  <span className="text-red-500">*</span>
                </p>
                <p className="text-sm font-normal text-default-400">
                  <Trans
                    i18nKey={`settings.integrations.${integrationName}.apiKey.description`}
                    components={{
                      Link: (
                        <Link
                          href={configureUrl}
                          target="_blank"
                          className="text-small font-medium text-default-foreground hover:underline"
                        />
                      ),
                      danger: <span className="text-danger" />
                    }}
                  />
                </p>
                <Input
                  className="mt-2"
                  variant="flat"
                  type={showApiKey ? 'text' : 'password'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  endContent={
                    <Button
                      className="bg-default-foreground text-background"
                      radius="md"
                      size="sm"
                      color="secondary"
                      isIconOnly
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      <Icon icon={showApiKey ? 'akar-icons:eye-slashed' : 'akar-icons:eye-open'} />
                    </Button>
                  }
                />

                {canVerifyConnection && (
                  <Button
                    className="max-w-fit bg-default-foreground text-background"
                    radius="md"
                    size="sm"
                    color="secondary"
                    isLoading={verifyingConnection}
                    onClick={() => verifyConnection?.(input)}
                  >
                    {t(`settings.integrations.${integrationName}.apiKey.verify`)}
                  </Button>
                )}

                <div className="ml-auto mt-1 flex flex-row gap-2">
                  <Button radius="md" size="sm" color="default" onClick={onCancel}>
                    {t('cancel')}
                  </Button>
                  <Button
                    className="bg-default-foreground text-background"
                    radius="md"
                    size="sm"
                    color="secondary"
                    isDisabled={
                      !input.length || input === integration?.apiKey || verifyingConnection
                    }
                    onClick={onSave}
                  >
                    {t('save')}
                  </Button>
                </div>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>
    )
  }
)

export default ApiConfigurationModel
