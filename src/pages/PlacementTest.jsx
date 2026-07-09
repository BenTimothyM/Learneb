import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import Card, { CardLabel } from '../components/Card.jsx'
import { useGame } from '../context/GameContext.jsx'
import { randInt, pick, generatePemdas, generateFraction } from '../utils/mathGenerators.js'
import { generateSyllogism } from '../utils/logicGenerators.js'
import { rotatePoint, generateTriangle } from '../utils/matrixTransforms.js'

function buildNumeracyQuestion() {
  const kind = pick(['pemdas', 'fraction'])
  if (kind === 'pemdas') {
    const q = generatePemdas()
    const options = shuffle([q.answer, q.answer + 2, q.answer - 3, q.answer + 5])
    return { category: 'numeracy', prompt: `Evaluate: ${q.prompt}`, options, answer: q.answer }
  }
  const f = generateFraction()
  const options = shuffle([f.decimal, f.decimal + 0.2, f.decimal - 0.15, f.decimal + 0.4].map((n) => Math.round(n * 100) / 100))
  return { category: 'numeracy', prompt: `Convert to decimal: ${f.numerator}/${f.denominator}`, options, answer: Math.round(f.decimal * 100) / 100 }
}

function buildLogicQuestion() {
  const s = generateSyllogism()
  const options = ['Definitely Yes', 'Not Necessarily', 'Definitely No']
  return { category: 'logic', prompt: s.premises.join(' '), options, answer: s.answer }
}

function buildSpatialQuestion() {
  const [p] = generateTriangle()
  const degrees = pick([90, 180, 270])
  const rotated = rotatePoint(p, degrees)
  const distractors = [
    [rotated[0] + 1, rotated[1]],
    [rotated[0], rotated[1] + 1],
    [-rotated[0], rotated[1]],
  ]
  const options = shuffle([rotated, ...distractors]).map((pt) => `(${pt[0]}, ${pt[1]})`)
  return {
    category: 'spatial',
    prompt: `Point (${p[0]}, ${p[1]}) is rotated ${degrees}\u00b0 clockwise around the origin. Where does it land?`,
    options,
    answer: `(${rotated[0]}, ${rotated[1]})`,
  }
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestionSet() {
  const builders = [buildNumeracyQuestion, buildLogicQuestion, buildSpatialQuestion]
  const set = []
  for (let i = 0; i < 10; i++) {
    set.push(builders[i % 3]())
  }
  return shuffle(set)
}

export default function PlacementTest() {
  const navigate = useNavigate()
  const { recordPlacement } = useGame()
  const [questions] = useState(buildQuestionSet)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [scores, setScores] = useState({ numeracy: 0, logic: 0, spatial: 0 })
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const [suggestedLevel, setSuggestedLevel] = useState(null)

  const current = questions[index]
  const progressPct = Math.round((index / questions.length) * 100)

  function handleAnswer(opt) {
    if (selected !== null) return
    setSelected(opt)
    const isCorrect = String(opt) === String(current.answer)
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      setScores((s) => ({ ...s, [current.category]: s[current.category] + 1 }))
    }
    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1)
        setSelected(null)
      } else {
        finish(isCorrect)
      }
    }, 650)
  }

  function finish(lastCorrect) {
    const finalCorrect = correctCount + (lastCorrect ? 1 : 0)
    const level = finalCorrect <= 3 ? 1 : finalCorrect <= 7 ? 2 : 3
    setSuggestedLevel(level)
    setDone(true)
    recordPlacement(scores, level)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <CardLabel accent="numeracy">Placement Complete</CardLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          You scored {correctCount}/{questions.length}
        </h1>
        <p className="mt-4 text-ink2">
          Based on your accuracy across numeracy, logic and spatial reasoning, Learneb suggests
          starting at:
        </p>
        <div className="mt-6 inline-block rounded-2xl border border-line bg-panel px-8 py-6">
          <span className="font-mono text-xs uppercase tracking-widest text-ink2">Suggested level</span>
          <div className="font-display text-5xl font-bold text-numeracy">{suggestedLevel}</div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-xl bg-numeracy px-5 py-3 text-sm font-semibold text-void shadow-glow"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between font-mono text-xs text-ink2">
          <span>Question {index + 1} / {questions.length}</span>
          <span className="uppercase tracking-widest">{current.category}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-numeracy transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <Card>
        <p className="font-display text-lg text-ink">{current.prompt}</p>
        <div className="mt-5 grid gap-3">
          {current.options.map((opt, i) => {
            const isSelected = selected !== null && String(opt) === String(selected)
            const isCorrectOpt = selected !== null && String(opt) === String(current.answer)
            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={selected !== null}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  selected === null
                    ? 'border-line hover:border-numeracy/60 hover:bg-panel2'
                    : isCorrectOpt
                    ? 'border-success bg-success/10 text-success'
                    : isSelected
                    ? 'border-danger bg-danger/10 text-danger'
                    : 'border-line opacity-50'
                }`}
              >
                <span className="text-ink">{String(opt)}</span>
                {selected !== null && isCorrectOpt && <CheckCircle2 size={16} />}
                {selected !== null && isSelected && !isCorrectOpt && <XCircle size={16} />}
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
