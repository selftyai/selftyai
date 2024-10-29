import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Switch, Textarea, Tooltip } from '@nextui-org/react'
import { useLiveQuery } from 'dexie-react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import CustomSwitch from '@/sidebar/components/CustomSwitch'
import { useChat } from '@/sidebar/providers/ChatProvider'

const UseCustomPromptsSetting = () => {
  const { t } = useTranslation()
  const { defaultMessageWithContext, defaultMessageWithoutContext } = useChat()
  const [textAreaPrompt, setTextAreaPrompt] = React.useState<string>('')
  const [isMessageWithContextSwitch, setIsMessageWithContextSwitch] = React.useState<boolean>()

  const [isButtonsDisabled, setIsButtonsDisabled] = React.useState<boolean>(true)
  const [validationMessage, setValidationMessage] = React.useState<string>('')
  const [isUseCustomPromptsSwitch, setIsUseCustomPromptsSwitch] = React.useState<boolean>()

  const promptSchemaWithContext = React.useMemo(
    () =>
      z
        .string()
        .min(1, { message: t('settings.general.isUsingDefaultPrompt.errors.promptEmpty') })
        .regex(
          /(<context>[^]*<\/context>[^]*<message>[^]*<\/message>)|(<message>[^]*<\/message>[^]*<context>[^]*<\/context>)/,
          {
            message: t('settings.general.isUsingDefaultPrompt.errors.promptWithContext')
          }
        ),
    [t]
  )

  const promptSchemaWithoutContext = React.useMemo(
    () =>
      z
        .string()
        .min(1, { message: t('settings.general.isUsingDefaultPrompt.errors.promptEmpty') })
        .regex(/<message>[^]*<\/message>/, {
          message: t('settings.general.isUsingDefaultPrompt.errors.promptWithoutContext')
        }),
    [t]
  )

  const customPromptWithContext = useLiveQuery(
    () => db.settings.get(SettingsKeys.customPromptWithContext),
    []
  )

  const customPromptWithoutContext = useLiveQuery(
    () => db.settings.get(SettingsKeys.customPromptWithoutContext),
    []
  )

  const isContextEnabled = useLiveQuery(
    () => db.settings.get(SettingsKeys.isContextInPromptEnabled),
    []
  )

  React.useEffect(() => {
    const prompt = isMessageWithContextSwitch
      ? customPromptWithContext?.value !== undefined && customPromptWithContext?.value !== ''
        ? customPromptWithContext.value
        : defaultMessageWithContext
      : customPromptWithoutContext?.value !== undefined && customPromptWithoutContext?.value !== ''
        ? customPromptWithoutContext.value
        : defaultMessageWithoutContext

    setTextAreaPrompt(prompt)
  }, [
    customPromptWithContext,
    customPromptWithoutContext,
    defaultMessageWithContext,
    defaultMessageWithoutContext,
    isMessageWithContextSwitch
  ])

  const validatePrompt = React.useCallback(() => {
    const promptSchema = isMessageWithContextSwitch
      ? promptSchemaWithContext
      : promptSchemaWithoutContext

    try {
      promptSchema.parse(textAreaPrompt)
      setValidationMessage('')
      return true
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        setValidationMessage(e.errors[0].message)
      }
      setIsButtonsDisabled(true)
      return false
    }
  }, [
    isMessageWithContextSwitch,
    promptSchemaWithContext,
    promptSchemaWithoutContext,
    textAreaPrompt
  ])

  // useEffect for dynamic disable  buttons
  React.useEffect(() => {
    const basePrompt = isMessageWithContextSwitch
      ? defaultMessageWithContext
      : defaultMessageWithoutContext

    setIsButtonsDisabled(textAreaPrompt === basePrompt)
  }, [
    textAreaPrompt,
    isMessageWithContextSwitch,
    defaultMessageWithContext,
    defaultMessageWithoutContext
  ])

  React.useEffect(() => {
    setIsMessageWithContextSwitch(isContextEnabled?.value === 'true')
  }, [isContextEnabled?.value])

  React.useEffect(() => {
    setIsUseCustomPromptsSwitch(
      !!(customPromptWithContext?.value && customPromptWithContext.value !== '') ||
        !!(customPromptWithoutContext?.value && customPromptWithoutContext.value !== '')
    )
  }, [customPromptWithContext, customPromptWithoutContext])

  const handleResetPrompt = React.useCallback(() => {
    const key = isMessageWithContextSwitch
      ? SettingsKeys.customPromptWithContext
      : SettingsKeys.customPromptWithoutContext
    db.settings.put({ key, value: '' })
    toast.success(t('settings.general.toasts.reseted'))
  }, [isMessageWithContextSwitch, t])

  const handleSaveCustomPrompt = React.useCallback(() => {
    if (!validatePrompt()) return
    const key = isMessageWithContextSwitch
      ? SettingsKeys.customPromptWithContext
      : SettingsKeys.customPromptWithoutContext
    db.settings.put({ key, value: textAreaPrompt })
    toast.success(t('settings.general.toasts.saved'))
  }, [isMessageWithContextSwitch, textAreaPrompt, validatePrompt, t])

  return (
    <CustomSwitch
      label={t('settings.general.isUsingDefaultPrompt.label')}
      description={t('settings.general.isUsingDefaultPrompt.description')}
      isSelected={isUseCustomPromptsSwitch}
      onChange={(e) => setIsUseCustomPromptsSwitch(e.target.checked)}
    >
      <Textarea
        className="w-full rounded"
        placeholder={t('settings.general.isUsingDefaultPrompt.placeholder')}
        value={textAreaPrompt}
        onChange={(e) => setTextAreaPrompt(e.target.value)}
        errorMessage={validationMessage}
        isInvalid={!!validationMessage}
      />
      <Switch
        size="sm"
        color="default"
        className="mt-4"
        isSelected={isMessageWithContextSwitch}
        onChange={(e) => setIsMessageWithContextSwitch(e.target.checked)}
      >
        <Tooltip
          content={t('settings.general.isUsingDefaultPrompt.promptWithContextSwitch.tooltip')}
          offset={15}
        >
          <div className="flex items-center gap-2 text-xs">
            {t('settings.general.isUsingDefaultPrompt.promptWithContextSwitch.label')}
          </div>
        </Tooltip>
      </Switch>

      <div className="mt-2 flex items-center justify-between gap-2">
        <Tooltip content={t('settings.general.isUsingDefaultPrompt.tooltip')} className="max-w-md">
          <Icon icon="lucide:info" className="h-5 w-5" />
        </Tooltip>
        <div className="flex gap-2">
          <Button
            variant="light"
            onClick={handleResetPrompt}
            isDisabled={isButtonsDisabled}
            className="max-[480px]:h-8 max-[480px]:px-3 max-[480px]:text-sm"
          >
            {t('reset')}
          </Button>
          <Button
            color="primary"
            variant="light"
            onClick={handleSaveCustomPrompt}
            isDisabled={isButtonsDisabled}
            className="max-[480px]:h-8 max-[480px]:px-3 max-[480px]:text-sm"
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </CustomSwitch>
  )
}

export default UseCustomPromptsSetting
