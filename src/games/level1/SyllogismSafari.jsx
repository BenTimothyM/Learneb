import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footprints, Flag } from 'lucide-react'
import ModalReady from '../../components/ModalReady.jsx'
import Card from '../../components/Card.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { generateSyllogism } from '../../utils/logicGenerators.js'

const QUESTION_SECONDS = 8
const POOL_START = 60
const FINISH_LINE = 8

export default function SyllogismSafari() {
  const navigate = useNavigate()
  const { recordGameResult } = useGame()
  const [phase, setPhase] = useState('intro') // intro | playing | result
  const [question, setQuestion] = useState(null)
  const [position, setPosition] = useState(0)
  const [pool, setPool] = useState(POOL_START)
  const [localTime, setLocalTime] = useState(QUESTION_SECONDS)
  const [feedback, setFeedback] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [askedCount, setAskedCount] = useState(0)
  const intervalRef = useRef(null)
  const answeringRef = useRef(false)

  function startGame() {
    setPosition(0)
    setPool(POOL_START)
    setCorrectCount(0)
    setAskedCount(0)
    nextQuestion()
    setPhase('playing')
  }

  function nextQuestion() {
    answeringRef.current = false
    setQuestion(generateSyllogism())
    setLocalTime(QUESTION_SECONDS)
    setFeedback(null)
  }

  useEffect(() => {
    if (phase !== 'playing') return undefined
    intervalRef.current = setInterval(() => {
      setLocalTime((lt) => {
        const next = Math.round((lt - 0.1) * 10) / 10
        if (next <= 0) {
          handleTimeout()
          return 0
        }
        return next
      })
      setPool((p) => {
        const next = Math.round((p - 0.1) * 10) / 10
        return Math.max(0, next)
      })
      return undefined
    }, 100)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question])

  useEffect(() => {
    if (phase === 'playing' && pool <= 0) {
      finishGame()
    }
    if (phase === 'playing' && position >= FINISH_LINE) {
      finishGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, position])

  function handleTimeout() {
    if (answeringRef.current) return
    answeringRef.current = true
    setFeedback('timeout')
    setAskedCount((c) => c + 1)
    clearInterval(intervalRef.current)
    setTimeout(() => nextQuestion(), 900)
  }

  function handleAnswer(choice) {
    if (answeringRef.current) return
    answeringRef.current = true
    clearInterval(intervalRef.current)
    const correct = choice === question.answer
    setAskedCount((c) => c + 1)
    if (correct) {
      setCorrectCount((c) => c + 1)
      setPosition((p) => p + 1)
      setFeedback('correct')
    } else {
      setPool((p) => Math.max(0, Math.round((p - localTime) * 10) / 10))
      setFeedback('wrong')
    }
    setTimeout(() => nextQuestion(), 900)
  }

  function finishGame() {
    clearInterval(intervalRef.current)
    setPhase('result')
    recordGameResult('Syllogism Safari', 1, correctCount, Math.max(askedCount, 1))
  }

  if (phase === 'intro') {
    return (
      <ModalReady
        title="Syllogism Safari"
        accent="logic"
        syllabus={['Categorical syllogisms', 'Necessary vs. possible conclusions', 'Rapid deductive reasoning']}
        rules={[
          'Read the 3 premises and decide: Definitely Yes, Not Necessarily, or Definitely No.',
          'You have 8 seconds per question — correct answers move your explorer forward.',
          `Wrong answers dock the leftover time from your shared time pool. Reach step ${FINISH_LINE} before the pool empties.`,
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
          <p className="font-display text-2xl font-semibold text-ink">
            {position >= FINISH_LINE ? 'You reached the finish line!' : 'Time pool depleted.'}
          </p>
          <p className="mt-2 text-sm text-ink2">
            {correctCount} correct out of {askedCount} questions. Distance covered: {position}/{FINISH_LINE}.
          </p>
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Trail progress */}
      <div className="mb-6 flex items-center gap-1">
        {Array.from({ length: FINISH_LINE }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < position ? 'bg-logic' : 'bg-line'}`} />
        ))}
        <Flag size={16} className="ml-2 text-memory" />
      </div>

      <div className="mb-4 flex items-center justify-between font-mono text-xs text-ink2">
        <span className="flex items-center gap-1"><Footprints size={12} /> Step {position}/{FINISH_LINE}</span>
        <span>Pool: {pool.toFixed(1)}s</span>
        <span>Question: {localTime.toFixed(1)}s</span>
      </div>

      <Card>
        <div className="space-y-1">
          {question.premises.map((p, i) => (
            <p key={i} className="font-display text-base text-ink">{i + 1}. {p}</p>
          ))}
        </div>
        {question.question && (
          <p className="mt-3 font-mono text-sm text-logic">{question.question}</p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          {['Definitely Yes', 'Not Necessarily', 'Definitely No'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={feedback !== null}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                feedback && opt === question.answer
                  ? 'border-success bg-success/10 text-success'
                  : 'border-line hover:border-logic/60 hover:bg-panel2 text-ink'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {feedback === 'timeout' && <p className="mt-3 text-xs text-danger">Time's up — the answer was "{question.answer}".</p>}
      </Card>
    </div>
  )
}
