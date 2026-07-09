import { pick, randInt } from './mathGenerators.js'

// ---------------------------------------------------------------------------
// logicGenerators.js — syllogism, truth-table and gate puzzle generation.
//
// The syllogism engine below is a genuine categorical-logic solver rather
// than a fixed set of phrase templates: it builds two random premises (each
// Universal-Affirmative "All X are Y", Universal-Negative "No X are Y",
// Particular-Affirmative "Some X are Y", or Particular-Negative "Some X are
// not Y"), then derives the ground-truth answer by reasoning over all 8
// possible Venn-diagram regions of the three terms (Subject, Middle,
// Predicate). This makes the generator fully self-sufficient — every run
// produces a fresh, logically sound puzzle instead of picking from a bank
// of pre-written cases.
// ---------------------------------------------------------------------------

// Vocabulary: category + its natural predicate phrase, e.g. "musicians" / "can sing".
// Kept generous (18 entries) so premise terms rarely repeat across rounds.
const VOCAB = [
  { plural: 'accountants', singular: 'accountant', predicate: 'can calculate' },
  { plural: 'musicians', singular: 'musician', predicate: 'can sing' },
  { plural: 'engineers', singular: 'engineer', predicate: 'can build bridges' },
  { plural: 'painters', singular: 'painter', predicate: 'can paint murals' },
  { plural: 'runners', singular: 'runner', predicate: 'can sprint fast' },
  { plural: 'chefs', singular: 'chef', predicate: 'can cook well' },
  { plural: 'pilots', singular: 'pilot', predicate: 'can fly a plane' },
  { plural: 'writers', singular: 'writer', predicate: 'can write novels' },
  { plural: 'dancers', singular: 'dancer', predicate: 'can dance' },
  { plural: 'scientists', singular: 'scientist', predicate: 'can run experiments' },
  { plural: 'sailors', singular: 'sailor', predicate: 'can navigate by stars' },
  { plural: 'coders', singular: 'coder', predicate: 'can write algorithms' },
  { plural: 'gardeners', singular: 'gardener', predicate: 'can grow vegetables' },
  { plural: 'archers', singular: 'archer', predicate: 'can hit a target' },
  { plural: 'climbers', singular: 'climber', predicate: 'can scale cliffs' },
  { plural: 'photographers', singular: 'photographer', predicate: 'can develop film' },
  { plural: 'linguists', singular: 'linguist', predicate: 'can speak five languages' },
  { plural: 'astronomers', singular: 'astronomer', predicate: 'can chart stars' },
]

const NAMES = ['Budi', 'Sari', 'Andi', 'Rina', 'Dewi', 'Tono', 'Maya', 'Eko', 'Lina', 'Fajar', 'Nadia', 'Rizky']

// The four classical categorical statement types.
const STATEMENT_TYPES = ['A', 'E', 'I', 'O'] // All / No / Some / Some-not

function pickDistinctVocab(n) {
  const shuffled = [...VOCAB].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/** Phrases a statement of `type` relating a plural subject term to a plural object term. */
function phraseCategoryStatement(type, subjPlural, objPlural) {
  switch (type) {
    case 'A':
      return `All ${subjPlural} are ${objPlural}.`
    case 'E':
      return `No ${subjPlural} are ${objPlural}.`
    case 'I':
      return `Some ${subjPlural} are ${objPlural}.`
    case 'O':
    default:
      return `Some ${subjPlural} are not ${objPlural}.`
  }
}

/** Phrases a statement of `type` relating a plural subject term directly to a predicate phrase (e.g. "can sing"). */
function phrasePredicateStatement(type, subjPlural, predicate) {
  const negatedPredicate = predicate.replace(/^can /, "can't ")
  switch (type) {
    case 'A':
      return `All ${subjPlural} ${predicate}.`
    case 'E':
      return `No ${subjPlural} ${predicate}.`
    case 'I':
      return `Some ${subjPlural} ${predicate}.`
    case 'O':
    default:
      return `Some ${subjPlural} ${negatedPredicate}.`
  }
}

// --- Region-based categorical logic solver ----------------------------------
// Three terms S (subject), M (middle), P (predicate) partition the world into
// 8 regions indexed by the bits (s,m,p). A Universal statement forbids
// ("forces empty") two of those regions; Particular statements only assert
// existence elsewhere and don't further constrain which region a *named*
// individual could occupy, so they're irrelevant to the region-emptiness
// bookkeeping used to answer "is the named individual necessarily P?".
function regionsMatching(constraints) {
  const indices = []
  for (let idx = 0; idx < 8; idx++) {
    const s = (idx >> 2) & 1
    const m = (idx >> 1) & 1
    const p = idx & 1
    const vals = { S: s, M: m, P: p }
    const ok = Object.entries(constraints).every(([k, v]) => vals[k] === v)
    if (ok) indices.push(idx)
  }
  return indices
}

function applyUniversalConstraint(forcedEmpty, type, X, Y) {
  if (type === 'A') regionsMatching({ [X]: 1, [Y]: 0 }).forEach((i) => forcedEmpty.add(i))
  if (type === 'E') regionsMatching({ [X]: 1, [Y]: 1 }).forEach((i) => forcedEmpty.add(i))
  // 'I' and 'O' are existential — they don't forbid any region.
}

/**
 * Given premise1 (relates Middle -> Predicate) and premise2 (relates Subject
 * -> Middle) types, determines whether a named individual known to be in S
 * is Definitely part of P, Definitely not part of P, or it can't be
 * determined from the premises alone.
 */
function deriveConclusion(premise1Type, premise2Type) {
  const forcedEmpty = new Set()
  applyUniversalConstraint(forcedEmpty, premise1Type, 'M', 'P')
  applyUniversalConstraint(forcedEmpty, premise2Type, 'S', 'M')

  const candidates = []
  for (const m of [0, 1]) {
    for (const p of [0, 1]) {
      const idx = (1 << 2) | (m << 1) | p // s = 1 fixed
      if (!forcedEmpty.has(idx)) candidates.push({ m, p })
    }
  }

  if (candidates.length === 0) return 'Not Necessarily' // degenerate/vacuous premises — stay conservative
  const allP = candidates.every((c) => c.p === 1)
  const noneP = candidates.every((c) => c.p === 0)
  if (allP) return 'Definitely Yes'
  if (noneP) return 'Definitely No'
  return 'Not Necessarily'
}

// Weighted pick so Universal statements (which actually constrain the
// conclusion) show up a bit more often than purely existential ones —
// keeps the mix of "Definitely Yes/No" vs "Not Necessarily" answers varied
// rather than one dominating.
function pickStatementType() {
  const weighted = ['A', 'A', 'E', 'E', 'I', 'O']
  return pick(weighted)
}

export function generateSyllogism() {
  const [sTerm, mTerm, pTerm] = pickDistinctVocab(3)
  const name = pick(NAMES)

  const premise1Type = pickStatementType() // relates M -> P
  const premise2Type = pickStatementType() // relates S -> M

  const premise1 = phrasePredicateStatement(premise1Type, mTerm.plural, pTerm.predicate)
  const premise2 = phraseCategoryStatement(premise2Type, sTerm.plural, mTerm.plural)
  const premise3 = `${name} is a${/^[aeiou]/i.test(sTerm.singular) ? 'n' : ''} ${sTerm.singular}.`

  const answer = deriveConclusion(premise1Type, premise2Type)

  return {
    premises: [premise1, premise2, premise3],
    question: `Can ${name} ${pTerm.predicate.replace(/^can /, '')}?`,
    answer,
  }
}

// --- Truth tables / logic gates (Level 3) ------------------------------------
const GATES = {
  NAND: (a, b) => (a && b ? 0 : 1),
  NOR: (a, b) => (!a && !b ? 1 : 0),
  XOR: (a, b) => (a !== b ? 1 : 0),
  XNOR: (a, b) => (a === b ? 1 : 0),
}

export function generateGateQuestion() {
  const gateName = pick(Object.keys(GATES))
  const a = randInt(0, 1)
  const b = randInt(0, 1)
  const answer = GATES[gateName](!!a, !!b)
  return { gateName, a, b, answer }
}

export function generateTruthTable(gateName) {
  const fn = GATES[gateName]
  const rows = []
  for (const a of [0, 1]) {
    for (const b of [0, 1]) {
      rows.push({ a, b, out: fn(!!a, !!b) })
    }
  }
  return rows
}
