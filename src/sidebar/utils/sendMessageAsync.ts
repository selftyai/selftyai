// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendMessageAsync = (message: any) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      console.log('sendMessageAsync', response)
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(response)
      }
    })
  })
}

export default sendMessageAsync
