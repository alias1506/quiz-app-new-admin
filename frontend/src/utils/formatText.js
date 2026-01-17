/**
 * Format text with scientific notation, subscripts, superscripts, Greek letters, and mathematical symbols
 * - Chemical formulas: H2O → H₂O, CO2 → CO₂
 * - Superscripts: ^{2} or ^2 → ²
 * - Subscripts: _{n} or _n → ₙ
 * - Greek letters: alpha → α, beta → β, gamma → γ, etc.
 * - Mathematical symbols: pi → π, infinity → ∞, etc.
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
  'sum': '∑',
  'product': '∏',
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
  'therefore': '∴',
  'because': '∵',
  'forall': '∀',
  'exists': '∃',
  'in': '∈',
  'notin': '∉',
  'subset': '⊂',
  'supset': '⊃',
  'union': '∪',
  'intersection': '∩',
  'emptyset': '∅',
  'angle': '∠',
  'perpendicular': '⊥',
  'parallel': '∥'
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
      // Math superscripts: ^{...} or ^word
      .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
      .replace(/\^(\w+)/g, '<sup>$1</sup>')
      // Math subscripts: _{...} or _word
      .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
      .replace(/_(\w+)/g, '<sub>$1</sub>')
  )
}
