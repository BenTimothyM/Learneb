import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import Timer from '../../components/Timer.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { generateTriangle, generateTransformPrompt } from '../../utils/matrixTransforms.js'

const ROUNDS = 5
const MEMORIZE_SECONDS = 7
const RANGE = 8 // grid spans [-RANGE, RANGE]
const VIEW = 320

function toPixel([x, y]) {
  const scale = VIEW / (RANGE * 2)
  return [VIEW / 2 + x * scale, VIEW / 2 - y * scale]
}

function toCoord(px, py) {
  const scale = VIEW / (RANGE * 2)
  const x = Math.round((px - VIEW / 2) / scale)
  const y = Math.round((VIEW / 2 - py) / scale)
  return [x, y]
}

function Grid({ children, onClick }) {
  const lines = []
  for (let i = -RANGE; i <= RANGE; i++) {
    const [px] = toPixel([i, 0])
    const [, py] = toPixel([0, i])
    lines.push(<line key={`v${i}`} x1={px} y1={0} x2={px} y2={VIEW} stroke="#1A2130" strokeWidth={i === 0 ? 1.5 : 0.5} />)
    lines.push(<line key={`h${i}`} x1={0} y1={py} x2={VIEW} y2={py} stroke="#1A2130" strokeWidth={i === 0 ? 1.5 : 0.5} />)
  }
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="mx-auto w-full max-w-sm cursor-crosshair rounded-xl border border-line bg-panel2"
      onClick={onClick}
    >
      {lines}
      {children}
    </svg>
  )
}

function buildRound() {
  const points = generateTriangle()
  const transform = generateTransformPrompt()
  const targetIndex = Math.floor(Math.random() * 3)
  const targetLabel = ['A', 'B', 'C'][targetIndex]
  const answer = transform.apply(points[targetIndex])
  return { points, transform, targetIndex, targetLabel, answer }
}

export default function MemoryMatrix() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('intro') // intro | memorize | recall | feedback | result
  const [round, setRound] = useState(null)
  const [roundNum, setRoundNum] = useState(1)
  const [score, setScore] = useState(0)
  const [guess, setGuess] = useState(null)
  const [resetKey, setResetKey] = useState(0)

  function startGame() {
    setRoundNum(1)
    setScore(0)
    setRound(buildRound())
    setGuess(null)
    setResetKey((k) => k + 1)
    setPhase('memorize')
  }

  function handleMemorizeExpire() {
    setPhase('recall')
  }

  function handleClick(e) {
    if (phase !== 'recall') return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const scaleX = VIEW / rect.width
    const scaleY = VIEW / rect.height
    const px = (e.clientX - rect.left) * scaleX
    const py = (e.clientY - rect.top) * scaleY
    const coord = toCoord(px, py)
    setGuess(coord)
  }

  function submitGuess() {
    if (!guess) return
    const correct = guess[0] === round.answer[0] && guess[1] === round.answer[1]
    if (correct) setScore((s) => s + 1)
    setPhase('feedback')
    if (roundNum >= ROUNDS) {
      recordGameResult('Memory Matrix', 2, score + (correct ? 1 : 0), ROUNDS)
    }
  }

  function nextRound() {
    if (roundNum >= ROUNDS) {
      setPhase('result')
      return
    }
    setRound(buildRound())
    setGuess(null)
    setRoundNum((n) => n + 1)
    setResetKey((k) => k + 1)
    setPhase('memorize')
  }

  if (phase === 'intro') {
    return (
      <ModalReady
        title="Memory Matrix"
        accent="memory"
        syllabus={['2D vector coordinates', 'Rotation about the origin', 'Translation vectors']}
        rules={[
          `A triangle A, B, C appears on the grid for ${MEMORIZE_SECONDS} seconds — memorize it.`,
          'The grid then blanks and shows a transform instruction (rotate, then translate).',
          'Click the exact new coordinate of the requested vertex.',
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
          <p className="font-display text-2xl font-semibold text-ink">Matrix cleared</p>
          <p className="mt-2 text-sm text-ink2">You placed {score}/{ROUNDS} vertices correctly.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPhase('intro')} className="rounded-xl border border-line px-4 py-2 text-sm text-ink2 hover:text-ink">
              Play Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-memory px-4 py-2 text-sm font-semibold text-void">
              Back to Dashboard
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center sm:px-6">
      <div className="mb-4 flex items-center justify-between font-mono text-xs text-ink2">
        <span>Round {roundNum}/{ROUNDS}</span>
        <span>Score {score}</span>
      </div>

      {phase === 'memorize' && (
        <>
          <div className="mb-4">
            <Timer duration={MEMORIZE_SECONDS} running onExpire={handleMemorizeExpire} resetKey={resetKey} accent="memory" />
          </div>
          <Grid>
            {round.points.map((p, i) => {
              const [px, py] = toPixel(p)
              return (
                <g key={i}>
                  <circle cx={px} cy={py} r="6" fill="#FFB454" />
                  <text x={px + 10} y={py - 8} fill="#EDEFF5" fontSize="14" fontFamily="monospace">
                    {['A', 'B', 'C'][i]}
                  </text>
                </g>
              )
            })}
          </Grid>
        </>
      )}

      {phase === 'recall' && (
        <Card>
          <p className="font-display text-base text-ink">{round.transform.description}</p>
          <p className="mt-2 font-mono text-sm text-memory">Click the new position of vertex {round.targetLabel}.</p>
          <Grid onClick={handleClick}>
            {guess && (
              <circle cx={toPixel(guess)[0]} cy={toPixel(guess)[1]} r="6" fill="#00E5C9" />
            )}
          </Grid>
          {guess && (
            <p className="mt-2 font-mono text-xs text-ink2">Selected: ({guess[0]}, {guess[1]})</p>
          )}
          <button
            onClick={submitGuess}
            disabled={!guess}
            className="mt-4 rounded-xl bg-memory px-5 py-2.5 text-sm font-semibold text-void disabled:opacity-40"
          >
            Confirm
          </button>
        </Card>
      )}

      {phase === 'feedback' && (
        <Card>
          <p className="font-display text-lg text-ink">
            Correct position: <span className="font-mono text-memory">({round.answer[0]}, {round.answer[1]})</span>
          </p>
          <p className="mt-1 font-mono text-sm text-ink2">
            Your guess: ({guess[0]}, {guess[1]}) —{' '}
            <span className={guess[0] === round.answer[0] && guess[1] === round.answer[1] ? 'text-success' : 'text-danger'}>
              {guess[0] === round.answer[0] && guess[1] === round.answer[1] ? 'correct' : 'incorrect'}
            </span>
          </p>
          <button onClick={nextRound} className="mt-4 rounded-xl bg-memory px-5 py-2.5 text-sm font-semibold text-void">
            {roundNum >= ROUNDS ? 'See Results' : 'Next Round'}
          </button>
        </Card>
      )}
    </div>
  )
}
