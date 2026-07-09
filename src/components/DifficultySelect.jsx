import React, { useState } from 'react'
import Card from './Card.jsx'

export const DEFAULT_CHAIN_PRESETS = [
  {
    key: 'easy',
    label: 'Easy',
    duration: 120,
    questions: 20,
    loop: true,
    desc: '2 minutes · 20 questions · loops so you can recompute',
  },
  {
    key: 'medium',
    label: 'Medium',
    duration: 60,
    questions: 20,
    loop: true,
    desc: '1 minute · 20 questions · loops so you can recompute',
  },
  {
    key: 'hard',
    label: 'Hard',
    duration: 30,
    questions: 30,
    loop: false,
    desc: '30 seconds · 30 questions · single pass, no replay',
  },
]

/**
 * Difficulty picker used before a chain-based flash game starts.
 * Props:
 *  - accent: tailwind accent key ('numeracy' | 'logic' | 'memory')
 *  - presets: array of { key, label, duration, questions, loop, desc }
 *  - onSelect(config): called with { duration, questions, loop, key }
 *  - onBack(): cancel and leave
 */
export default function DifficultySelect({ accent = 'numeracy', presets = DEFAULT_CHAIN_PRESETS, onSelect, onBack }) {
  const [customOpen, setCustomOpen] = useState(false)
  const [duration, setDuration] = useState(90)
  const [questions, setQuestions] = useState(15)
  const [loop, setLoop] = useState(true)

  const ACCENT_TEXT = { numeracy: 'text-numeracy', logic: 'text-logic', memory: 'text-memory' }
  const ACCENT_BORDER = { numeracy: 'hover:border-numeracy/60', logic: 'hover:border-logic/60', memory: 'hover:border-memory/60' }
  const ACCENT_BTN = {
    numeracy: 'bg-numeracy hover:shadow-glow',
    logic: 'bg-logic hover:shadow-glowViolet',
    memory: 'bg-memory hover:shadow-glowAmber',
  }

  function submitCustom(e) {
    e.preventDefault()
    onSelect({
      key: 'custom',
      duration: Math.max(5, Number(duration) || 60),
      questions: Math.max(1, Number(questions) || 10),
      loop,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2 className={`font-display text-xl font-semibold ${ACCENT_TEXT[accent]}`}>Choose a difficulty</h2>
        <p className="mt-1 text-sm text-ink2">Pick a preset, or build your own custom round.</p>

        {!customOpen && (
          <div className="mt-5 space-y-3">
            {presets.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelect(p)}
                className={`flex w-full items-center justify-between rounded-xl border border-line bg-panel2 px-4 py-3 text-left transition-colors ${ACCENT_BORDER[accent]}`}
              >
                <div>
                  <div className="font-display text-base font-semibold text-ink">{p.label}</div>
                  <div className="text-xs text-ink2">{p.desc}</div>
                </div>
              </button>
            ))}
            <button
              onClick={() => setCustomOpen(true)}
              className={`flex w-full items-center justify-between rounded-xl border border-dashed border-line px-4 py-3 text-left transition-colors ${ACCENT_BORDER[accent]}`}
            >
              <div>
                <div className="font-display text-base font-semibold text-ink">Custom</div>
                <div className="text-xs text-ink2">Set your own time, question count, and looping.</div>
              </div>
            </button>
          </div>
        )}

        {customOpen && (
          <form onSubmit={submitCustom} className="mt-5 space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Duration (seconds)</label>
              <input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono text-ink outline-none focus:border-numeracy"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Number of questions</label>
              <input
                type="number"
                min={1}
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono text-ink outline-none focus:border-numeracy"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="h-4 w-4 accent-numeracy" />
              Loop the questions so I can recompute while time remains
            </label>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setCustomOpen(false)} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
                Back
              </button>
              <button type="submit" className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-void ${ACCENT_BTN[accent]}`}>
                Start Custom Round
              </button>
            </div>
          </form>
        )}

        {!customOpen && (
          <button onClick={onBack} className="mt-5 w-full rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
