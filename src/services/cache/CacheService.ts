type CacheItem<T> = {
  value: T
  expiry?: number
}

class CacheService {
  private cache: Record<string, string> = {}
  private prefix: string

  constructor(prefix: string = '') {
    this.prefix = prefix
    this.loadFromStorage()
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`
  }

  private loadFromStorage(): void {
    chrome.storage.local.get(null, (items) => {
      Object.entries(items).forEach(([key, value]) => {
        if (key.startsWith(this.prefix) && typeof value === 'string') {
          this.cache[key] = value
        }
      })
    })
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const prefixedKey = this.getKey(key)
    const item: CacheItem<T> = {
      value: value,
      expiry: ttl ? Date.now() + ttl : undefined
    }
    const serializedItem = JSON.stringify(item)

    // Check available space
    const bytesInUse = await this.getBytesInUse()
    const availableSpace = chrome.storage.local.QUOTA_BYTES - bytesInUse
    const itemSize = new Blob([serializedItem]).size

    if (itemSize > availableSpace) {
      throw new Error('Not enough storage space available')
    }

    this.cache[prefixedKey] = serializedItem
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [prefixedKey]: serializedItem }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  public get<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      const prefixedKey = this.getKey(key)
      const cachedItem = this.cache[prefixedKey]

      if (cachedItem) {
        this.parseAndResolve<T>(cachedItem, prefixedKey, resolve)
      } else {
        chrome.storage.local.get(prefixedKey, (result) => {
          const storedItem = result[prefixedKey]
          if (storedItem) {
            this.parseAndResolve<T>(storedItem, prefixedKey, resolve)
          } else {
            resolve(undefined)
          }
        })
      }
    })
  }

  private parseAndResolve<T>(
    item: string,
    prefixedKey: string,
    resolve: (value: T | undefined) => void
  ): void {
    try {
      const parsedItem: CacheItem<T> = JSON.parse(item)
      if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
        this.remove(prefixedKey)
        resolve(undefined)
      } else {
        resolve(parsedItem.value)
      }
    } catch (error) {
      console.error(`Error parsing value for key ${prefixedKey}:`, error)
      resolve(undefined)
    }
  }

  public remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      const prefixedKey = this.getKey(key)
      delete this.cache[prefixedKey]
      chrome.storage.local.remove(prefixedKey, resolve)
    })
  }

  public clear(): Promise<void> {
    return new Promise((resolve) => {
      const keysToRemove = Object.keys(this.cache).filter((key) => key.startsWith(this.prefix))
      keysToRemove.forEach((key) => delete this.cache[key])
      chrome.storage.local.remove(keysToRemove, resolve)
    })
  }

  private getBytesInUse(): Promise<number> {
    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse(null, resolve)
    })
  }

  public getAvailableSpace(): Promise<number> {
    return this.getBytesInUse().then((bytesInUse) => chrome.storage.local.QUOTA_BYTES - bytesInUse)
  }
}

export default CacheService
