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
  Image,
  cn
} from '@nextui-org/react'
import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'
import { useGroq } from '@/sidebar/providers/GroqProvider'

const ConfigureGroq = () => {
  const { isOpen, onOpenChange } = useDisclosure()
  const { t } = useTranslation()

  const { integration, connected, verifyingConnection, verifyConnection } = useGroq()

  const [input, setInput] = React.useState('')
  const [showApiKey, setShowApiKey] = React.useState(false)

  useEffect(() => {
    setInput(integration?.apiKey || '')
  }, [integration])

  const onSave = async () => {
    if (integration && integration.id) {
      await db.integrations.update(integration.id, { apiKey: input })
    } else {
      await db.integrations.put({
        name: Integrations.groq,
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
  }

  const onCancel = () => {
    setInput(integration?.apiKey || '')
    setShowApiKey(false)
    onOpenChange()
  }

  const content = (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Image
            src="https://www.google.com/s2/favicons?domain=https://groq.com/&sz=128"
            width="32"
            height="32"
          />
        </div>
        <span className="text-base font-medium leading-6 text-foreground">
          {t('settings.integrations.ollama.configurations.title')}
        </span>
      </div>

      <Spacer y={8} />

      <div className="mb-5 flex flex-col gap-2">
        <p className="text-base font-medium text-default-700">
          {t('settings.integrations.groq.apiKey.label')}
          <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          <Trans
            i18nKey="settings.integrations.groq.apiKey.description"
            components={{
              Link: (
                <Link
                  href="https://console.groq.com/keys"
                  target="_blank"
                  className="text-small font-medium text-default-foreground hover:underline"
                />
              )
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

        <Button
          className="max-w-fit bg-default-foreground text-background"
          radius="md"
          size="sm"
          color="secondary"
          isLoading={verifyingConnection}
          onClick={() => verifyConnection(input)}
        >
          {t('settings.integrations.groq.apiKey.verify')}
        </Button>

        <div className="ml-auto mt-1 flex flex-row gap-2">
          <Button radius="md" size="sm" color="default" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            className="bg-default-foreground text-background"
            radius="md"
            size="sm"
            color="secondary"
            isDisabled={!input.length || input === integration?.apiKey || verifyingConnection}
            onClick={onSave}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="inline-flex gap-2">
      <Switch
        size="sm"
        isDisabled={!integration}
        isSelected={integration?.active || false}
        onChange={onEnableChange}
      />
      <Button
        size="sm"
        variant="faded"
        onClick={onOpenChange}
        startContent={
          integration?.active && (
            <Icon
              icon={connected ? 'akar-icons:circle-check' : 'akar-icons:circle-alert'}
              className={cn('size-3', connected ? 'text-success-500' : 'text-danger-500')}
            />
          )
        }
      >
        {t('settings.plugins.webSearch.tavily.action')}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </div>
  )
}

export default ConfigureGroq
