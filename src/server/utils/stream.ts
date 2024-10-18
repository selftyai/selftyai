export async function* streamingFetch(input: () => Promise<Response>) {
  const response = await input()

  if (!response.body) {
    throw new Error('Response body is not readable')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break

    const decodedValue = decoder.decode(value, { stream: true })

    const fixedJson = decodedValue.replace(/}\s*{/g, '}, {')

    try {
      const parsedJson = JSON.parse('[' + fixedJson + ']')

      for (const json of parsedJson) {
        yield json
      }
    } catch (e) {
      console.error('Error parsing JSON', e)
    }
  }
}
