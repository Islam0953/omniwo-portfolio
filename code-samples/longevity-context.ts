/**
 * Longevity Context Generator — Simplified Example
 *
 * Omniwo's key differentiator: when a marker is within standard clinical
 * range but outside our longevity-optimised range, we explain WHY we
 * flagged it — turning potential frustration into an "aha" moment.
 *
 * Example output:
 *   "A standard laboratory would consider your result of 3.5 mIU/L normal
 *    (their reference range is 0.27–4.2 mIU/L). However, population-level
 *    longevity research shows that the optimal level for long-term health
 *    is 0.5–2.5 mIU/L. Your result is above this optimal range, which is
 *    why we've flagged it — it's an area where small improvements can make
 *    a real difference over time."
 *
 * This is the message that makes users say:
 *   "Oh — this is insight I can't get anywhere else."
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LongevityContextInput {
  code: string;          // Marker code (e.g., 'TSH')
  name: string;          // Human name (e.g., 'Thyroid Stimulating Hormone')
  value: number;         // Actual measured value
  unit: string;          // Unit (e.g., 'mIU/L')
  optimalLow: number;    // Our optimal range lower bound
  optimalHigh: number;   // Our optimal range upper bound
  direction?: 'high' | 'low';
  gender?: 'male' | 'female';
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a longevity context explanation for an amber marker
 * that falls within standard clinical range.
 *
 * Returns null if:
 * - The marker isn't in our clinical range database
 * - The value is NOT within clinical range (genuinely abnormal)
 * - We can't generate a meaningful context
 */
export function generateLongevityContext(
  input: LongevityContextInput,
): string | null {
  const { code, value, unit, optimalLow, optimalHigh, direction, gender } = input;

  // Only generate context if the value IS within standard clinical range
  // (i.e., a normal lab would have said "all fine")
  if (!isWithinClinicalRange(code, value, gender)) {
    return null;
  }

  const clinicalRange = getClinicalRange(code, gender);
  if (!clinicalRange) return null;

  const optimalDisplay = formatOptimalRange(optimalLow, optimalHigh, unit, direction);
  const clinicalDisplay = formatClinicalRange(clinicalRange.low, clinicalRange.high, unit);

  const directionPhrase =
    direction === 'high' ? 'above' :
    direction === 'low' ? 'below' :
    'falls outside';

  return (
    `A standard laboratory would consider your result of ${value} ${unit} normal ` +
    `(their reference range is ${clinicalDisplay}). ` +
    `However, population-level longevity research shows ` +
    `that the optimal level for long-term health is ${optimalDisplay}. ` +
    `Your result is ${directionPhrase} this optimal range, which is why we've flagged it — ` +
    `it's an area where small improvements can make a real difference over time.`
  );
}

// ---------------------------------------------------------------------------
// Clinical Range Helpers (simplified)
// ---------------------------------------------------------------------------

interface ClinicalRange {
  low: number;
  high: number;
}

/** Check if a value falls within standard NHS/clinical reference range */
function isWithinClinicalRange(
  _code: string,
  _value: number,
  _gender?: string,
): boolean {
  // Production version checks against 25+ marker clinical ranges
  // from NHS, NICE, ACB, BTA, BHF guidelines
  return true; // Simplified for example
}

/** Get the clinical range for a marker */
function getClinicalRange(
  _code: string,
  _gender?: string,
): ClinicalRange | null {
  // Production version returns gender-specific ranges where applicable
  return { low: 0, high: 100 }; // Simplified
}

/** Format optimal range as human-readable string */
function formatOptimalRange(
  low: number,
  high: number,
  unit: string,
  direction?: 'high' | 'low',
): string {
  if (direction === 'high' && low <= 0.01) return `below ${high} ${unit}`;
  if (direction === 'low' && high >= 900) return `above ${low} ${unit}`;
  return `${low}–${high} ${unit}`;
}

/** Format clinical range as human-readable string */
function formatClinicalRange(low: number, high: number, unit: string): string {
  if (low <= 0.01) return `up to ${high} ${unit}`;
  if (high >= 900) return `above ${low} ${unit}`;
  return `${low}–${high} ${unit}`;
}
