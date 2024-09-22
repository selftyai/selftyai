/* eslint-disable react-refresh/only-export-components */
import React from 'react'

import { getTheme, setTheme as setThemeToLocalStorage } from '@/utils/localStorage'

export type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = React.useState(getTheme() || 'light')

  const setThemeAndSave = (theme: string) => {
    setThemeToLocalStorage(theme)
    setTheme(theme)
  }

  React.useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndSave }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
