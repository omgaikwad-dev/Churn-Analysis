import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Palette, Check } from 'lucide-react'

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentTheme = themes.find((t) => t.id === theme) || themes[0]

  return (
    <div className="theme-switcher-wrapper" ref={menuRef}>
      <button
        type="button"
        className="theme-switcher-btn"
        onClick={() => setOpen(!open)}
        aria-label="Switch theme color"
        title={`Current Theme: ${currentTheme.name}`}
      >
        <span
          className="theme-swatch-dot"
          style={{ backgroundColor: currentTheme.color }}
        />
        <Palette size={16} />
        <span className="theme-name-label">{currentTheme.name.split(' ')[1] || currentTheme.name}</span>
      </button>

      {open && (
        <div className="theme-dropdown-menu">
          <div className="theme-dropdown-header">Select Color Theme</div>
          {themes.map((t) => {
            const isSelected = t.id === theme
            return (
              <button
                key={t.id}
                type="button"
                className={`theme-option-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setTheme(t.id)
                  setOpen(false)
                }}
              >
                <span
                  className="theme-option-dot"
                  style={{ backgroundColor: t.color }}
                />
                <div className="theme-option-text">
                  <span className="theme-option-name">{t.name}</span>
                  <span className="theme-option-desc">{t.desc}</span>
                </div>
                {isSelected && <Check size={15} className="theme-check-icon" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
