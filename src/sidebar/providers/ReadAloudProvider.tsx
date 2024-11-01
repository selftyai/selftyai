import React from 'react'
import { createContext, useContext } from 'react'
import { z } from 'zod'

import logger from '@/shared/logger'

export const MIN_VOLUME = 0.1
export const MAX_VOLUME = 1.0
export const MIN_RATE = 0.1
export const MAX_RATE = 2.0

interface ReadAloudContextType {
  readonly rate: number
  readonly volume: number
  setRate: (value: number) => void
  setVolume: (value: number) => void
}

const ReadAloudContext = createContext<ReadAloudContextType | undefined>(undefined)

const volumeSchema = z
  .number()
  .min(MIN_VOLUME, `Volume must be at least ${MIN_VOLUME}`)
  .max(MAX_VOLUME, `Volume cannot exceed ${MAX_VOLUME}`)
const rateSchema = z
  .number()
  .min(MIN_RATE, `Rate must be at least ${MIN_RATE}`)
  .max(MAX_RATE, `Rate cannot exceed ${MAX_RATE}`)

const ReadAloudProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [volume, setVolumeState] = React.useState(1.0)
  const [rate, setRateState] = React.useState(1.0)

  const validatedSetVolume = React.useCallback((value: number) => {
    try {
      volumeSchema.parse(value)
      setVolumeState(value)
    } catch (error) {
      logger.error('Invalid volume value:', error)
    }
  }, [])

  const validatedSetRate = React.useCallback((value: number) => {
    try {
      rateSchema.parse(value)
      setRateState(value)
    } catch (error) {
      logger.error('Invalid rate value:', error)
    }
  }, [])

  const contextValue = React.useMemo(
    () => ({
      volume,
      rate,
      setVolume: validatedSetVolume,
      setRate: validatedSetRate
    }),
    [volume, rate, validatedSetVolume, validatedSetRate]
  )

  return <ReadAloudContext.Provider value={contextValue}>{children}</ReadAloudContext.Provider>
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
