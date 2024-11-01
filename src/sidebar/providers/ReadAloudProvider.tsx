import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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

const ReadAloudProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation()
  const [volume, setVolumeState] = useState(1.0)
  const [rate, setRateState] = useState(1.0)

  const volumeSchema = useMemo(
    () =>
      z
        .number()
        .min(MIN_VOLUME, t('readAloudSettings.errors.volume.min', { min: MIN_VOLUME }))
        .max(MAX_VOLUME, t('readAloudSettings.errors.volume.max', { max: MAX_VOLUME })),
    [t]
  )

  const rateSchema = useMemo(
    () =>
      z
        .number()
        .min(MIN_RATE, t('readAloudSettings.errors.rate.min', { min: MIN_RATE }))
        .max(MAX_RATE, t('readAloudSettings.errors.rate.max', { max: MAX_RATE })),
    [t]
  )

  const validatedSetVolume = useCallback(
    (value: number) => {
      try {
        volumeSchema.parse(value)
        setVolumeState(value)
      } catch (error) {
        logger.error('Invalid volume value:', error)
      }
    },
    [volumeSchema]
  )

  const validatedSetRate = useCallback(
    (value: number) => {
      try {
        rateSchema.parse(value)
        setRateState(value)
      } catch (error) {
        logger.error('Invalid rate value:', error)
      }
    },
    [rateSchema]
  )

  const contextValue = useMemo(
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
