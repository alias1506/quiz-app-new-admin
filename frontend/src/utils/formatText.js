/**
 * Format text with scientific notation, subscripts, superscripts, Greek letters, mathematical symbols, and fractions
 * - Chemical formulas: H2O → H₂O, CO2 → CO₂
 * - Superscripts: ^{2} or ^2 → ²
 * - Subscripts: _{n} or _n → ₙ
 * - Greek letters: alpha → α, beta → β, gamma → γ, etc.
 * - Mathematical symbols: pi → π, infinity → ∞, etc.
 * - Fractions: /frac{1}{2} → ½, -/frac1 2 → -1/2
 */

// Greek letters mapping (lowercase and uppercase)
const greekLetters = {
  // Lowercase Greek letters
  'alpha': 'α',
  'beta': 'β',
  'gamma': 'γ',
  'delta': 'δ',
  'epsilon': 'ε',
  'zeta': 'ζ',
  'eta': 'η',
  'theta': 'θ',
  'iota': 'ι',
  'kappa': 'κ',
  'lambda': 'λ',
  'mu': 'μ',
  'nu': 'ν',
  'xi': 'ξ',
  'omicron': 'ο',
  'pi': 'π',
  'rho': 'ρ',
  'sigma': 'σ',
  'tau': 'τ',
  'upsilon': 'υ',
  'phi': 'φ',
  'chi': 'χ',
  'psi': 'ψ',
  'omega': 'ω',

  // Uppercase Greek letters
  'Alpha': 'Α',
  'Beta': 'Β',
  'Gamma': 'Γ',
  'Delta': 'Δ',
  'Epsilon': 'Ε',
  'Zeta': 'Ζ',
  'Eta': 'Η',
  'Theta': 'Θ',
  'Iota': 'Ι',
  'Kappa': 'Κ',
  'Lambda': 'Λ',
  'Mu': 'Μ',
  'Nu': 'Ν',
  'Xi': 'Ξ',
  'Omicron': 'Ο',
  'Pi': 'Π',
  'Rho': 'Ρ',
  'Sigma': 'Σ',
  'Tau': 'Τ',
  'Upsilon': 'Υ',
  'Phi': 'Φ',
  'Chi': 'Χ',
  'Psi': 'Ψ',
  'Omega': 'Ω'
}

// Mathematical symbols mapping
const mathSymbols = {
  'infinity': '∞',
  'plusminus': '±',
  'pm': '±',
  'times': '×',
  'divide': '÷',
  'neq': '≠',
  'leq': '≤',
  'geq': '≥',
  'approx': '≈',
  'equiv': '≡',
  'propto': '∝',
  'partial': '∂',
  'nabla': '∇',
  'integral': '∫',
  'sqrt': '√',
  'degree': '°',
  'prime': '′',
  'doubleprime': '″',
  'arrow': '→',
  'leftarrow': '←',
  'rightarrow': '→',
  'uparrow': '↑',
  'downarrow': '↓',
  'leftrightarrow': '↔',
  'notin': '∉',
  'subset': '⊂',
  'supset': '⊃',
  'union': '∪',
  'intersection': '∩',
  'emptyset': '∅'
}

// Common fraction Unicode characters
const unicodeFractions = {
  '1/2': '½',
  '1/3': '⅓',
  '2/3': '⅔',
  '1/4': '¼',
  '3/4': '¾',
  '1/5': '⅕',
  '2/5': '⅖',
  '3/5': '⅗',
  '4/5': '⅘',
  '1/6': '⅙',
  '5/6': '⅚',
  '1/8': '⅛',
  '3/8': '⅜',
  '5/8': '⅝',
  '7/8': '⅞'
}

/**
 * Format matrix notation like [3 1][-1 2] into a proper matrix display
 */
const formatMatrix = (text) => {
  // Match consecutive bracket groups - more flexible pattern
  // Matches [any content][any content] where content can be numbers, spaces, negatives, letters
  const matrixPattern = /(\[[^\]]+\]){2,}/g

  return text.replace(matrixPattern, (match) => {
    // Extract individual rows
    const rows = match.match(/\[([^\]]+)\]/g)
    if (!rows || rows.length < 2) return match

    // Parse each row's elements - split by whitespace or commas
    const parsedRows = rows.map(row => {
      const content = row.replace(/[\[\]]/g, '').trim()
      // Split by spaces, commas, or tabs
      const elements = content.split(/[\s,]+/).filter(el => el.length > 0)
      return elements
    })

    // Skip if no valid rows
    if (parsedRows.length === 0 || parsedRows[0].length === 0) return match

    // Check if all rows have the same number of elements
    const cols = parsedRows[0].length
    if (!parsedRows.every(row => row.length === cols)) return match

    // Build HTML matrix
    const matrixHTML = parsedRows.map(row =>
      `<div style="display: flex; justify-content: space-around; line-height: 1.4;">
        ${row.map(el => `<span style="min-width: 2.5em; text-align: center;">${el}</span>`).join('')}
      </div>`
    ).join('')

    return `<span style="display: inline-flex; align-items: center; position: relative; padding: 0.2em 0.8em; margin: 0 0.3em;">
      <span style="position: absolute; left: 0; top: 0; bottom: 0; width: 0.15em; border-left: 2px solid currentColor; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor;"></span>
      <span style="display: inline-block; padding: 0 0.3em;">
        ${matrixHTML}
      </span>
      <span style="position: absolute; right: 0; top: 0; bottom: 0; width: 0.15em; border-right: 2px solid currentColor; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor;"></span>
    </span>`
  })
}

export const formatText = (text) => {
  if (!text) return ''

  // First escape HTML characters to prevent rendering them as tags
  let safeText = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Format matrices FIRST (before other processing)
  safeText = formatMatrix(safeText)

  // Handle fraction notation: /frac{numerator}{denominator} or /fracNumerator Denominator
  // Match patterns like: /frac{1}{2}, /frac1 2, -/frac1 2
  safeText = safeText.replace(/([-]?)\/frac\s*\{?(\d+)\}?\s*\{?(\d+)\}?/g, (match, sign, num, den) => {
    const fractionKey = `${num}/${den}`
    const unicodeFrac = unicodeFractions[fractionKey]

    if (unicodeFrac) {
      // Use Unicode fraction if available
      return `${sign}${unicodeFrac}`
    } else {
      // Otherwise use regular fraction notation with sup/sub
      return `${sign}<sup>${num}</sup>/<sub>${den}</sub>`
    }
  })

  // Handle simple fraction patterns: 1/2, 3/4, etc.
  safeText = safeText.replace(/\b(\d+)\/(\d+)\b/g, (match, num, den) => {
    const fractionKey = `${num}/${den}`
    const unicodeFrac = unicodeFractions[fractionKey]

    if (unicodeFrac) {
      return unicodeFrac
    } else {
      return `<sup>${num}</sup>/<sub>${den}</sub>`
    }
  })

  // Replace Greek letters (case-sensitive)
  Object.entries(greekLetters).forEach(([name, symbol]) => {
    // Use word boundaries to match whole words only
    const regex = new RegExp(`\\b${name}\\b`, 'g')
    safeText = safeText.replace(regex, symbol)
  })

  // Replace mathematical symbols
  Object.entries(mathSymbols).forEach(([name, symbol]) => {
    const regex = new RegExp(`\\b${name}\\b`, 'g')
    safeText = safeText.replace(regex, symbol)
  })

  return (
    safeText
      // Chemical formulas: Capital letter + optional lowercase + number (e.g., H2, CO2, He4)
      .replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>')
      // Math superscripts with braces or parentheses: A^{-1} or A^(3/2)
      .replace(/\^\s*\{([^}]+)\}/g, '<sup>$1</sup>')
      .replace(/\^\s*\(([^)]+)\)/g, '<sup>$1</sup>')
      // Match alphanumeric + Greek letters + common math symbols
      .replace(/\^\s*([-+]?[\w\u0370-\u03FF\u2200-\u22FF]+)/g, '<sup>$1</sup>')
      // Handle space between ^ and character like "A ^ - λ"
      .replace(/\^\s*(-\s*[\w\u0370-\u03FF\u2200-\u22FF]+)/g, (match, capture) => `<sup>${capture.replace(/\s+/g, '')}</sup>`)
      // Math subscripts with braces or parentheses: A_{n} or A_(2)
      .replace(/_\s*\{([^}]+)\}/g, '<sub>$1</sub>')
      .replace(/_\s*\(([^)]+)\)/g, '<sub>$1</sub>')
      .replace(/_\s*([\w\u0370-\u03FF\u2200-\u22FF]+)/g, '<sub>$1</sub>')
  )
}
