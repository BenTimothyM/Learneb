// ---------------------------------------------------------------------------
// mathGenerators.js — pure, side-effect-free algorithmic question generators.
// Every function returns a fresh, randomized problem object so games are
// endlessly replayable with no hardcoded question banks.
// ---------------------------------------------------------------------------

export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const pick = (arr) => arr[randInt(0, arr.length - 1)]

/** Round to avoid floating point artifacts like 3.0000000004 */
export const clean = (n) => Math.round(n * 1e6) / 1e6

// --- Level 1: chained operator flash (Speed Math Flash) ---------------------
// Builds a chain of operations that always resolves to a clean integer.
export function generateChain(steps = 4) {
  let value = randInt(2, 12)
  const chain = [{ type: 'start', value }]
  const ops = ['+', '-', 'x', '/']

  for (let i = 0; i < steps; i++) {
    let op = pick(ops)
    let operand
    if (op === '/') {
      // choose a divisor that divides `value` evenly, avoiding /0 and /1 spam
      const divisors = []
      for (let d = 2; d <= 12; d++) if (value % d === 0) divisors.push(d)
      if (divisors.length === 0) op = '+'
      else operand = pick(divisors)
    }
    if (op !== '/') {
      operand = randInt(2, 12)
    }
    let next = value
    if (op === '+') next = value + operand
    if (op === '-') next = value - operand
    if (op === 'x') next = value * operand
    if (op === '/') next = value / operand

    // keep numbers in a readable range
    if (Math.abs(next) > 999) {
      i--
      continue
    }
    chain.push({ type: op, operand, value: next })
    value = next
  }

  return { chain, answer: clean(value) }
}

// --- Fibonacci / AP / GP progressions ---------------------------------------
export function generateFibonacci(length = 6) {
  const a0 = randInt(1, 5)
  const a1 = randInt(1, 5)
  const seq = [a0, a1]
  for (let i = 2; i < length; i++) seq.push(seq[i - 1] + seq[i - 2])
  const idx = length - 1
  const answer = seq[idx]
  return { sequence: seq.slice(0, idx), answer, kind: 'Fibonacci-style' }
}

export function generateArithmeticProgression(length = 5) {
  const first = randInt(-10, 10)
  const diff = randInt(-8, 8) || 2
  const seq = Array.from({ length }, (_, i) => first + i * diff)
  const answer = seq[length - 1]
  return { sequence: seq.slice(0, length - 1), answer, kind: 'Arithmetic Progression', diff }
}

export function generateGeometricProgression(length = 5) {
  const first = randInt(1, 6)
  const ratio = pick([2, 3, -2])
  const seq = Array.from({ length }, (_, i) => first * Math.pow(ratio, i))
  const answer = seq[length - 1]
  return { sequence: seq.slice(0, length - 1), answer, kind: 'Geometric Progression', ratio }
}

// --- Rapid squares / roots / fractions ---------------------------------------
export function generateSquareRoot() {
  const isSquare = Math.random() < 0.5
  if (isSquare) {
    const n = randInt(2, 20)
    return { prompt: `${n}^2`, answer: n * n }
  }
  const n = randInt(2, 20)
  return { prompt: `sqrt(${n * n})`, answer: n }
}

export function generateFraction() {
  const a = randInt(1, 9)
  const b = randInt(1, 9)
  const num = a
  const den = b === 0 ? 1 : b
  const gcdFn = (x, y) => (y === 0 ? x : gcdFn(y, x % y))
  const g = gcdFn(num, den) || 1
  return { numerator: num / g, denominator: den / g, decimal: clean(num / den) }
}

// --- PEMDAS strict order expression ------------------------------------------
export function generatePemdas() {
  const a = randInt(2, 9)
  const b = randInt(2, 9)
  const c = randInt(2, 9)
  const d = randInt(2, 9)
  // (a + b) x c - d  /  strictly requires order of operations
  const answer = (a + b) * c - d
  return { prompt: `(${a} + ${b}) \u00d7 ${c} - ${d}`, answer }
}

// --- Level 2: Matrices -------------------------------------------------------
export function generateMatrix2x2() {
  const m = [
    [randInt(-6, 6), randInt(-6, 6)],
    [randInt(-6, 6), randInt(-6, 6)],
  ]
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
  return { matrix: m, det }
}

/** Generates a 2x2 matrix guaranteed to be invertible (det != 0) */
export function generateInvertible2x2() {
  let g = generateMatrix2x2()
  let guard = 0
  while (g.det === 0 && guard < 30) {
    g = generateMatrix2x2()
    guard++
  }
  const [[a, b], [c, d]] = g.matrix
  const inv = [
    [clean(d / g.det), clean(-b / g.det)],
    [clean(-c / g.det), clean(a / g.det)],
  ]
  return { ...g, inverse: inv }
}

export function generateMatrix3x3() {
  const m = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => randInt(-4, 4)))
  const det =
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  return { matrix: m, det }
}

// --- SPLDV / SPLTV linear systems --------------------------------------------
export function generateLinearSystem2Var() {
  // ax + by = e ; cx + dy = f, solved for integer (x, y)
  const x = randInt(-6, 6)
  const y = randInt(-6, 6)
  let a = randInt(-5, 5) || 1
  let b = randInt(-5, 5) || 1
  let c = randInt(-5, 5) || 1
  let d = randInt(-5, 5) || 1
  const det = a * d - b * c
  if (det === 0) {
    d += 1
  }
  const e = a * x + b * y
  const f = c * x + d * y
  return { a, b, e, c, d: d, f, answer: { x, y } }
}

// --- Limits / Derivatives / Integrals (polynomial only, clean coefficients) -
export function generatePolynomial(maxDegree = 2) {
  const degree = randInt(1, maxDegree)
  const coeffs = Array.from({ length: degree + 1 }, () => randInt(-6, 6) || 1)
  return { degree, coeffs } // coeffs[i] is coefficient of x^(degree - i)
}

export function derivativeOf(poly) {
  const { degree, coeffs } = poly
  if (degree === 0) return { degree: 0, coeffs: [0] }
  const newCoeffs = coeffs.slice(0, degree).map((c, i) => c * (degree - i))
  return { degree: degree - 1, coeffs: newCoeffs }
}

export function formatPolynomial(poly) {
  const { degree, coeffs } = poly
  const terms = coeffs.map((c, i) => {
    const power = degree - i
    if (c === 0) return null
    const sign = c < 0 ? '-' : i === 0 ? '' : '+'
    const abs = Math.abs(c)
    const coefStr = abs === 1 && power !== 0 ? '' : `${abs}`
    if (power === 0) return `${sign}${coefStr || abs}`
    if (power === 1) return `${sign}${coefStr}x`
    return `${sign}${coefStr}x^${power}`
  })
  const joined = terms.filter(Boolean).join(' ')
  return joined || '0'
}

export function evaluatePolynomial(poly, x) {
  const { degree, coeffs } = poly
  return coeffs.reduce((acc, c, i) => acc + c * Math.pow(x, degree - i), 0)
}

// --- Conditional probability --------------------------------------------------
export function generateConditionalProbability() {
  // Bag with colored balls; P(A|B) style question.
  const red = randInt(2, 6)
  const blue = randInt(2, 6)
  const total = red + blue
  // P(red on 2nd draw | red on 1st draw), no replacement
  const answer = clean((red - 1) / (total - 1))
  return { red, blue, total, answer }
}

// --- Cryptarithm (Level 3) ---------------------------------------------------
const CLASSIC_CRYPTARITHMS = [
  { w1: 'SEND', w2: 'MORE', w3: 'MONEY' },
  { w1: 'BASE', w2: 'BALL', w3: 'GAMES' },
  { w1: 'TWO', w2: 'TWO', w3: 'FOUR' },
]

function wordToDigits(word, mapping) {
  return word.split('').map((ch) => mapping[ch])
}

function wordValue(word, mapping) {
  return Number(wordToDigits(word, mapping).join(''))
}

/** Brute-force solve a cryptarithm w1 + w2 = w3 for unique letter->digit mapping. */
export function solveCryptarithm({ w1, w2, w3 }) {
  const letters = Array.from(new Set((w1 + w2 + w3).split('')))
  if (letters.length > 10) return null
  const leadingLetters = new Set([w1[0], w2[0], w3[0]])
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  function permute(remainingLetters, remainingDigits, mapping) {
    if (remainingLetters.length === 0) {
      if (wordValue(w1, mapping) + wordValue(w2, mapping) === wordValue(w3, mapping)) {
        return { ...mapping }
      }
      return null
    }
    const letter = remainingLetters[0]
    for (let i = 0; i < remainingDigits.length; i++) {
      const d = remainingDigits[i]
      if (d === 0 && leadingLetters.has(letter)) continue
      const nextMapping = { ...mapping, [letter]: d }
      const nextDigits = remainingDigits.slice(0, i).concat(remainingDigits.slice(i + 1))
      const result = permute(remainingLetters.slice(1), nextDigits, nextMapping)
      if (result) return result
    }
    return null
  }

  return permute(letters, digits, {})
}

export function generateCryptarithm() {
  const puzzle = pick(CLASSIC_CRYPTARITHMS)
  const solution = solveCryptarithm(puzzle)
  return { ...puzzle, solution }
}

/**
 * Algorithmically builds a solvable cryptarithm of the form W1 + W2 = W3
 * where W1 and W2 each have exactly `length` digits (letters), by picking
 * two real numbers, summing them, and mapping every digit that appears to
 * a distinct random letter. Guaranteed solvable since the mapping is built
 * from a real arithmetic fact.
 */
function shuffledAlphabet() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  return letters
}

export function generateCryptarithmByLength(length = 3) {
  const low = Math.pow(10, length - 1)
  const high = Math.pow(10, length) - 1
  const n1 = randInt(low, high)
  const n2 = randInt(low, high)
  const n3 = n1 + n2

  const digitsUsed = Array.from(new Set(`${n1}${n2}${n3}`.split('')))
  const letters = shuffledAlphabet().slice(0, digitsUsed.length)
  const digitToLetter = {}
  digitsUsed.forEach((d, i) => {
    digitToLetter[d] = letters[i]
  })

  const toWord = (num) => String(num).split('').map((d) => digitToLetter[d]).join('')
  const w1 = toWord(n1)
  const w2 = toWord(n2)
  const w3 = toWord(n3)

  const solution = {}
  Object.entries(digitToLetter).forEach(([d, letter]) => {
    solution[letter] = Number(d)
  })

  return { w1, w2, w3, solution, length, resultLength: w3.length }
}

// --- AlphaMath Codebreaker: letter-value chained arithmetic ------------------
/** Maps 1 -> 'a', 2 -> 'b', ... 26 -> 'z' */
export function letterForValue(v) {
  return String.fromCharCode(96 + v)
}

/**
 * Builds a chained arithmetic problem where every operand is expressed as a
 * letter (a=1 ... maxLetter). Mirrors generateChain but keeps every value
 * within [1, maxLetter] so it maps back to a valid letter, and avoids
 * fractional intermediate results.
 */
export function generateLetterChain(maxLetter = 26, steps = 6) {
  let value = randInt(1, maxLetter)
  const chain = [{ type: 'start', value, letter: letterForValue(value) }]
  const ops = ['+', '-', 'x', '/']

  for (let i = 0; i < steps; i++) {
    let op = pick(ops)
    let operand

    if (op === '/') {
      const divisors = []
      for (let d = 1; d <= maxLetter; d++) if (value !== 0 && value % d === 0) divisors.push(d)
      if (divisors.length === 0) op = '+'
      else operand = pick(divisors)
    }
    if (op !== '/') {
      operand = randInt(1, maxLetter)
    }

    let next = value
    if (op === '+') next = value + operand
    if (op === '-') next = value - operand
    if (op === 'x') next = value * operand
    if (op === '/') next = value / operand

    if (Math.abs(next) > 99999) {
      i--
      continue
    }

    chain.push({ type: op, operand, value: next, letter: letterForValue(operand) })
    value = next
  }

  return { chain, answer: clean(value) }
}


// --- Answer-tolerant comparison ----------------------------------------------
export function isCorrectNumeric(userInput, answer, tolerance = 1e-6) {
  const num = parseFloat(String(userInput).trim())
  if (Number.isNaN(num)) return false
  return Math.abs(num - answer) <= tolerance
}
