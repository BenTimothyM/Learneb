import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Moon, Sun, Brain, Zap } from 'lucide-react'
import { useGame } from '../context/GameContext.jsx'

export default function Navbar() {
  const { theme, toggleTheme, xp, streak } = useGame()

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-numeracy bg-panel2'
        : 'text-ink2 hover:text-ink hover:bg-panel2/60'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-void/80 backdrop-blur-md dark:bg-void/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="hex-clip flex h-8 w-8 items-center justify-center bg-gradient-to-br from-numeracy via-logic to-memory">
            <Brain size={16} className="text-void" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">Learneb</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/placement" className={linkClass}>Placement Test</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-ink2 sm:flex">
            <Zap size={12} className="text-memory" />
            <span className="font-mono">{xp} XP</span>
            {streak > 0 && <span className="ml-1 text-numeracy">🔥{streak}</span>}
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-full border border-line p-2 text-ink2 transition-colors hover:text-ink hover:border-numeracy/50"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line/60 px-4 py-1.5 sm:hidden">
        <NavLink to="/" className={linkClass} end>Home</NavLink>
        <NavLink to="/placement" className={linkClass}>Placement</NavLink>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
      </nav>
    </header>
  )
}
