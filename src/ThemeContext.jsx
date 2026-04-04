import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('mc-theme') || 'dark')

  useEffect(() => {
    localStorage.setItem('mc-theme', theme)
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return <ThemeContext.Provider value={{ theme, toggle, isLight: theme === 'light' }}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
