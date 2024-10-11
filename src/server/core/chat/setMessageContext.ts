interface setMessageContextPayload {
  context: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcastMessage: (message: any) => void
}

const setMessageContext = async ({ context, broadcastMessage }: setMessageContextPayload) => {
  broadcastMessage({ type: 'setMessageContext', payload: context })
}

export default setMessageContext
