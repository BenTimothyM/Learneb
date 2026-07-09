import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import PlacementTest from './pages/PlacementTest.jsx'
import Dashboard from './pages/Dashboard.jsx'

import SpeedMathFlash from './games/level1/SpeedMathFlash.jsx'
import DoubleSpeedMathFlash from './games/level1/DoubleSpeedMathFlash.jsx'
import SyllogismSafari from './games/level1/SyllogismSafari.jsx'
import DerivativeDash from './games/level2/DerivativeDash.jsx'
import MemoryMatrix from './games/level2/MemoryMatrix.jsx'
import CryptarithmArena from './games/level3/CryptarithmArena.jsx'
import AlphaMathCodebreaker from './games/level3/AlphaMathCodebreaker.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/placement" element={<PlacementTest />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/games/level1/speed-math-flash" element={<SpeedMathFlash />} />
          <Route path="/games/level1/double-speed-math-flash" element={<DoubleSpeedMathFlash />} />
          <Route path="/games/level1/syllogism-safari" element={<SyllogismSafari />} />

          <Route path="/games/level2/derivative-dash" element={<DerivativeDash />} />
          <Route path="/games/level2/memory-matrix" element={<MemoryMatrix />} />

          <Route path="/games/level3/cryptarithm-arena" element={<CryptarithmArena />} />
          <Route path="/games/level3/alphamath-codebreaker" element={<AlphaMathCodebreaker />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
