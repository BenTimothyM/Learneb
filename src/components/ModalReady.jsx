import React from 'react'
import { X, BookOpen, Gamepad2 } from 'lucide-react'

/**
 * Pre-game overlay: syllabus, how-to-play rules, and a mandatory readiness check.
 * Props: title, accent, syllabus (string[]), rules (string[]), onStart, onBack
 */
export default function ModalReady({ title, accent = 'numeracy', syllabus = [], rules = [], onStart, onBack }) {
  const ACCENT_TEXT = { numeracy: 'text-numeracy', logic: 'text-logic', memory: 'text-memory' }
  const ACCENT_BTN = {
    numeracy: 'bg-numeracy hover:shadow-glow',
    logic: 'bg-logic hover:shadow-glowViolet',
    memory: 'bg-memory hover:shadow-glowAmber',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <button
          onClick={onBack}
          aria-label="Close and go back"
          className="absolute right-4 top-4 text-ink2 hover:text-ink"
        >
          <X size={18} />
        </button>

        <h2 className={`font-display text-xl font-semibold ${ACCENT_TEXT[accent]}`}>{title}</h2>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <BookOpen size={14} className={ACCENT_TEXT[accent]} />
            Syllabus covered
          </div>
          <ul className="mt-2 space-y-1 text-sm text-ink2">
            {syllabus.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className={ACCENT_TEXT[accent]}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Gamepad2 size={14} className={ACCENT_TEXT[accent]} />
            How to play
          </div>
          <ul className="mt-2 space-y-1 text-sm text-ink2">
            {rules.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className={ACCENT_TEXT[accent]}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-panel2 p-4 text-center">
          <p className="text-sm font-medium text-ink">Are you ready to start?</p>
          <div className="mt-3 flex justify-center gap-3">
            <button
              onClick={onBack}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink2 hover:text-ink"
            >
              Go Back
            </button>
            <button
              onClick={onStart}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-void transition-shadow ${ACCENT_BTN[accent]}`}
            >
              Yes, Start
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
