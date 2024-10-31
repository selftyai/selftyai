import React from 'react'
import { createContext, useContext } from 'react'
import { z } from 'zod'

export const MIN_VOLUME = 0.1
export const MAX_VOLUME = 1.0
export const MIN_RATE = 0.1
export const MAX_RATE = 2.0

interface ReadAloudContextType {
  rate: number
  volume: number
  setRate: (value: number) => void
  setVolume: (value: number) => void
}

const ReadAloudContext = createContext<ReadAloudContextType | undefined>(undefined)

const volumeSchema = z.number().min(0.1).max(1.0)
const rateSchema = z.number().min(0.1).max(2.0)

const ReadAloudProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [volume, setVolumeState] = React.useState(1.0)
  const [rate, setRateState] = React.useState(1.0)

  const validatedSetVolume = React.useCallback((value: number) => {
    volumeSchema.parse(value)
    setVolumeState(value)
  }, [])

  const validatedSetRate = React.useCallback((value: number) => {
    rateSchema.parse(value)
    setRateState(value)
  }, [])

  return (
    <ReadAloudContext.Provider
      value={{ volume, rate, setVolume: validatedSetVolume, setRate: validatedSetRate }}
    >
      {children}
    </ReadAloudContext.Provider>
  )
}

export default ReadAloudProvider

// eslint-disable-next-line react-refresh/only-export-components
export const useReadAloudContext = () => {
  const context = useContext(ReadAloudContext)
  if (!context) {
    throw new Error('useReadAloud must be used within a ReadAloudProvider')
  }
  return context
}
