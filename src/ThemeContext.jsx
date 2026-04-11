import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('mc-theme') || 'light')

  useEffect(() => {
    localStorage.setItem('mc-theme', theme)
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const toggle = () => {
    if (!document.startViewTransition) {
      setTheme(t => t === 'dark' ? 'light' : 'dark')
      return
    }
    document.documentElement.classList.add('theme-transitioning')
    document.startViewTransition(() => {
      setTheme(t => t === 'dark' ? 'light' : 'dark')
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
      }, 600)
    })
  }

  return <ThemeContext.Provider value={{ theme, toggle, isLight: theme === 'light' }}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
