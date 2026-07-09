// ---------------------------------------------------------------------------
// matrixTransforms.js — 2D coordinate transforms for Memory Matrix and
// Level 3 geometric transformation puzzles.
// ---------------------------------------------------------------------------

import { randInt, pick, clean } from './mathGenerators.js'

export function rotatePoint([x, y], degrees, origin = [0, 0]) {
  const rad = (degrees * Math.PI) / 180
  const dx = x - origin[0]
  const dy = y - origin[1]
  // Clockwise rotation on screen coords (y grows downward is handled at render layer)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const rx = dx * cos + dy * sin
  const ry = -dx * sin + dy * cos
  return [clean(rx + origin[0]), clean(ry + origin[1])]
}

export function translatePoint([x, y], [tx, ty]) {
  return [clean(x + tx), clean(y + ty)]
}

export function reflectPoint([x, y], axis = 'x') {
  if (axis === 'x') return [x, -y]
  if (axis === 'y') return [-x, y]
  return [y, x] // reflect across y = x
}

export function generateTriangle() {
  const pts = Array.from({ length: 3 }, () => [randInt(-5, 5), randInt(-5, 5)])
  return pts
}

/** Builds a random composed transform (rotate then translate) with a plain-English description. */
export function generateTransformPrompt() {
  const degrees = pick([90, 180, 270])
  const tx = randInt(-4, 4)
  const ty = randInt(-4, 4)
  const description = `Rotated ${degrees}\u00b0 clockwise around (0,0), then translated by T(${tx}, ${ty}).`
  const apply = (point) => translatePoint(rotatePoint(point, degrees), [tx, ty])
  return { degrees, tx, ty, description, apply }
}
