import React from 'react'

import logger from '@/shared/logger'
import { removeMarkdownSymbols } from '@/sidebar/utils/parseMessage'

const SPEAK_ATTEMPTS = 3
const SPEAK_RETRY_DELAY = 600

interface UseReadAloudOptions {
  rate?: number
  volume?: number
}

const useReadAloud = (message: React.ReactNode | string, options?: UseReadAloudOptions) => {
  const [speaking, setSpeaking] = React.useState(false)
  const [voice, setVoice] = React.useState<chrome.tts.TtsVoice | undefined>(undefined)
  const [voices, setVoices] = React.useState<chrome.tts.TtsVoice[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const parseMessage = React.useCallback((message: React.ReactNode | string): string => {
    let stringValue = typeof message === 'string' ? message : ''
    if (!stringValue && Array.isArray(message)) {
      message.forEach((child) => {
        const childString = typeof child === 'string' ? child : child?.props?.children?.toString()
        if (childString) stringValue += childString + ' '
      })
    }
    return stringValue
  }, [])

  React.useEffect(() => {
    const stringValue = parseMessage(message)

    const handleLanguageDetection = (result: chrome.i18n.LanguageDetectionResult) => {
      if (result.languages?.length > 0) {
        const sortedLanguages = result.languages.sort((a, b) => b.percentage - a.percentage)

        chrome.tts.getVoices((availableVoices) => {
          setVoices(availableVoices)

          for (const lang of sortedLanguages) {
            const matchingVoices = availableVoices.filter((voice) =>
              voice.lang?.startsWith(lang.language)
            )
            if (matchingVoices.length > 0) {
              setVoice(matchingVoices[0])
              break
            }
          }
        })
      } else {
        console.warn('No languages detected in the text.')
      }
    }

    chrome.i18n.detectLanguage(stringValue, handleLanguageDetection)
  }, [message, parseMessage])

  React.useEffect(() => {
    const handleBeforeUnload = () => {
      chrome.tts.stop()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      chrome.tts.stop()
    }
  }, [])

  const handleReadAloud = React.useCallback(() => {
    if (speaking) {
      chrome.tts.stop()
      setSpeaking(false)
      return
    }

    const stringValue = parseMessage(message)
    const plainText = removeMarkdownSymbols(stringValue)

    if (!chrome?.tts) {
      logger.error('Text-to-speech is not available')
      return
    }

    if (!voice) {
      logger.error('No voice selected')
      return
    }

    let attempt = 0
    let startEventReceived = false
    let isLoading = true
    setIsLoading(isLoading)
    setSpeaking(true)

    const speakText = () => {
      chrome.tts.speak(plainText, {
        lang: voice.lang,
        rate: options?.rate ?? 1.0,
        volume: options?.volume ?? 1.0,
        onEvent: function (event) {
          logger.info('TTS event:', event.type, 'isLoading', isLoading)
          if (event.type === 'interrupted' && isLoading) {
            return logger.info('TTS interrupted')
          }

          if (event.type === 'start') {
            startEventReceived = true
            isLoading = false
            setSpeaking(true)
            setIsLoading(false)
          }

          if (['cancelled', 'interrupted', 'error', 'end'].includes(event.type)) {
            isLoading = false
            setSpeaking(false)
            setIsLoading(false)

            if (event.type === 'error') {
              logger.error('TTS error:', event)
            }
          }
        }
      })
    }

    const intervalId = setInterval(() => {
      if (startEventReceived || attempt >= SPEAK_ATTEMPTS) {
        clearInterval(intervalId)
        if (!startEventReceived) {
          logger.error(`Unable to start TTS after ${SPEAK_ATTEMPTS} attempts`)
          setSpeaking(false)
          setIsLoading(false)
        }
        return
      }

      attempt += 1
      logger.info(`Attempt ${attempt} to start TTS`)
      speakText()
    }, SPEAK_RETRY_DELAY)
  }, [message, options, parseMessage, speaking, voice])

  const setVoiceByName = React.useCallback(
    (voiceName: string) => {
      const selectedVoice = voices.find((voice) => voice.voiceName === voiceName)
      if (selectedVoice) setVoice(selectedVoice)
    },
    [voices]
  )

  return {
    speaking,
    voice,
    voices,
    isLoading,
    setVoiceByName,
    handleReadAloud
  }
}

export default useReadAloud
