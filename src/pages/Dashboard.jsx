import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Shuffle, Sigma, Puzzle, ScanEye, Sparkles } from 'lucide-react'
import Card, { CardLabel } from '../components/Card.jsx'
import { useGame } from '../context/GameContext.jsx'

const GAMES = [
  {
    level: 1,
    accent: 'numeracy',
    faculty: 'Numeracy · Logic',
    label: 'Level 1 — Easy',
    entries: [
      { name: 'Speed Math Flash', path: '/games/level1/speed-math-flash', icon: Sigma },
      { name: 'Double Speed Math Flash', path: '/games/level1/double-speed-math-flash', icon: Sigma },
      { name: 'Syllogism Safari', path: '/games/level1/syllogism-safari', icon: Puzzle },
    ],
  },
  {
    level: 2,
    accent: 'logic',
    faculty: 'Numeracy · Memory',
    label: 'Level 2 — Medium',
    entries: [
      { name: 'Derivative Dash', path: '/games/level2/derivative-dash', icon: Sigma },
      { name: 'Memory Matrix', path: '/games/level2/memory-matrix', icon: ScanEye },
    ],
  },
  {
    level: 3,
    accent: 'memory',
    faculty: 'Logic · Memory',
    label: 'Level 3 — Hard',
    entries: [
      { name: 'Cryptarithm Arena', path: '/games/level3/cryptarithm-arena', icon: Puzzle },
      { name: 'AlphaMath Codebreaker', path: '/games/level3/alphamath-codebreaker', icon: Sigma },
    ],
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { unlockedLevel, suggestedLevel, xp, streak, history } = useGame()

  function randomGame() {
    const availableLevels = GAMES.filter((g) => g.level <= unlockedLevel)
    const pool = availableLevels.flatMap((g) => g.entries)
    const choice = pool[Math.floor(Math.random() * pool.length)]
    navigate(choice.path)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <CardLabel accent="numeracy">Dashboard</CardLabel>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Choose your drill</h1>
          <p className="mt-2 text-sm text-ink2">
            {suggestedLevel
              ? `Placement suggested Level ${suggestedLevel}. You've unlocked up through Level ${unlockedLevel}.`
              : `Take the placement test any time for a suggested starting level. Level ${unlockedLevel} is currently unlocked.`}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-line bg-panel px-4 py-2 text-center">
            <div className="font-mono text-lg font-semibold text-memory">{xp}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink2">XP</div>
          </div>
          <div className="rounded-xl border border-line bg-panel px-4 py-2 text-center">
            <div className="font-mono text-lg font-semibold text-numeracy">{streak}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink2">Streak</div>
          </div>
        </div>
      </div>

      <button
        onClick={randomGame}
        className="mt-8 flex w-full items-center justify-between rounded-2xl border border-line bg-gradient-to-r from-panel to-panel2 px-6 py-5 text-left transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <Shuffle className="text-numeracy" size={20} />
          <div>
            <div className="font-display text-lg font-semibold text-ink">Random Game</div>
            <div className="text-sm text-ink2">Let Learneb queue up any unlocked drill.</div>
          </div>
        </div>
        <Sparkles className="text-memory" size={18} />
      </button>

      <div className="mt-10 space-y-8">
        {GAMES.map((group) => {
          const locked = group.level > unlockedLevel
          return (
            <div key={group.level}>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-ink">{group.label}</h2>
                <span className="font-mono text-[11px] text-ink2">{group.faculty}</span>
                {locked && <Lock size={13} className="text-ink2" />}
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {group.entries.map((entry) => (
                  <Card
                    key={entry.path}
                    accent={group.accent}
                    as="button"
                    onClick={() => !locked && navigate(entry.path)}
                    className={`text-left ${locked ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <entry.icon size={18} className="text-ink2" />
                    <h3 className="mt-3 font-display text-base font-semibold text-ink">{entry.name}</h3>
                    <p className="mt-1 text-xs text-ink2">{locked ? 'Locked — clear the previous level to unlock.' : 'Tap to view rules and start.'}</p>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-lg font-semibold text-ink">Recent runs</h2>
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-panel">
            {history.slice(0, 6).map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink">{h.game}</span>
                <span className="font-mono text-ink2">{h.score}/{h.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
