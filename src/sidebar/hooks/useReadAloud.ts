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

  const intervalIdRef = React.useRef<NodeJS.Timeout | null>(null)

  const startEventReceivedRef = React.useRef(false)
  const attemptRef = React.useRef(0)
  const isLoadingRef = React.useRef(false)

  const parseMessage = React.useCallback((message: React.ReactNode | string): string => {
    let stringValue = ''
    const traverse = (node: React.ReactNode): void => {
      if (typeof node === 'string') {
        stringValue += node + ' '
        return
      }
      if (React.isValidElement(node) && node.props.children) {
        React.Children.forEach(node.props.children, (child) => traverse(child))
        return
      }
      if (Array.isArray(node)) {
        node.forEach((child) => traverse(child))
        return
      }
    }
    traverse(message)
    return stringValue.trim()
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

      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
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

    const speakText = () => {
      const { rate = 1.0, volume = 1.0 } = options || {}

      chrome.tts.speak(plainText, {
        lang: voice.lang,
        rate: rate,
        volume: volume,
        onEvent: function (event) {
          logger.info('TTS event:', event.type)
          if (event.type === 'interrupted' && isLoadingRef.current) {
            return
          }

          if (event.type === 'start') {
            startEventReceivedRef.current = true
            setIsLoading(false)
            isLoadingRef.current = false
            setSpeaking(true)
          }

          if (['cancelled', 'interrupted', 'error', 'end'].includes(event.type)) {
            setSpeaking(false)
            setIsLoading(false)
            isLoadingRef.current = false

            if (event.type === 'error') {
              logger.error('TTS error:', event)
            }
          }
        }
      })
    }

    setIsLoading(true)
    attemptRef.current = 0
    startEventReceivedRef.current = false
    isLoadingRef.current = true

    intervalIdRef.current = setInterval(() => {
      if (startEventReceivedRef.current || attemptRef.current >= SPEAK_ATTEMPTS) {
        clearInterval(intervalIdRef.current!)
        intervalIdRef.current = null
        if (!startEventReceivedRef.current) {
          logger.error(`Unable to start TTS after ${SPEAK_ATTEMPTS} attempts`)
          setSpeaking(false)
          setIsLoading(false)
          isLoadingRef.current = false
        }
        return
      }

      attemptRef.current += 1
      logger.info(`Attempt ${attemptRef.current} to start TTS`)
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
