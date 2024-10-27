/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = {
  info: (...message: any) => {
    if (process.env.NODE_ENV === 'production') return

    console.log(...message)
  },
  error: (...message: any) => console.error(...message),
  warn: (...message: any) => console.warn(...message)
}

export default logger
