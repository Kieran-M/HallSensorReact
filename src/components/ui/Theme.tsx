import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('hallsim-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('hallsim-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme: () => setTheme(current => current === 'light' ? 'dark' : 'light') }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeToggle() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeToggle must be used within ThemeProvider')

  const isDark = context.theme === 'dark'

  return (
    <button
      type="button"
      onClick={context.toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="group flex items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[var(--muted-foreground)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
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
      <span className="font-mono text-[9px] uppercase tracking-widest">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
