/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from 'react'

import { ServerEndpoints } from '@/server/types/ServerEndpoints'

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
      portRef.current.postMessage({ type, payload })
    } else {
      console.error('Port is not connected')
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