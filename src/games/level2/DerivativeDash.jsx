import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import Timer from '../../components/Timer.jsx'
import { useGame } from '../../context/GameContext.jsx'
import {
  generatePolynomial,
  derivativeOf,
  formatPolynomial,
  evaluatePolynomial,
  randInt,
} from '../../utils/mathGenerators.js'

const ROUNDS = 10
const QUESTION_SECONDS = 15
const VIEW = { w: 200, h: 140 }

function LinePlot({ poly, highlight = false }) {
  const points = []
  for (let px = 0; px <= VIEW.w; px += 4) {
    const x = (px / VIEW.w) * 10 - 5 // map [0,200] -> [-5,5]
    const y = evaluatePolynomial(poly, x)
    const clampedY = Math.max(-10, Math.min(10, y))
    const py = VIEW.h / 2 - (clampedY / 10) * (VIEW.h / 2 - 8)
    points.push(`${px},${py}`)
  }
  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-24 w-full">
      <line x1="0" y1={VIEW.h / 2} x2={VIEW.w} y2={VIEW.h / 2} stroke="#232B3D" strokeWidth="1" />
      <line x1={VIEW.w / 2} y1="0" x2={VIEW.w / 2} y2={VIEW.h} stroke="#232B3D" strokeWidth="1" />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={highlight ? '#00E5C9' : '#8B7FFF'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function buildRound() {
  const poly = generatePolynomial(2)
  const correctDerivative = derivativeOf(poly)

  const distractors = []
  while (distractors.length < 3) {
    const perturbed = {
      degree: correctDerivative.degree,
      coeffs: correctDerivative.coeffs.map((c) => c + (randInt(0, 1) ? randInt(1, 4) : -randInt(1, 4))),
    }
    const key = JSON.stringify(perturbed.coeffs)
    const dupCorrect = key === JSON.stringify(correctDerivative.coeffs)
    const dupExisting = distractors.some((d) => JSON.stringify(d.coeffs) === key)
    if (!dupCorrect && !dupExisting) distractors.push(perturbed)
  }

  const options = [{ ...correctDerivative, isCorrect: true }, ...distractors.map((d) => ({ ...d, isCorrect: false }))]
  options.sort(() => Math.random() - 0.5)

  return { poly, correctDerivative, options }
}

export default function DerivativeDash() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('intro') // intro | playing | result
  const [round, setRound] = useState(null)
  const [roundNum, setRoundNum] = useState(1)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [resetKey, setResetKey] = useState(0)

  function startGame() {
    setRoundNum(1)
    setScore(0)
    setRound(buildRound())
    setSelected(null)
    setResetKey((k) => k + 1)
    setPhase('playing')
  }

  function advance(correct) {
    if (correct) setScore((s) => s + 1)
    if (roundNum >= ROUNDS) {
      recordGameResult('Derivative Dash', 2, score + (correct ? 1 : 0), ROUNDS)
      setPhase('result')
      return
    }
    setTimeout(() => {
      setRound(buildRound())
      setSelected(null)
      setRoundNum((n) => n + 1)
      setResetKey((k) => k + 1)
    }, 550)
  }

  function handleSelect(opt) {
    if (selected) return
    setSelected(opt)
    advance(opt.isCorrect)
  }

  function handleExpire() {
    if (!selected) {
      setSelected({ isCorrect: false, timedOut: true })
      advance(false)
    }
  }

  if (phase === 'intro') {
    return (
      <ModalReady
        title="Derivative Dash"
        accent="logic"
        syllabus={['Polynomial functions', 'First derivatives', 'Reading function graphs']}
        rules={[
          'The left panel shows an algebraic function f(x).',
          'Pick the graph on the right that matches its derivative f\u2019(x).',
          `${ROUNDS} rounds, ${QUESTION_SECONDS}s each — a correct pick instantly loads the next round.`,
        ]}
        onStart={startGame}
        onBack={() => navigate('/dashboard')}
      />
    )
  }

  if (phase === 'result') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <Card>
          <p className="font-display text-2xl font-semibold text-ink">Dash complete</p>
          <p className="mt-2 text-sm text-ink2">You matched {score}/{ROUNDS} derivatives correctly.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPhase('intro')} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-4 flex items-center justify-between font-mono text-xs text-ink2">
        <span>Round {roundNum}/{ROUNDS}</span>
        <span>Score {score}</span>
      </div>
      <div className="mb-6">
        <Timer duration={QUESTION_SECONDS} running={!selected} onExpire={handleExpire} resetKey={resetKey} accent="logic" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <span className="font-mono text-[11px] uppercase tracking-widest text-logic">f(x) =</span>
          <p className="mt-2 font-display text-2xl text-ink">{formatPolynomial(round.poly)}</p>
          <p className="mt-4 text-xs text-ink2">Which graph shows f'(x)?</p>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {round.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`rounded-xl border p-2 transition-colors ${
                selected && opt.isCorrect
                  ? 'border-success bg-success/10'
                  : selected === opt && !opt.isCorrect
                  ? 'border-danger bg-danger/10'
                  : 'border-line hover:border-logic/60'
              }`}
            >
              <LinePlot poly={opt} highlight={selected === opt} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
