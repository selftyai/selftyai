import { Icon } from '@iconify/react'
import {
  Button,
  Input,
  Spacer,
  useDisclosure,
  cn,
  Avatar,
  Link,
  Modal,
  ModalContent,
  Switch
} from '@nextui-org/react'
import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ConfigureOllamaModels from '@/sidebar/components/Settings/Integrations/Ollama/ConfigureOllamaModels'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const ConfigureOllama = () => {
  const { isOpen, onOpenChange } = useDisclosure()
  const { t } = useTranslation()

  const {
    pullingModels,
    integration,
    connected,
    verifyingConnection,
    toggleOllama,
    verifyConnection,
    changeBaseURL
  } = useOllama()

  const [input, setInput] = React.useState(integration?.baseURL || '')

  useEffect(() => {
    setInput(integration?.baseURL || '')
  }, [integration])

  const content = (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Avatar
            className="bg-content2"
            icon={<Icon width="32" height="32" icon="simple-icons:ollama" />}
          />
        </div>
        <span className="text-base font-medium leading-6 text-foreground">
          {t('settings.integrations.ollama.configurations.title')}
        </span>
      </div>

      <Spacer y={8} />

      <div className="mb-2 flex flex-col gap-3">
        <div className="relative w-full rounded-medium border border-warning-100 bg-content2 bg-warning-100/50 px-4 py-3 text-foreground">
          <Trans
            i18nKey="settings.integrations.ollama.corsTopic"
            components={{
              Link: (
                <Link
                  href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
                  target="_blank"
                  className="text-xs font-medium text-default-foreground hover:underline"
                />
              )
            }}
          />
        </div>

        <div className="relative w-full rounded-medium border border-default-100 bg-content2 bg-default-100/50 px-4 py-3 text-foreground">
          <Trans
            i18nKey="settings.integrations.ollama.modelsLocationTopic"
            components={{
              Link: (
                <Link
                  href="https://dev.to/hamed0406/how-to-change-place-of-saving-models-on-ollama-4ko8"
                  target="_blank"
                  className="text-xs font-medium text-default-foreground hover:underline"
                />
              )
            }}
          />
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2">
        <p className="text-base font-medium text-default-700">
          {t('settings.integrations.ollama.configurations.baseURL.label')}
          <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          <Trans
            i18nKey="settings.integrations.ollama.configurations.baseURL.description"
            components={{
              strong: <span className="text-default-700" />
            }}
          />
        </p>
        <Input
          className="mt-2"
          variant="flat"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          defaultValue={integration?.baseURL}
          placeholder=""
          validate={(value) => {
            if (!value) {
              return t('settings.integrations.ollama.configurations.baseURL.required')
            }
            return ''
          }}
          endContent={
            <Button
              className="bg-default-foreground text-background"
              radius="md"
              size="sm"
              color="secondary"
              isDisabled={!input.length || input === integration?.baseURL}
              onClick={() => verifyConnection(input)}
              isLoading={verifyingConnection}
            >
              {t('settings.integrations.ollama.configurations.verify')}
            </Button>
          }
        />

        <div className="ml-auto mt-1 flex flex-row gap-2">
          <Button radius="md" size="sm" color="default" onClick={onOpenChange}>
            {t('cancel')}
          </Button>
          <Button
            className="bg-default-foreground text-background"
            radius="md"
            size="sm"
            color="secondary"
            isDisabled={!!pullingModels?.length || input === integration?.baseURL || !input.length}
            onClick={() => {
              onOpenChange()
              changeBaseURL(input)
            }}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex flex-row gap-2">
        <Switch isSelected={integration?.active} onValueChange={toggleOllama} size="sm" />
        {integration?.active && (
          <React.Fragment>
            <Button size="sm" variant="faded" onClick={onOpenChange}>
              <Icon
                icon={connected ? 'akar-icons:circle-check' : 'akar-icons:circle-alert'}
                className={cn('size-3', connected ? 'text-success-500' : 'text-danger-500')}
              />
              {t('configure')}
            </Button>
            {connected && <ConfigureOllamaModels />}
          </React.Fragment>
        )}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
  )
}

export default ConfigureOllama
