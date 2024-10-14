import { StateStorage } from '@/server/types/Storage'

export const createChromeStorage = (area: 'local' | 'sync' = 'local'): StateStorage => ({
  getItem: (key: string) =>
    new Promise((resolve, reject) => {
      chrome.storage[area].get(key, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve(result[key] ?? null)
      })
    }),
  setItem: (key: string, value: string) =>
    new Promise((resolve, reject) => {
      chrome.storage[area].set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve(true)
      })
    }),
  removeItem: (key: string) => {
    return new Promise((resolve, reject) => {
      chrome.storage[area].remove(key, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve(true)
      })
    })
  }
})
