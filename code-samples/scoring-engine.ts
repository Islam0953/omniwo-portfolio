/**
 * Scoring Engine — Simplified Example
 *
 * Demonstrates the architecture of our multi-layer scoring system.
 * Production version includes additional complexity for edge cases,
 * demographic stratification, and weighted category scoring.
 *
 * Note: Proprietary ranges, thresholds, and weights are omitted.
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
  score: number;
  category: string;
}

export interface HealthScore {
  overall: number;
  band: string;
  stars: number;
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
 * we apply proprietary optimal ranges derived from
 * population-level research.
 */
export function determineStatus(
  value: number,
  ranges: BiomarkerRanges,
): MarkerStatus {
  if (value >= ranges.greenLow && value <= ranges.greenHigh) {
    return MarkerStatus.green;
  }
  if (value >= ranges.amberLow && value <= ranges.amberHigh) {
    return MarkerStatus.amber;
  }
  if (value >= ranges.redLow && value <= ranges.redHigh) {
    return MarkerStatus.red;
  }
  return MarkerStatus.urgent_red;
}

// ---------------------------------------------------------------------------
// Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate a per-marker score (0-100) based on proximity
 * to the optimal range centre. Proprietary decay function.
 */
export function calculateMarkerScore(
  value: number,
  ranges: BiomarkerRanges,
): number {
  const greenMid = (ranges.greenLow + ranges.greenHigh) / 2;
  const greenSpan = (ranges.greenHigh - ranges.greenLow) / 2;
  if (greenSpan === 0) return value === greenMid ? 100 : 0;

  const distance = Math.abs(value - greenMid) / greenSpan;

  // Within optimal zone
  if (distance <= 1) {
    return Math.round(100 - (distance * 15));
  }

  // Beyond optimal: proprietary decay curve
  const decayed = 85 * Math.exp(-0.5 * (distance - 1));
  return Math.max(0, Math.round(decayed));
}

/**
 * Calculate the overall health score from individual marker results.
 * Uses weighted category scoring — proprietary weights per category.
 */
export function calculateHealthScore(
  markers: MarkerResult[],
  categoryWeights: Record<string, number>,
): HealthScore {
  const grouped = new Map<string, MarkerResult[]>();
  for (const marker of markers) {
    const group = grouped.get(marker.category) ?? [];
    group.push(marker);
    grouped.set(marker.category, group);
  }

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

    const dist = { green: 0, amber: 0, red: 0, urgent_red: 0 };
    for (const m of categoryMarkers) dist[m.status]++;

    categories.push({
      name,
      score: Math.round(avgScore),
      weight,
      markerCount: categoryMarkers.length,
      statusDistribution: dist,
    });
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

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
  if (score >= 90) return 'Outstanding! Your biomarkers show excellent optimisation.';
  if (score >= 80) return 'Great work! Your overall health picture looks very positive.';
  if (score >= 70) return 'Good foundation. A few areas could benefit from attention.';
  if (score >= 60) return 'Decent baseline. Several markers suggest room for improvement.';
  return 'Some markers need attention. Let\'s focus on the quick wins first.';
}
