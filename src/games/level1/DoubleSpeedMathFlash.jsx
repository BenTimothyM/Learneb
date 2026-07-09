import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import Timer from '../../components/Timer.jsx'
import DifficultySelect, { DEFAULT_CHAIN_PRESETS } from '../../components/DifficultySelect.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { generateChain, isCorrectNumeric } from '../../utils/mathGenerators.js'

const STEP_MS = 700
const CHAIN_OPS = 3 // operations per side per question (keeps dual-channel tracking manageable)

const OP_SYMBOL = { '+': '+', '-': '\u2212', x: '\u00d7', '/': '\u00f7' }

function formatStep(chain, i) {
  if (i === 0) return `${chain[0].value}`
  const s = chain[i]
  return `${OP_SYMBOL[s.type]} ${s.operand}`
}

export default function DoubleSpeedMathFlash() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('select') // select | intro | playing | answer | result
  const [config, setConfig] = useState(null)
  const [left, setLeft] = useState(null)
  const [right, setRight] = useState(null)
  const [tick, setTick] = useState(0)
  const [inputs, setInputs] = useState({ left: '', right: '' })
  const [pairsCorrect, setPairsCorrect] = useState(0) // number of individual sides answered correctly
  const [pairsAsked, setPairsAsked] = useState(0)
  const [questionInCycle, setQuestionInCycle] = useState(1)
  const [cycle, setCycle] = useState(1)
  const [resetKey, setResetKey] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const timeoutRef = useRef(null)

  function chooseDifficulty(cfg) {
    setConfig(cfg)
    setPhase('intro')
  }

  function newQuestion() {
    setLeft(generateChain(CHAIN_OPS))
    setRight(generateChain(CHAIN_OPS))
    setTick(0)
    setInputs({ left: '', right: '' })
    setLastResult(null)
  }

  function startGame() {
    setPairsCorrect(0)
    setPairsAsked(0)
    setQuestionInCycle(1)
    setCycle(1)
    newQuestion()
    setResetKey((k) => k + 1)
    setPhase('playing')
  }

  const totalTicks = left ? 2 * left.chain.length : 0

  useEffect(() => {
    if (phase !== 'playing' || !left || !right) return undefined
    if (tick >= totalTicks) {
      setPhase('answer')
      return undefined
    }
    timeoutRef.current = setTimeout(() => setTick((t) => t + 1), STEP_MS)
    return () => clearTimeout(timeoutRef.current)
  }, [phase, tick, left, right, totalTicks])

  function finishGame(finalCorrect, finalAsked) {
    recordGameResult('Double Speed Math Flash', 1, finalCorrect, Math.max(finalAsked, 1))
    setPhase('result')
  }

  function handleExpire() {
    if (phase === 'playing' || phase === 'answer') finishGame(pairsCorrect, pairsAsked)
  }

  function submitAnswers(e) {
    e.preventDefault()
    const leftCorrect = isCorrectNumeric(inputs.left, left.answer)
    const rightCorrect = isCorrectNumeric(inputs.right, right.answer)
    const nextCorrect = pairsCorrect + (leftCorrect ? 1 : 0) + (rightCorrect ? 1 : 0)
    const nextAsked = pairsAsked + 2
    setPairsCorrect(nextCorrect)
    setPairsAsked(nextAsked)
    setLastResult({ leftCorrect, rightCorrect })

    const isLastOfCycle = questionInCycle >= config.questions
    if (isLastOfCycle && !config.loop) {
      finishGame(nextCorrect, nextAsked)
      return
    }

    setTimeout(() => {
      if (isLastOfCycle) {
        setCycle((c) => c + 1)
        setQuestionInCycle(1)
      } else {
        setQuestionInCycle((q) => q + 1)
      }
      newQuestion()
      setPhase('playing')
    }, 900)
  }

  if (phase === 'select') {
    return (
      <DifficultySelect
        accent="numeracy"
        presets={DEFAULT_CHAIN_PRESETS}
        onSelect={chooseDifficulty}
        onBack={() => navigate('/dashboard')}
      />
    )
  }

  if (phase === 'intro') {
    return (
      <ModalReady
        title={`Double Speed Math Flash \u2014 ${config.key === 'custom' ? 'Custom' : config.label}`}
        accent="numeracy"
        syllabus={['Dual-channel chained arithmetic', 'Split attention & working memory', 'Order of operations']}
        rules={[
          'Two independent chains run per question — one on the left, one on the right — flashing alternately.',
          `${config.questions} question-pairs total, ${config.duration}s on the clock.`,
          config.loop
            ? 'Clear the set before time runs out and it loops back for more reps.'
            : 'Single pass — the round ends the moment you finish the last pair (no replay).',
        ]}
        onStart={startGame}
        onBack={() => setPhase('select')}
      />
    )
  }

  const isLeftTurn = tick % 2 === 0
  const chainIndex = Math.floor(tick / 2)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {(phase === 'playing' || phase === 'answer') && (
        <div className="mb-8">
          <Timer duration={config.duration} running onExpire={handleExpire} resetKey={resetKey} accent="numeracy" />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-ink2">
            <span>Pair {questionInCycle}/{config.questions}{config.loop && cycle > 1 ? ` (cycle ${cycle})` : ''}</span>
            <span>Correct sides {pairsCorrect}/{pairsAsked}</span>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="grid grid-cols-2 gap-6">
          <div className={`flex h-56 flex-col items-center justify-center rounded-2xl border transition-colors ${isLeftTurn ? 'border-numeracy bg-panel2' : 'border-line bg-panel'}`}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink2">Left</span>
            {isLeftTurn && chainIndex < left.chain.length && (
              <div key={tick} className="animate-flash font-display text-5xl font-bold text-ink">
                {formatStep(left.chain, chainIndex)}
              </div>
            )}
          </div>
          <div className={`flex h-56 flex-col items-center justify-center rounded-2xl border transition-colors ${!isLeftTurn ? 'border-logic bg-panel2' : 'border-line bg-panel'}`}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink2">Right</span>
            {!isLeftTurn && chainIndex < right.chain.length && (
              <div key={tick} className="animate-flash font-display text-5xl font-bold text-ink">
                {formatStep(right.chain, chainIndex)}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'answer' && (
        <Card>
          <p className="font-display text-lg text-ink">Both chains complete. Enter both final results.</p>
          <form onSubmit={submitAnswers} className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-numeracy">Left answer</label>
              <input
                autoFocus
                type="number"
                step="any"
                value={inputs.left}
                onChange={(e) => setInputs((s) => ({ ...s, left: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-3 font-mono text-lg text-ink outline-none focus:border-numeracy"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-logic">Right answer</label>
              <input
                type="number"
                step="any"
                value={inputs.right}
                onChange={(e) => setInputs((s) => ({ ...s, right: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-line bg-panel2 px-4 py-3 font-mono text-lg text-ink outline-none focus:border-logic"
              />
            </div>
            <button type="submit" className="col-span-2 mt-2 rounded-xl bg-numeracy px-5 py-3 text-sm font-semibold text-void shadow-glow">
              Submit Both
            </button>
          </form>
          {lastResult && (
            <p className="mt-3 text-center text-xs text-ink2">
              Last round: left was{' '}
              <span className={lastResult.leftCorrect ? 'text-success' : 'text-danger'}>{lastResult.leftCorrect ? 'correct' : 'incorrect'}</span>,
              right was{' '}
              <span className={lastResult.rightCorrect ? 'text-success' : 'text-danger'}>{lastResult.rightCorrect ? 'correct' : 'incorrect'}</span>.
            </p>
          )}
        </Card>
      )}

      {phase === 'result' && (
        <Card>
          <p className="font-display text-2xl font-semibold text-ink">Round complete</p>
          <p className="mt-2 text-sm text-ink2">
            You got <span className="font-mono text-ink">{pairsCorrect}/{pairsAsked}</span> sides correct.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPhase('select')} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
              Play Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-numeracy px-4 py-2 text-sm font-semibold text-void">
              Back to Dashboard
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
