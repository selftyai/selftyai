/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = {
  info: (...message: any) => {
    if (process.env.NODE_ENV === 'production') return

    console.log(...message)
  },
  error: (...message: any) => console.error(...message)
}

export default logger
