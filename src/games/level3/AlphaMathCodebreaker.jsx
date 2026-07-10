import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import Timer from '../../components/Timer.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { generateLetterChain, isCorrectNumeric, randInt, letterForValue } from '../../utils/mathGenerators.js'

const OP_SYMBOL = { '+': '+', '-': '\u2212', x: '\u00d7', '/': '\u00f7' }

const PRESETS = [
  { key: 'easy', label: 'Easy', maxLetter: 10, duration: 60, desc: 'Letters a\u2013j (values 1\u201310) \u00b7 60 seconds' },
  { key: 'medium', label: 'Medium', maxLetter: 26, duration: 60, desc: 'Full alphabet a\u2013z (values 1\u201326) \u00b7 60 seconds' },
  { key: 'hard', label: 'Hard', maxLetter: 26, duration: 30, desc: 'Full alphabet a\u2013z (values 1\u201326) \u00b7 30 seconds' },
]

function randomChainSteps() {
  return randInt(4, 7) // yields 5-8 flashed letters per question
}

function DifficultyPicker({ onSelect, onBack }) {
  const [customOpen, setCustomOpen] = useState(false)
  const [maxLetterChar, setMaxLetterChar] = useState('e')
  const [chainLength, setChainLength] = useState(6)
  const [duration, setDuration] = useState(60)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2 className="font-display text-xl font-semibold text-logic">Choose a difficulty</h2>
        <p className="mt-1 text-sm text-ink2">Remember: a = 1, b = 2, c = 3 ... z = 26.</p>

        {!customOpen && (
          <div className="mt-5 space-y-3">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelect({ key: p.key, maxLetter: p.maxLetter, duration: p.duration, chainSteps: null })}
                className="flex w-full items-center justify-between rounded-xl border border-line bg-panel2 px-4 py-3 text-left transition-colors hover:border-logic/60"
              >
                <div>
                  <div className="font-display text-base font-semibold text-ink">{p.label}</div>
                  <div className="text-xs text-ink2">{p.desc}</div>
                </div>
              </button>
            ))}
            <button
              onClick={() => setCustomOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-line px-4 py-3 text-left transition-colors hover:border-logic/60"
            >
              <div>
                <div className="font-display text-base font-semibold text-ink">Custom</div>
                <div className="text-xs text-ink2">Pick your own letter range, chain length, and duration.</div>
              </div>
            </button>
          </div>
        )}

        {customOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const letter = (maxLetterChar || 'e').trim().toLowerCase().charAt(0)
              const maxLetter = Math.max(2, Math.min(26, letter.charCodeAt(0) - 96 || 5))
              onSelect({
                key: 'custom',
                maxLetter,
                duration: Math.max(10, Number(duration) || 60),
                chainSteps: Math.max(2, Math.min(7, Number(chainLength) || 5)),
              })
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Highest letter allowed (a\u2013z)</label>
              <input
                type="text"
                maxLength={1}
                value={maxLetterChar}
                onChange={(e) => setMaxLetterChar(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono uppercase text-ink outline-none focus:border-logic"
              />
              <p className="mt-1 text-xs text-ink2">e.g. "e" limits letters to a\u2013e, representing values 1\u20135.</p>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Operations per question (3\u20138 letters)</label>
              <input
                type="number"
                min={2}
                max={7}
                value={chainLength}
                onChange={(e) => setChainLength(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono text-ink outline-none focus:border-logic"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-ink2">Duration (seconds)</label>
              <input
                type="number"
                min={10}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono text-ink outline-none focus:border-logic"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setCustomOpen(false)} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
                Back
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-logic px-4 py-2 text-sm font-semibold text-void">
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

function ExpressionDisplay({ chain }) {
  return (
    <p className="font-display text-3xl font-bold tracking-wide text-ink sm:text-4xl">
      {chain.map((token, i) => (
        <span key={i} className="mx-1">
          {i > 0 && <span className="text-logic">{OP_SYMBOL[token.type]} </span>}
          {token.letter}
        </span>
      ))}
    </p>
  )
}

export default function AlphaMathCodebreaker() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('select') // select | intro | playing | result
  const [config, setConfig] = useState(null)
  const [question, setQuestion] = useState(null)
  const [input, setInput] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [askedCount, setAskedCount] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [feedback, setFeedback] = useState(null)

  function chooseDifficulty(cfg) {
    setConfig(cfg)
    setPhase('intro')
  }

  function newQuestion(cfg) {
    const steps = cfg.chainSteps || randomChainSteps()
    setQuestion(generateLetterChain(cfg.maxLetter, steps))
    setInput('')
    setFeedback(null)
  }

  function startGame() {
    setCorrectCount(0)
    setAskedCount(0)
    newQuestion(config)
    setResetKey((k) => k + 1)
    setPhase('playing')
  }

  function handleExpire() {
    recordGameResult('AlphaMath Codebreaker', 3, correctCount, Math.max(askedCount, 1))
    setPhase('result')
  }

  function submitAnswer(e) {
    e.preventDefault()
    const correct = isCorrectNumeric(input, question.answer)
    setAskedCount((c) => c + 1)
    if (correct) setCorrectCount((c) => c + 1)
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => newQuestion(config), 350)
  }

  if (phase === 'select') {
    return <DifficultyPicker onSelect={chooseDifficulty} onBack={() => navigate('/dashboard')} />
  }

  if (phase === 'intro') {
    const label = config.key === 'custom' ? 'Custom' : PRESETS.find((p) => p.key === config.key)?.label
    return (
      <ModalReady
        title={`AlphaMath Codebreaker \u2014 ${label}`}
        accent="logic"
        syllabus={['Letter-to-number substitution (a=1 ... z=26)', 'Chained arithmetic with parentheses', 'Rapid mental decoding under time pressure']}
        rules={[
          `Each letter stands for a number: a=1, b=2, c=3 ... up to ${letterForValue(config.maxLetter)}=${config.maxLetter} in this round.`,
          'A chain of 5\u20138 letters and operators appears at once — decode and compute the total in your head.',
          `Type the final answer before the ${config.duration}-second countdown ends. Correct answers load the next question instantly.`,
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
          <p className="font-display text-2xl font-semibold text-ink">Time's up</p>
          <p className="mt-2 text-sm text-ink2">
            You cracked <span className="font-mono text-ink">{correctCount}/{askedCount}</span> codes correctly.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPhase('select')} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
              Play Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-logic px-4 py-2 text-sm font-semibold text-void">
              Back to Dashboard
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
      <div className="mb-6">
        <Timer duration={config.duration} running onExpire={handleExpire} resetKey={resetKey} accent="logic" />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-ink2">
          <span>a=1 ... {letterForValue(config.maxLetter)}={config.maxLetter}</span>
          <span>Score {correctCount}/{askedCount}</span>
        </div>
      </div>

      <Card>
        <ExpressionDisplay chain={question.chain} />
        <form onSubmit={submitAnswer} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            autoFocus
            type="number"
            step="any"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-panel2 px-4 py-3 font-mono text-lg text-ink outline-none focus:border-logic"
            placeholder="Your answer"
          />
          <button type="submit" className="w-full shrink-0 rounded-xl bg-logic px-5 py-3 text-sm font-semibold text-void shadow-glowViolet sm:w-auto">
            Submit
          </button>
        </form>
        {feedback && (
          <p className={`mt-3 text-sm ${feedback === 'correct' ? 'text-success' : 'text-danger'}`}>
            {feedback === 'correct' ? 'Correct!' : `Not quite — it was ${question.answer}.`}
          </p>
        )}
      </Card>
    </div>
  )
}
