/**
 * Longevity Context Generator — Simplified Example
 *
 * When a marker is within standard clinical range but outside our
 * proprietary optimal range, we explain WHY we flagged it.
 *
 * This is what turns "why are you telling me I'm not fine?"
 * into "this is insight I can't get anywhere else."
 *
 * Note: Clinical range database and proprietary thresholds omitted.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LongevityContextInput {
  code: string;
  name: string;
  value: number;
  unit: string;
  optimalLow: number;
  optimalHigh: number;
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
 * - Not in our clinical range database
 * - Value is genuinely abnormal (not a longevity-specific flag)
 * - We can't generate meaningful context
 */
export function generateLongevityContext(
  input: LongevityContextInput,
): string | null {
  const { code, value, unit, optimalLow, optimalHigh, direction, gender } = input;

  // Only generate when the value IS within standard clinical range
  if (!isWithinClinicalRange(code, value, gender)) {
    return null;
  }

  const clinicalRange = getClinicalRange(code, gender);
  if (!clinicalRange) return null;

  const optimalDisplay = formatRange(optimalLow, optimalHigh, unit, direction);
  const clinicalDisplay = formatRange(clinicalRange.low, clinicalRange.high, unit);

  const directionPhrase =
    direction === 'high' ? 'above' :
    direction === 'low' ? 'below' :
    'falls outside';

  return (
    `A standard laboratory would consider your result of ${value} ${unit} normal ` +
    `(their reference range is ${clinicalDisplay}). ` +
    `However, population-level longevity research shows ` +
    `that the optimal level for long-term health is ${optimalDisplay}. ` +
    `Your result is ${directionPhrase} this optimal range, which is why ` +
    `we've flagged it — it's an area where small improvements can make ` +
    `a real difference over time.`
  );
}

// ---------------------------------------------------------------------------
// Helpers (simplified stubs — production uses proprietary range database)
// ---------------------------------------------------------------------------

interface Range { low: number; high: number; }

function isWithinClinicalRange(_code: string, _value: number, _gender?: string): boolean {
  // Production: checks against proprietary clinical range database
  return true;
}

function getClinicalRange(_code: string, _gender?: string): Range | null {
  // Production: returns gender-specific ranges where applicable
  return null;
}

function formatRange(low: number, high: number, unit: string, _direction?: string): string {
  return `${low}–${high} ${unit}`;
}
