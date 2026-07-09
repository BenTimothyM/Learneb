import React, { useEffect, useRef, useState } from 'react'

/**
 * Countdown timer with a visual progress bar.
 * Props:
 *  - duration: seconds
 *  - running: boolean, whether the timer should be actively ticking
 *  - onExpire: called once when it reaches 0
 *  - resetKey: change this value to restart the timer from `duration`
 *  - accent: tailwind color class fragment (e.g. 'numeracy' | 'logic' | 'memory')
 */
export default function Timer({ duration, running = true, onExpire, resetKey, accent = 'numeracy' }) {
  const [remaining, setRemaining] = useState(duration)
  const expiredRef = useRef(false)
  const intervalRef = useRef(null)

  // Restart when resetKey or duration changes
  useEffect(() => {
    setRemaining(duration)
    expiredRef.current = false
  }, [resetKey, duration])

  useEffect(() => {
    if (!running) return undefined

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 0.1) {
          clearInterval(intervalRef.current)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire && onExpire()
          }
          return 0
        }
        return clean(prev - 0.1)
      })
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, resetKey, onExpire])

  const ACCENT_BG = { numeracy: 'bg-numeracy', logic: 'bg-logic', memory: 'bg-memory' }
  const pct = Math.max(0, Math.min(100, (remaining / duration) * 100))
  const barColor =
    pct > 50 ? ACCENT_BG[accent] || 'bg-numeracy' : pct > 20 ? 'bg-memory' : 'bg-danger'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between font-mono text-xs text-ink2">
        <span>Time</span>
        <span>{remaining.toFixed(1)}s</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all duration-100 ease-linear ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function clean(n) {
  return Math.round(n * 10) / 10
}
