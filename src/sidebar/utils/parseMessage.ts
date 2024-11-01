export interface ParsedMessage {
  context?: string
  message: string
}
export const parseMessageWithContext = (input: string): ParsedMessage => {
  const contextMatch = input.match(/""(.*?)""/s)
  const messageMatch = input.match(/```(.*?)```/s)

  return {
    context: contextMatch ? contextMatch[1] : undefined,
    message: messageMatch ? messageMatch[1] : input
  }
}

export const getFullPrompt = (promptMessage: string, message: string, context?: string): string => {
  return promptMessage
    .replace('<message></message>', `\`\`\`${message}\`\`\``)
    .replace('<context></context>', context ? `""${context}""` : '')
}

export const removeMarkdownSymbols = (text: string): string => {
  const regex = /[*_~`#]/g
  return text.replace(regex, '')
}
