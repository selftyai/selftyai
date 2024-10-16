export interface ParsedMessage {
  context?: string
  message: string
}

export const parseMessageWithContext = (input: string): ParsedMessage => {
  const contextMatch = input.match(/<context>(.*?)<\/context>/s)
  const messageMatch = input.match(/<message>(.*?)<\/message>/s)

  return {
    context: contextMatch ? contextMatch[1] : undefined,
    message: messageMatch ? messageMatch[1] : input
  }
}
