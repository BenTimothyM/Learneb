import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import Timer from '../../components/Timer.jsx'
import DifficultySelect, { DEFAULT_CHAIN_PRESETS } from '../../components/DifficultySelect.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { generateChain, isCorrectNumeric } from '../../utils/mathGenerators.js'

const STEP_MS = 650
const CHAIN_OPS = 4 // operations per single question (5 flashed values total)

const OP_SYMBOL = { '+': '+', '-': '\u2212', x: '\u00d7', '/': '\u00f7' }

export default function SpeedMathFlash() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('select') // select | intro | playing | answer | result
  const [config, setConfig] = useState(null)
  const [chainData, setChainData] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [askedCount, setAskedCount] = useState(0)
  const [questionInCycle, setQuestionInCycle] = useState(1)
  const [cycle, setCycle] = useState(1)
  const [resetKey, setResetKey] = useState(0)
  const timeoutRef = useRef(null)

  function chooseDifficulty(cfg) {
    setConfig(cfg)
    setPhase('intro')
  }

  function startGame() {
    setCorrectCount(0)
    setAskedCount(0)
    setQuestionInCycle(1)
    setCycle(1)
    setChainData(generateChain(CHAIN_OPS))
    setStepIndex(0)
    setResetKey((k) => k + 1)
    setPhase('playing')
  }

  useEffect(() => {
    if (phase !== 'playing' || !chainData) return undefined
    if (stepIndex >= chainData.chain.length - 1) {
      timeoutRef.current = setTimeout(() => setPhase('answer'), STEP_MS)
      return () => clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => setStepIndex((i) => i + 1), STEP_MS)
    return () => clearTimeout(timeoutRef.current)
  }, [phase, stepIndex, chainData])

  function finishGame() {
    recordGameResult('Speed Math Flash', 1, correctCount, Math.max(askedCount, 1))
    setPhase('result')
  }

  function handleExpire() {
    if (phase === 'playing' || phase === 'answer') finishGame()
  }

  function submitAnswer(e) {
    e.preventDefault()
    const correct = isCorrectNumeric(input, chainData.answer)
    const nextAsked = askedCount + 1
    const nextCorrect = correctCount + (correct ? 1 : 0)
    setAskedCount(nextAsked)
    setCorrectCount(nextCorrect)
    setInput('')

    const isLastOfCycle = questionInCycle >= config.questions
    if (isLastOfCycle && !config.loop) {
      // Single-pass mode (Hard / custom without loop): stop once the set is done.
      recordGameResult('Speed Math Flash', 1, nextCorrect, nextAsked)
      setPhase('result')
      return
    }

    if (isLastOfCycle) {
      setCycle((c) => c + 1)
      setQuestionInCycle(1)
    } else {
      setQuestionInCycle((q) => q + 1)
    }
    setChainData(generateChain(CHAIN_OPS))
    setStepIndex(0)
    setPhase('playing')
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
        title={`Speed Math Flash \u2014 ${config.key === 'custom' ? 'Custom' : config.label}`}
        accent="numeracy"
        syllabus={['Basic operators (+, -, ×, ÷)', 'Chained order-of-operations', 'Mental arithmetic under time pressure']}
        rules={[
          `A running total flashes one operation at a time — track it in your head.`,
          `${config.questions} questions total, ${config.duration}s on the clock.`,
          config.loop
            ? 'Finish the set before time runs out and it loops back so you can rack up more reps.'
            : 'Single pass — once you reach the last question, the round ends immediately (no replay).',
        ]}
        onStart={startGame}
        onBack={() => setPhase('select')}
      />
    )
  }

  const current = chainData?.chain[stepIndex]
  const progressPct = chainData ? Math.round(((stepIndex + 1) / chainData.chain.length) * 100) : 0

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
      {(phase === 'playing' || phase === 'answer') && (
        <div className="mb-6 w-full">
          <Timer duration={config.duration} running onExpire={handleExpire} resetKey={resetKey} accent="numeracy" />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-ink2">
            <span>Question {questionInCycle}/{config.questions}{config.loop && cycle > 1 ? ` (cycle ${cycle})` : ''}</span>
            <span>Score {correctCount}/{askedCount}</span>
          </div>
        </div>
      )}

      {phase === 'playing' && current && (
        <>
          <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-numeracy transition-all duration-200 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div key={stepIndex} className="animate-flash font-display text-6xl font-bold text-ink sm:text-7xl">
            {stepIndex === 0 ? current.value : `${OP_SYMBOL[current.type]} ${current.operand}`}
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink2">
            Step {stepIndex + 1} / {chainData.chain.length}
          </p>
        </>
      )}

      {phase === 'answer' && (
        <Card className="w-full">
          <p className="font-display text-lg text-ink">Chain complete. What's the final result?</p>
          <form onSubmit={submitAnswer} className="mt-5 flex gap-3">
            <input
              autoFocus
              type="number"
              step="any"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-panel2 px-4 py-3 font-mono text-lg text-ink outline-none focus:border-numeracy"
              placeholder="Your answer"
            />
            <button type="submit" className="rounded-xl bg-numeracy px-5 py-3 text-sm font-semibold text-void shadow-glow">
              Submit
            </button>
          </form>
        </Card>
      )}

      {phase === 'result' && (
        <Card className="w-full">
          <p className="font-display text-2xl font-semibold text-ink">Round complete</p>
          <p className="mt-2 text-sm text-ink2">
            You answered <span className="font-mono text-ink">{correctCount}/{askedCount}</span> correctly.
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
