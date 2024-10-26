/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from 'react'

import logger from '@/shared/logger'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

type MessageHandler = (message: any) => void

export const useChromePort = () => {
  const portRef = useRef<chrome.runtime.Port | null>(null)
  const messageHandlersRef = useRef<MessageHandler[]>([])

  useEffect(() => {
    if (!portRef.current) {
      portRef.current = chrome.runtime.connect()

      portRef.current.onMessage.addListener((message) => {
        messageHandlersRef.current.forEach((handler) => handler(message))
      })
    }

    return () => {
      if (portRef.current) {
        portRef.current.disconnect()
        portRef.current = null
      }
    }
  }, [])

  const sendMessage = useCallback((type: ServerEndpoints, payload?: any) => {
    if (portRef.current) {
      try {
        portRef.current.postMessage({ type, payload })
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === 'Attempting to use a disconnected port object'
        ) {
          logger.error('[useChromePort] Port is disconnected. Reconnecting...')
          portRef.current = chrome.runtime.connect()
          portRef.current.onMessage.addListener((message) => {
            messageHandlersRef.current.forEach((handler) => handler(message))
          })
          portRef.current.postMessage({ type, payload })
        } else {
          logger.error('[useChromePort] Error while sending message:', error)
        }
      }
    } else {
      logger.error('[useChromePort] Port is not connected')
    }
  }, [])

  const addMessageListener = useCallback((handler: MessageHandler) => {
    messageHandlersRef.current.push(handler)
    return () => {
      messageHandlersRef.current = messageHandlersRef.current.filter((h) => h !== handler)
    }
  }, [])

  return { sendMessage, addMessageListener }
}
