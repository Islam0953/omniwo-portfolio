/**
 * Scoring Engine — Simplified Example
 *
 * Demonstrates how Omniwo calculates health scores using
 * longevity-optimised reference ranges instead of standard clinical ranges.
 *
 * Note: This is a simplified, sanitized version for portfolio purposes.
 * The production engine includes additional complexity for edge cases,
 * age/sex stratification, and weighted category scoring.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export enum MarkerStatus {
  green = 'green',           // Optimal for longevity
  amber = 'amber',           // Borderline — room for improvement
  red = 'red',               // Out of optimal range
  urgent_red = 'urgent_red', // Requires attention
}

export interface BiomarkerRanges {
  greenLow: number;
  greenHigh: number;
  amberLow: number;
  amberHigh: number;
  redLow: number;
  redHigh: number;
  direction: 'high_bad' | 'low_bad' | 'both_bad';
}

export interface MarkerResult {
  code: string;
  name: string;
  value: number;
  unit: string;
  status: MarkerStatus;
  score: number;        // 0-100 per marker
  category: string;
}

export interface HealthScore {
  overall: number;         // 0-100
  band: string;            // "Excellent" | "Very Good" | etc.
  stars: number;           // 1-5
  categories: CategoryScore[];
  interpretation: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  weight: number;
  markerCount: number;
  statusDistribution: Record<MarkerStatus, number>;
}

// ---------------------------------------------------------------------------
// Status Determination
// ---------------------------------------------------------------------------

/**
 * Determine the longevity status of a biomarker value.
 *
 * Unlike standard labs that use wide "normal" ranges,
 * we use tight optimal ranges based on population research.
 *
 * Example: Standard lab TSH range is 0.27–4.2 mIU/L
 *          Our optimal range is 0.5–2.5 mIU/L
 *          A value of 3.5 would be "normal" at a standard lab
 *          but "amber" (borderline) in our system.
 */
export function determineStatus(
  value: number,
  ranges: BiomarkerRanges,
): MarkerStatus {
  // Green: within our optimal range
  if (value >= ranges.greenLow && value <= ranges.greenHigh) {
    return MarkerStatus.green;
  }

  // Amber: outside optimal but within borderline
  if (value >= ranges.amberLow && value <= ranges.amberHigh) {
    return MarkerStatus.amber;
  }

  // Red: outside borderline but within extended range
  if (value >= ranges.redLow && value <= ranges.redHigh) {
    return MarkerStatus.red;
  }

  // Urgent: beyond all ranges
  return MarkerStatus.urgent_red;
}

// ---------------------------------------------------------------------------
// Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate a per-marker score (0-100) based on how close
 * the value is to the optimal range centre.
 *
 * Green centre = 100, edges of amber = ~60, edges of red = ~30
 */
export function calculateMarkerScore(
  value: number,
  ranges: BiomarkerRanges,
): number {
  const greenMid = (ranges.greenLow + ranges.greenHigh) / 2;
  const greenSpan = (ranges.greenHigh - ranges.greenLow) / 2;

  if (greenSpan === 0) return value === greenMid ? 100 : 0;

  // Distance from optimal centre, normalised
  const distance = Math.abs(value - greenMid) / greenSpan;

  if (distance <= 1) {
    // Within green zone: 85-100
    return Math.round(100 - (distance * 15));
  }

  // Beyond green: exponential decay
  const decayed = 85 * Math.exp(-0.5 * (distance - 1));
  return Math.max(0, Math.round(decayed));
}

/**
 * Calculate the overall health score from individual marker results.
 *
 * Uses weighted category scoring — each biomarker category
 * contributes proportionally to the total score.
 */
export function calculateHealthScore(
  markers: MarkerResult[],
  categoryWeights: Record<string, number>,
): HealthScore {
  // Group markers by category
  const grouped = new Map<string, MarkerResult[]>();
  for (const marker of markers) {
    const group = grouped.get(marker.category) ?? [];
    group.push(marker);
    grouped.set(marker.category, group);
  }

  // Calculate per-category scores
  const categories: CategoryScore[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [name, categoryMarkers] of grouped) {
    const avgScore =
      categoryMarkers.reduce((sum, m) => sum + m.score, 0) /
      categoryMarkers.length;

    const weight = categoryWeights[name] ?? 1;
    weightedSum += avgScore * weight;
    totalWeight += weight;

    // Count status distribution
    const dist = { green: 0, amber: 0, red: 0, urgent_red: 0 };
    for (const m of categoryMarkers) {
      dist[m.status]++;
    }

    categories.push({
      name,
      score: Math.round(avgScore),
      weight,
      markerCount: categoryMarkers.length,
      statusDistribution: dist,
    });
  }

  const overall = totalWeight > 0
    ? Math.round(weightedSum / totalWeight)
    : 0;

  return {
    overall,
    band: getBand(overall),
    stars: getStars(overall),
    categories: categories.sort((a, b) => b.weight - a.weight),
    interpretation: getInterpretation(overall),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBand(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Attention';
  if (score >= 35) return 'Concerning';
  return 'Action Required';
}

function getStars(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 45) return 2;
  return 1;
}

function getInterpretation(score: number): string {
  if (score >= 90) return 'Outstanding! Your biomarkers show excellent optimisation across the board.';
  if (score >= 80) return 'Great work! Your overall health picture looks very positive.';
  if (score >= 70) return 'Good foundation. A few areas could benefit from attention.';
  if (score >= 60) return 'Decent baseline. Several markers suggest room for improvement.';
  return 'Some markers need attention. Let\'s focus on the quick wins first.';
}
