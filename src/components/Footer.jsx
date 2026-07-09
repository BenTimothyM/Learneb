import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-line/70 py-8 text-center">
      <p className="font-mono text-xs text-ink2">
        Learneb — train Numeracy, Logic &amp; Memory.
      </p>
      <p className="mt-1 font-mono text-xs text-inkDark2">
        By{' '}
        <a href="https://github.com/BenTimothyM" target="_blank" rel="noopener noreferrer" className="text-ink2 hover:underline">
          Ben Timothy
        </a>{' '}
        /{' '}
        <a href="https://nneb.is-a.dev" target="_blank" rel="noopener noreferrer" className="text-numeracy hover:underline">
          NNeb.dev
        </a>
      </p>
    </footer>
  )
}
