import { createConversation, getConversations, sendMessage } from '@/workers/conversation'

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

const chatTypes = {
  createConversation,
  getConversations,
  sendMessage
}

chrome.runtime.onConnect.addListener(function (port) {
  switch (port.name) {
    case 'chat':
      port.onMessage.addListener(async (message) => {
        const { type } = message

        const chatType = chatTypes[type as keyof typeof chatTypes]

        if (chatType) {
          const response = await chatType({ ...message, port })
          port.postMessage({
            type,
            ...response
          })
        }
      })
      break
  }

  // console.assert(port.name === "knockknock");
  // port.onMessage.addListener(function(msg) {
  //   if (msg.joke === "Knock knock")
  //     port.postMessage({question: "Who's there?"});
  //   else if (msg.answer === "Madame")
  //     port.postMessage({question: "Madame who?"});
  //   else if (msg.answer === "Madame... Bovary")
  //     port.postMessage({question: "I don't get it."});
  // });
})
