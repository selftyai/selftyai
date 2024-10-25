import '@testing-library/dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Suppress unhandled promise rejections for specific errors
process.on('unhandledRejection', (reason) => {
  if (
    reason instanceof Error &&
    (reason.message === 'ollamaOriginError' || reason.message === 'ollamaConnectionError')
  ) {
    return
  }
  throw reason
})
