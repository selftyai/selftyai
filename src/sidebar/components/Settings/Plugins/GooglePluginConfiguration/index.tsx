import { Icon } from '@iconify/react'
import {
  Button,
  Input,
  Spacer,
  useDisclosure,
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

const GooglePluginConfiguration = () => {
  const { isOpen, onOpenChange } = useDisclosure()
  const { t } = useTranslation()

  const googleIntegration = useLiveQuery(
    () => db.integrations.where({ name: Integrations.google }).first(),
    []
  )

  const [input, setInput] = React.useState('')
  const [searchEngine, setSearchEngine] = React.useState('')
  const [showApiKey, setShowApiKey] = React.useState(false)

  useEffect(() => {
    setInput(googleIntegration?.apiKey || '')
    setSearchEngine(googleIntegration?.baseURL || '')
  }, [googleIntegration])

  const onSave = async () => {
    if (!googleIntegration) {
      await db.integrations.add({
        name: Integrations.google,
        apiKey: input,
        baseURL: searchEngine,
        active: false
      })
    }

    if (googleIntegration?.id) {
      await db.integrations.update(googleIntegration.id, { apiKey: input, baseURL: searchEngine })
    }

    onOpenChange()
  }

  const onEnableChange = async () => {
    if (!googleIntegration) {
      await db.integrations.add({
        name: Integrations.google,
        apiKey: '',
        baseURL: '',
        active: true
      })
    }

    if (googleIntegration?.id) {
      await db.integrations.update(googleIntegration.id, { active: !googleIntegration.active })
    }
  }

  const onCancel = () => {
    setInput(googleIntegration?.apiKey || '')
    setSearchEngine(googleIntegration?.baseURL || '')
    setShowApiKey(false)
    onOpenChange()
  }

  const content = (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Icon icon="logos:google-icon" className="h-8 w-8" />
        </div>
        <span className="text-base font-medium leading-6 text-foreground">
          {t('settings.integrations.ollama.configurations.title')}
        </span>
      </div>

      <Spacer y={8} />

      <div className="mb-5 flex flex-col gap-2">
        <p className="text-base font-medium text-default-700">
          {t('settings.plugins.webSearch.google.searchEngineId.label')}
          <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          <Trans
            i18nKey="settings.plugins.webSearch.google.searchEngineId.description"
            components={{
              Link: (
                <Link
                  href="https://programmablesearchengine.google.com/controlpanel/create"
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
          value={searchEngine}
          onChange={(e) => setSearchEngine(e.target.value)}
        />

        <Spacer y={2} />

        <p className="text-base font-medium text-default-700">
          {t('settings.plugins.webSearch.google.apiKey.label')}
          <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          <Trans
            i18nKey="settings.plugins.webSearch.google.apiKey.description"
            components={{
              Link: (
                <Link
                  href="https://developers.google.com/custom-search/v1/introduction"
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
            isDisabled={!input.length || input === googleIntegration?.apiKey || !searchEngine}
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
        isDisabled={!googleIntegration}
        isSelected={googleIntegration?.active || false}
        onChange={onEnableChange}
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </div>
  )
}

export default GooglePluginConfiguration
