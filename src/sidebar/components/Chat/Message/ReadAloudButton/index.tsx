import { Icon } from '@iconify/react/dist/iconify.js'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Slider,
  Tooltip
} from '@nextui-org/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import useReadAloud from '@/sidebar/hooks/useReadAloud'

interface ReadAloudButtonProps {
  message: React.ReactNode | string
}

const ReadAloudButton = ({ message }: ReadAloudButtonProps) => {
  const { t } = useTranslation()

  const {
    speaking,
    voice,
    voices,
    volume,
    rate,
    isLoading,
    setVolume,
    setRate,
    setVoiceByName,
    handleReadAloud
  } = useReadAloud(message)

  const transformVoiceName = React.useCallback((voice: chrome.tts.TtsVoice | string): string => {
    const removeGoogle = (name: string) => name.replace('Google', '').trim()
    const toUpperCaseFirstChar = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

    if (typeof voice === 'string') {
      const modifiedVoiceName = removeGoogle(voice)
      return toUpperCaseFirstChar(modifiedVoiceName)
    }
    if (!voice || !voice.voiceName) return ''
    const modifiedVoiceName = removeGoogle(voice.voiceName)
    return toUpperCaseFirstChar(modifiedVoiceName)
  }, [])

  return (
    <Tooltip content={t(speaking ? 'stopButton' : 'readAloud')} placement="bottom">
      <div>
        <Popover placement="bottom">
          <PopoverTrigger>
            <Button isIconOnly radius="full" size="sm" variant="flat">
              <Icon className="text-lg text-default-600" icon="gravity-ui:volume" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex min-w-60 flex-col gap-2 px-1 py-3">
              {voices && (
                <Select
                  items={voices}
                  label={t('readAloudSettings.voiceName')}
                  placeholder={t('readAloudSettings.selectVoice')}
                  labelPlacement="outside"
                  size="sm"
                  classNames={{ value: 'text-xs', trigger: 'min-w-12' }}
                  selectedKeys={[voice?.voiceName || '']}
                  onSelectionChange={(keys) => setVoiceByName(Array.from(keys).join(''))}
                  renderValue={(items) =>
                    items.map((item) => (
                      <span key={item.key}>
                        {item.textValue ? transformVoiceName(item.textValue) : ''}
                      </span>
                    ))
                  }
                >
                  {voices.map((voice, index) => (
                    <SelectItem
                      key={voice.voiceName || index}
                      value={voice.voiceName}
                      textValue={voice.voiceName}
                    >
                      <p className="text-xs">{`${transformVoiceName(voice)} (${voice.lang})`}</p>
                    </SelectItem>
                  ))}
                </Select>
              )}
              <Slider
                label={t('readAloudSettings.rate')}
                size="sm"
                color="foreground"
                showOutline={true}
                minValue={0.1}
                maxValue={2}
                classNames={{
                  label: 'text-xs',
                  value: 'text-xs'
                }}
                step={0.1}
                value={rate}
                onChange={(value) => setRate(Array.isArray(value) ? value[0] : value)}
              />
              <Slider
                label={t('readAloudSettings.volume')}
                size="sm"
                color="foreground"
                showOutline={true}
                minValue={0}
                maxValue={1}
                classNames={{
                  label: 'text-xs',
                  value: 'text-xs'
                }}
                step={0.1}
                value={volume}
                onChange={(value) => setVolume(Array.isArray(value) ? value[0] : value)}
              />
              <div className="flex items-center justify-center">
                <Button
                  isIconOnly
                  isLoading={isLoading}
                  radius="full"
                  size="sm"
                  variant="flat"
                  onPress={speaking ? () => chrome.tts.stop() : handleReadAloud}
                  className="min-w-24"
                >
                  {speaking && !isLoading ? (
                    <Icon className="text-lg text-default-600" icon="solar:stop-bold" />
                  ) : (
                    <Icon className="text-lg text-default-600" icon="solar:play-bold" />
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Tooltip>
  )
}

export default ReadAloudButton