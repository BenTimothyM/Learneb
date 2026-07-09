import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import Timer from '../../components/Timer.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { generateCryptarithmByLength } from '../../utils/mathGenerators.js'

const PRESETS = [
  { key: 'easy', label: 'Easy', digitCount: 2, duration: 120, timerEnabled: true, desc: '2-digit + 2-digit \u00b7 2 minutes' },
  { key: 'medium3', label: 'Medium \u00b7 3-digit', digitCount: 3, duration: 300, timerEnabled: true, desc: '3-digit + 3-digit \u00b7 5 minutes' },
  { key: 'medium4', label: 'Medium \u00b7 4-digit', digitCount: 4, duration: 600, timerEnabled: true, desc: '4-digit + 4-digit \u00b7 10 minutes' },
  { key: 'hard3', label: 'Hard \u00b7 3-digit', digitCount: 3, duration: 120, timerEnabled: true, desc: '3-digit + 3-digit \u00b7 2 minutes' },
  { key: 'hard4', label: 'Hard \u00b7 4-digit', digitCount: 4, duration: 300, timerEnabled: true, desc: '4-digit + 4-digit \u00b7 5 minutes' },
]

function wordValue(word, mapping) {
  const digits = word.split('').map((ch) => mapping[ch])
  if (digits.some((d) => d === undefined || d === '')) return null
  return Number(digits.join(''))
}

function LetterCell({ ch, value, onChange, invalid }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, '').slice(-1)
          onChange(ch, v)
        }}
        className={`h-12 w-10 rounded-lg border bg-panel2 text-center font-mono text-lg text-ink outline-none focus:border-danger ${
          invalid ? 'border-danger' : 'border-line'
        }`}
      />
      <span className="font-display text-lg font-semibold text-ink2">{ch}</span>
    </div>
  )
}

function DifficultyPicker({ onSelect, onBack }) {
  const [customOpen, setCustomOpen] = useState(false)
  const [digitCount, setDigitCount] = useState(3)
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [duration, setDuration] = useState(180)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2 className="font-display text-xl font-semibold text-level3">Choose a difficulty</h2>
        <p className="mt-1 text-sm text-ink2">Every tier doubles a hidden number: W + W = RESULT.</p>

        {!customOpen && (
          <div className="mt-5 space-y-3">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelect(p)}
                className="flex w-full items-center justify-between rounded-xl border border-line bg-panel2 px-4 py-3 text-left transition-colors hover:border-level3/60"
              >
                <div>
                  <div className="font-display text-base font-semibold text-ink">{p.label}</div>
                  <div className="text-xs text-ink2">{p.desc}</div>
                </div>
              </button>
            ))}
            <button
              onClick={() => setCustomOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-line px-4 py-3 text-left transition-colors hover:border-level3/60"
            >
              <div>
                <div className="font-display text-base font-semibold text-ink">Custom</div>
                <div className="text-xs text-ink2">Pick your own digit count, and turn the timer on or off.</div>
              </div>
            </button>
          </div>
        )}

        {customOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSelect({
                key: 'custom',
                digitCount: Math.max(2, Math.min(6, Number(digitCount) || 3)),
                timerEnabled,
                duration: timerEnabled ? Math.max(10, Number(duration) || 120) : null,
              })
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Digits per addend (2\u20136)</label>
              <input
                type="number"
                min={2}
                max={6}
                value={digitCount}
                onChange={(e) => setDigitCount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono text-ink outline-none focus:border-level3"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} className="h-4 w-4 accent-level3" />
              Enable countdown timer
            </label>
            {timerEnabled && (
              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Duration (seconds)</label>
                <input
                  type="number"
                  min={10}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono text-ink outline-none focus:border-level3"
                />
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setCustomOpen(false)} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
                Back
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-level3 px-4 py-2 text-sm font-semibold text-void">
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

export default function CryptarithmArena() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('select') // select | intro | playing | result
  const [config, setConfig] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [mapping, setMapping] = useState({})
  const [resetKey, setResetKey] = useState(0)
  const [outcome, setOutcome] = useState(null)

  const uniqueLetters = useMemo(() => {
    if (!puzzle) return []
    return Array.from(new Set((puzzle.w1 + puzzle.w2 + puzzle.w3).split('')))
  }, [puzzle])

  function chooseDifficulty(cfg) {
    setConfig(cfg)
    setPhase('intro')
  }

  function startGame() {
    setPuzzle(generateCryptarithmByLength(config.digitCount))
    setMapping({})
    setOutcome(null)
    setResetKey((k) => k + 1)
    setPhase('playing')
  }

  function handleChange(ch, val) {
    setMapping((m) => ({ ...m, [ch]: val }))
  }

  function usedDigitsAreUnique() {
    const values = uniqueLetters.map((ch) => mapping[ch]).filter((v) => v !== undefined && v !== '')
    return new Set(values).size === values.length
  }

  function leadingZeroOk() {
    return [puzzle.w1, puzzle.w2, puzzle.w3].every((w) => mapping[w[0]] !== '0')
  }

  function checkSolution() {
    const v1 = wordValue(puzzle.w1, mapping)
    const v2 = wordValue(puzzle.w2, mapping)
    const v3 = wordValue(puzzle.w3, mapping)
    if (v1 === null || v2 === null || v3 === null) {
      setOutcome({ status: 'incomplete' })
      return
    }
    if (!usedDigitsAreUnique()) {
      setOutcome({ status: 'duplicate' })
      return
    }
    if (!leadingZeroOk()) {
      setOutcome({ status: 'leadingzero' })
      return
    }
    const correct = v1 + v2 === v3
    setOutcome({ status: correct ? 'correct' : 'wrong' })
    if (correct) {
      recordGameResult('Cryptarithm Arena', 3, 1, 1)
      setPhase('result')
    }
  }

  function handleExpire() {
    setOutcome({ status: 'timeout' })
    recordGameResult('Cryptarithm Arena', 3, 0, 1)
    setPhase('result')
  }

  if (phase === 'select') {
    return <DifficultyPicker onSelect={chooseDifficulty} onBack={() => navigate('/dashboard')} />
  }

  if (phase === 'intro') {
    const label =
      config.key === 'custom'
        ? `Custom \u00b7 ${config.digitCount}-digit`
        : PRESETS.find((p) => p.key === config.key)?.label
    return (
      <ModalReady
        title={`Cryptarithm Arena \u2014 ${label}`}
        accent="memory"
        syllabus={['Alpha-numeric cryptarithms', 'Constraint satisfaction', 'Modular reasoning about carries']}
        rules={[
          'Every unique letter maps to exactly one digit (0\u20139), no repeats.',
          'The leading letter of any word cannot be 0.',
          config.timerEnabled
            ? `You have a strict ${config.duration}-second countdown \u2014 no scratchpad, type directly over the letters.`
            : 'No timer this round \u2014 take the time you need, but no scratchpad, type directly over the letters.',
        ]}
        onStart={startGame}
        onBack={() => setPhase('select')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <Card>
          <p className={`font-display text-2xl font-semibold ${outcome?.status === 'correct' ? 'text-success' : 'text-danger'}`}>
            {outcome?.status === 'correct' ? 'Solved!' : "Time's up"}
          </p>
          <p className="mt-2 font-mono text-sm text-ink2">
            {puzzle.w1} + {puzzle.w2} = {puzzle.w3}
          </p>
          {puzzle.solution && (
            <p className="mt-2 text-xs text-ink2">
              Solution: {Object.entries(puzzle.solution).map(([k, v]) => `${k}=${v}`).join(', ')}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPhase('select')} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
              Play Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-level3 px-4 py-2 text-sm font-semibold text-void">
              Back to Dashboard
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {config.timerEnabled && (
        <div className="mb-6">
          <Timer duration={config.duration} running={phase === 'playing'} onExpire={handleExpire} resetKey={resetKey} accent="memory" />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-2xl text-ink">
          {puzzle.w1.split('').map((ch, i) => (
            <LetterCell key={`w1-${i}`} ch={ch} value={mapping[ch]} onChange={handleChange} />
          ))}
          <span className="self-end pb-3 text-2xl text-ink2">+</span>
          {puzzle.w2.split('').map((ch, i) => (
            <LetterCell key={`w2-${i}`} ch={ch} value={mapping[ch]} onChange={handleChange} />
          ))}
          <span className="self-end pb-3 text-2xl text-ink2">=</span>
          {puzzle.w3.split('').map((ch, i) => (
            <LetterCell key={`w3-${i}`} ch={ch} value={mapping[ch]} onChange={handleChange} />
          ))}
        </div>

        {outcome && outcome.status !== 'correct' && (
          <p className="mt-4 text-center text-xs text-danger">
            {outcome.status === 'incomplete' && 'Fill in every letter before checking.'}
            {outcome.status === 'duplicate' && 'Two letters share the same digit — each must be unique.'}
            {outcome.status === 'leadingzero' && 'A leading letter cannot be 0.'}
            {outcome.status === 'wrong' && "That mapping doesn't satisfy the equation. Try again."}
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <button onClick={checkSolution} className="rounded-xl bg-level3 px-6 py-3 text-sm font-semibold text-void">
            Check Solution
          </button>
        </div>
      </Card>
    </div>
  )
}
