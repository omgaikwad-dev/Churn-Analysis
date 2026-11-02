import { createContext, useContext, useState, useEffect } from 'react'

const THEMES = [
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    color: '#10B981',
    rgb: '16, 185, 129',
    desc: 'Vibrant neon mint & matrix obsidian',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    color: '#F59E0B',
    rgb: '245, 158, 11',
    desc: 'Warm gold & sunset coral energy',
  },
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('churnguard_theme')
    if (saved === 'amber') return 'amber'
    return 'emerald'
  })

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'amber' ? 'amber' : 'emerald'
    setThemeState(validTheme)
    localStorage.setItem('churnguard_theme', validTheme)
    document.documentElement.setAttribute('data-theme', validTheme)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[0]

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
