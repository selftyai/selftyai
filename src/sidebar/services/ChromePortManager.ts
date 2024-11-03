/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'

import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

export class ChromePortManager {
  private static instance: ChromePortManager
  private port: chrome.runtime.Port | null = null
  private messageHandlers: ((message: any) => void)[] = []

  private constructor() {
    this.connect()
  }

  static getInstance(): ChromePortManager {
    if (!ChromePortManager.instance) {
      ChromePortManager.instance = new ChromePortManager()
    }
    return ChromePortManager.instance
  }

  private connect() {
    if (!this.port) {
      this.port = chrome.runtime.connect()
      this.port.onMessage.addListener((message) => {
        this.messageHandlers.forEach((handler) => handler(message))
      })
    }
  }

  addMessageHandler(handler: (message: any) => void) {
    this.messageHandlers.push(handler)
  }

  removeMessageHandler(handler: (message: any) => void) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
  }

  sendMessage(message: any) {
    this.port?.postMessage(message)
  }

  disconnect() {
    if (this.port) {
      this.port.disconnect()
      this.port = null
      this.messageHandlers = []
    }
  }
}

interface ChromeStore {
  portManager: ChromePortManager
  lastMessage: any
  sendMessage: (type: ServerEndpoints, payload: any) => void
}

export const useChromeStore = create<ChromeStore>((set) => {
  const portManager = ChromePortManager.getInstance()

  portManager.addMessageHandler((message) => {
    set({ lastMessage: message })
  })

  return {
    portManager,
    lastMessage: null,
    sendMessage: (type, payload) => {
      portManager.sendMessage({
        type,
        payload
      })
    }
  }
})
