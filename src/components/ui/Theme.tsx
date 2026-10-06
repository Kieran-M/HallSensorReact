import { createContext, useContext, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('hallsim-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  // Brand default: dark (ignore OS preference on first visit)
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = getInitialTheme()
    applyTheme(initial)
    return initial
  })

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      applyTheme(next)
      localStorage.setItem('hallsim-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="group flex items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[var(--muted-foreground)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)] cursor-pointer"
    >
      {isDark ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="10" cy="10" r="3.25" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.35 4.35l1.4 1.4M14.25 14.25l1.4 1.4M15.65 4.35l-1.4 1.4M5.75 14.25l-1.4 1.4" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M16.5 12.15A6.6 6.6 0 0 1 7.85 3.5 6.6 6.6 0 1 0 16.5 12.15Z" />
        </svg>
      )}
      <span className="font-mono text-xs uppercase tracking-widest">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
