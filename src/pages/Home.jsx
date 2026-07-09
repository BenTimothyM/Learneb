import React from 'react'
import { Link } from 'react-router-dom'
import { Sigma, Puzzle, ScanEye, ArrowRight, Target } from 'lucide-react'
import Card, { CardLabel } from '../components/Card.jsx'

const FACULTIES = [
  {
    key: 'numeracy',
    icon: Sigma,
    title: 'Numeracy',
    desc: 'Chained arithmetic, progressions, matrices, derivatives, and modular systems — solved against the clock.',
  },
  {
    key: 'logic',
    icon: Puzzle,
    title: 'Logic',
    desc: 'Syllogisms, truth tables, and NAND/NOR/XOR gates that force rigorous, provable reasoning.',
  },
  {
    key: 'memory',
    icon: ScanEye,
    title: 'Memory',
    desc: 'Spatial recall under time pressure: vector rotations, translations, and coordinate reconstruction.',
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-fade pointer-events-none absolute inset-0 h-[560px]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-numeracy">
            <Target size={12} /> Numeracy · Logic · Memory
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Train your mind like you'd train for a sport.
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink2 sm:text-lg">
            Learneb runs three core faculties through strict, timed, gamified drills —
            every problem generated live, so you never run out of reps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/placement"
              className="inline-flex items-center gap-2 rounded-xl bg-numeracy px-5 py-3 text-sm font-semibold text-void shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Take the Placement Test <ArrowRight size={16} />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-ink hover:border-ink2/50"
            >
              Jump straight to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Faculties */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {FACULTIES.map((f) => (
            <Card key={f.key} accent={f.key}>
              <f.icon size={20} className={{ numeracy: 'text-numeracy', logic: 'text-logic', memory: 'text-memory' }[f.key]} />
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <CardLabel accent={f.key}>Core Faculty</CardLabel>
              <p className="mt-2 text-sm text-ink2">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-ink">How Learneb works</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Card>
            <span className="font-mono text-xs text-ink2">Step 1</span>
            <h4 className="mt-1 font-display text-base font-semibold text-ink">Place yourself</h4>
            <p className="mt-2 text-sm text-ink2">
              A 10-question diagnostic across math, logic, and spatial reasoning suggests your starting level.
            </p>
          </Card>
          <Card>
            <span className="font-mono text-xs text-ink2">Step 2</span>
            <h4 className="mt-1 font-display text-base font-semibold text-ink">Choose your drill</h4>
            <p className="mt-2 text-sm text-ink2">
              Pick a level manually, or let Learneb queue up a Random Game across the three faculties.
            </p>
          </Card>
          <Card>
            <span className="font-mono text-xs text-ink2">Step 3</span>
            <h4 className="mt-1 font-display text-base font-semibold text-ink">Beat the clock</h4>
            <p className="mt-2 text-sm text-ink2">
              Every game runs on a strict timer. Clear the bar and the next level unlocks.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
