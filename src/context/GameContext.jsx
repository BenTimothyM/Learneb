import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const GameContext = createContext(null)

const STORAGE_KEY = 'learneb.state.v1'

const defaultState = {
  theme: 'dark',
  suggestedLevel: null, // 1 | 2 | 3, set after placement test
  unlockedLevel: 1,
  xp: 0,
  streak: 0,
  placementCompleted: false,
  placementScores: { numeracy: 0, logic: 0, spatial: 0 },
  history: [], // { game, level, score, total, date }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'dark') {
      root.classList.add('dark')
      document.body.classList.remove('bg-paper')
      document.body.classList.add('bg-void')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('bg-void')
      document.body.classList.add('bg-paper')
    }
  }, [state.theme])

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const recordPlacement = useCallback((scores, suggestedLevel) => {
    setState((s) => ({
      ...s,
      placementCompleted: true,
      placementScores: scores,
      suggestedLevel,
      unlockedLevel: Math.max(s.unlockedLevel, suggestedLevel),
    }))
  }, [])

  const recordGameResult = useCallback((game, level, score, total) => {
    setState((s) => {
      const passed = total > 0 && score / total >= 0.6
      const nextUnlocked = passed ? Math.max(s.unlockedLevel, Math.min(level + 1, 3)) : s.unlockedLevel
      return {
        ...s,
        xp: s.xp + score * 10,
        streak: passed ? s.streak + 1 : 0,
        unlockedLevel: nextUnlocked,
        history: [
          { game, level, score, total, date: new Date().toISOString() },
          ...s.history,
        ].slice(0, 50),
      }
    })
  }, [])

  const resetProgress = useCallback(() => setState(defaultState), [])

  const value = useMemo(
    () => ({ ...state, toggleTheme, recordPlacement, recordGameResult, resetProgress }),
    [state, toggleTheme, recordPlacement, recordGameResult, resetProgress],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
