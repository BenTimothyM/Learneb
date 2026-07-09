/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        void: '#0B0E14',      // deepest background
        panel: '#121722',     // card/panel surface
        panel2: '#1A2130',    // raised panel / hover
        line: '#232B3D',      // hairline borders

        // Light mode surfaces
        paper: '#F5F7FA',
        paperPanel: '#FFFFFF',

        // Text
        ink: '#EDEFF5',
        ink2: '#9AA3B8',
        inkDark: '#101522',
        inkDark2: '#5C6478',

        // Faculty accents (Numeracy / Logic / Memory)
        numeracy: '#00E5C9',   // cyan — math
        logic: '#8B7FFF',      // violet — logic
        memory: '#FFB454',     // amber — memory/spatial

        // Level accents map 1:1 to faculties by default but kept distinct
        level1: '#00E5C9',
        level2: '#8B7FFF',
        level3: '#FF5C7A',

        success: '#3DDC97',
        danger: '#FF5C7A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(0,229,201,0.45)',
        glowViolet: '0 0 24px -6px rgba(139,127,255,0.45)',
        glowAmber: '0 0 24px -6px rgba(255,180,84,0.45)',
      },
      keyframes: {
        flash: {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '10%': { opacity: 1, transform: 'scale(1)' },
          '90%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.96)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(0,229,201,0.5)' },
          '100%': { boxShadow: '0 0 0 14px rgba(0,229,201,0)' },
        },
      },
      animation: {
        flash: 'flash 0.6s ease-in-out',
        pulseRing: 'pulseRing 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
