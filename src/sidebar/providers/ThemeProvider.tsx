import React, { useEffect, useState, useCallback } from 'react'

import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

import sendMessageAsync from '../utils/sendMessageAsync'

export const ThemeContext = React.createContext<
  | {
      changeTheme: (theme: string, fromMessage?: boolean) => void
      theme: string
    }
  | undefined
>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps extends React.PropsWithChildren {
  parent?: HTMLElement
  initialTheme?: string
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  parent = document.documentElement,
  initialTheme = 'dark'
}) => {
  const [theme, setTheme] = useState(initialTheme)
  const [isLocalChange, setIsLocalChange] = useState(false)

  const changeTheme = useCallback(
    async (inputTheme: string, fromMessage = false) => {
      console.log('changeTheme', inputTheme, fromMessage, parent)
      if (!fromMessage) {
        setIsLocalChange(true)
        await sendMessageAsync({ type: ServerEndpoints.setTheme, payload: inputTheme })
      }

      parent?.classList?.remove('light', 'dark')
      parent?.classList?.add(inputTheme)
      setTheme(inputTheme)
    },
    [parent]
  )

  useEffect(() => {
    sendMessageAsync<string>({ type: ServerEndpoints.getTheme, payload: null }).then(
      (theme: string) => {
        parent?.classList?.remove('light', 'dark')
        parent?.classList?.add(theme)
        setTheme(theme)
      }
    )
  }, [parent])

  useEffect(() => {
    if (isLocalChange) {
      setIsLocalChange(false)
    }
  }, [isLocalChange, theme])

  return <ThemeContext.Provider value={{ changeTheme, theme }}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
