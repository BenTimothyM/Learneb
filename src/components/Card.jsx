import React from 'react'

const ACCENTS = {
  numeracy: { border: 'hover:border-numeracy/60', glow: 'hover:shadow-glow', text: 'text-numeracy' },
  logic: { border: 'hover:border-logic/60', glow: 'hover:shadow-glowViolet', text: 'text-logic' },
  memory: { border: 'hover:border-memory/60', glow: 'hover:shadow-glowAmber', text: 'text-memory' },
  neutral: { border: 'hover:border-ink2/40', glow: '', text: 'text-ink' },
}

export default function Card({ accent = 'neutral', className = '', children, as: Tag = 'div', ...props }) {
  const a = ACCENTS[accent] || ACCENTS.neutral
  return (
    <Tag
      className={`rounded-2xl border border-line bg-panel p-5 transition-all duration-300 ${a.border} ${a.glow} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardLabel({ accent = 'neutral', children }) {
  const a = ACCENTS[accent] || ACCENTS.neutral
  return <span className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>{children}</span>
}
