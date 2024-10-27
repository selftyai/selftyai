import { Icon } from '@iconify/react'
import {
  Button,
  Input,
  Spacer,
  useDisclosure,
  Image,
  Link,
  Modal,
  ModalContent,
  Switch
} from '@nextui-org/react'
import { useLiveQuery } from 'dexie-react-hooks'
import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'

const TavilyPluginConfiguration = () => {
  const { isOpen, onOpenChange } = useDisclosure()
  const { t } = useTranslation()

  const tavilyIntegration = useLiveQuery(
    () => db.integrations.where({ name: Integrations.tavily }).first(),
    []
  )

  const [input, setInput] = React.useState('')
  const [showApiKey, setShowApiKey] = React.useState(false)

  useEffect(() => {
    setInput(tavilyIntegration?.apiKey || '')
  }, [tavilyIntegration])

  const onSave = async () => {
    if (!tavilyIntegration) {
      await db.integrations.add({
        name: Integrations.tavily,
        apiKey: input,
        baseURL: '',
        active: false
      })
    }

    if (tavilyIntegration?.id) {
      await db.integrations.update(tavilyIntegration.id, { apiKey: input })
    }

    onOpenChange()
  }

  const onEnableChange = async () => {
    if (!tavilyIntegration) {
      await db.integrations.add({
        name: Integrations.tavily,
        apiKey: '',
        baseURL: '',
        active: true
      })
    }

    if (tavilyIntegration?.id) {
      await db.integrations.update(tavilyIntegration.id, { active: !tavilyIntegration.active })
    }
  }

  const onCancel = () => {
    setInput(tavilyIntegration?.apiKey || '')
    setShowApiKey(false)
    onOpenChange()
  }

  const content = (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Image
            src="https://www.google.com/s2/favicons?domain=https://tavily.com/&sz=128"
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
          {t('settings.plugins.webSearch.tavily.apiKey.label')}
          <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          <Trans
            i18nKey="settings.plugins.webSearch.tavily.apiKey.description"
            components={{
              Link: (
                <Link
                  href="https://tavily.com/"
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

        <div className="ml-auto mt-1 flex flex-row gap-2">
          <Button radius="md" size="sm" color="default" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            className="bg-default-foreground text-background"
            radius="md"
            size="sm"
            color="secondary"
            isDisabled={!input.length || input === tavilyIntegration?.apiKey}
            onClick={onSave}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-row-reverse gap-2 sm:flex-row">
      <Button size="sm" variant="faded" onClick={onOpenChange}>
        {t('settings.plugins.webSearch.tavily.action')}
      </Button>
      <Switch
        size="sm"
        isDisabled={!tavilyIntegration}
        isSelected={tavilyIntegration?.active || false}
        onChange={onEnableChange}
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </div>
  )
}

export default TavilyPluginConfiguration
