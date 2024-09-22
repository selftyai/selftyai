export async function getDataFromStorage<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      const storedItem = result[key]
      if (storedItem) {
        try {
          const parsedItem: T = JSON.parse(storedItem)

          resolve(parsedItem)
        } catch (error) {
          console.error(`Error parsing value for key ${key}:`, error)
          resolve(undefined)
        }
      } else {
        resolve(undefined)
      }
    })
  })
}
