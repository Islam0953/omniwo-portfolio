/**
 * Wearable Data Sync Service — Simplified Example
 *
 * Normalises health data from multiple wearable providers
 * (Oura, Whoop, etc.) into a unified internal format for
 * the Dynamic Health Score engine.
 *
 * Note: Provider-specific API details, OAuth flows, and
 * proprietary scoring weights are omitted.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WearableProvider = 'oura' | 'whoop';

export interface WearableMetrics {
  userId: string;
  provider: WearableProvider;
  date: string;
  sleep: SleepMetrics | null;
  activity: ActivityMetrics | null;
  recovery: RecoveryMetrics | null;
  syncedAt: Date;
}

export interface SleepMetrics {
  totalMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  lightMinutes: number;
  awakeMinutes: number;
  efficiency: number;        // 0-100
  latencyMinutes: number;
  restingHeartRate: number;
  hrvAverage: number;
}

export interface ActivityMetrics {
  steps: number;
  activeCalories: number;
  totalCalories: number;
  activeMinutes: number;
  strainScore: number;       // normalised 0-21
}

export interface RecoveryMetrics {
  score: number;             // 0-100
  hrvBaseline: number;
  respiratoryRate: number;
  skinTemperatureDelta: number;
}

export interface DailyWearableScore {
  userId: string;
  date: string;
  sleepScore: number;
  activityScore: number;
  recoveryScore: number;
  compositeScore: number;
}

// ---------------------------------------------------------------------------
// Normalisation Pipeline
// ---------------------------------------------------------------------------

/**
 * Sync and normalise wearable data for a user.
 *
 * Pipeline:
 * 1. Fetch raw data from provider API
 * 2. Normalise into unified format
 * 3. Validate data quality (reject incomplete days)
 * 4. Calculate daily wearable scores
 * 5. Feed into Dynamic Health Score engine
 */
export async function syncWearableData(
  userId: string,
  provider: WearableProvider,
  dateRange: { from: string; to: string },
): Promise<DailyWearableScore[]> {
  // 1. Fetch from provider
  const rawData = await fetchProviderData(userId, provider, dateRange);

  // 2. Normalise
  const normalised = rawData.map((day) => normaliseDay(day, provider));

  // 3. Validate — drop days with insufficient data
  const valid = normalised.filter(isValidDay);

  // 4. Score each day
  const scores = valid.map(calculateDailyScore);

  // 5. Persist
  await persistWearableScores(userId, scores);

  return scores;
}

// ---------------------------------------------------------------------------
// Provider Normalisation
// ---------------------------------------------------------------------------

/**
 * Each provider returns data in a different format.
 * We normalise everything into WearableMetrics so the
 * scoring engine doesn't care about the source.
 */
function normaliseDay(
  raw: Record<string, unknown>,
  provider: WearableProvider,
): WearableMetrics {
  switch (provider) {
    case 'oura':
      return normaliseOura(raw);
    case 'whoop':
      return normaliseWhoop(raw);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ---------------------------------------------------------------------------
// Daily Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate a composite wearable score for the day.
 *
 * Weights:
 * - Sleep: primary driver (highest weight)
 * - Recovery: secondary driver
 * - Activity: supporting signal
 *
 * Proprietary weights and thresholds omitted.
 */
function calculateDailyScore(metrics: WearableMetrics): DailyWearableScore {
  const sleepScore = metrics.sleep ? scoreSleep(metrics.sleep) : 0;
  const activityScore = metrics.activity ? scoreActivity(metrics.activity) : 0;
  const recoveryScore = metrics.recovery ? scoreRecovery(metrics.recovery) : 0;

  // Weighted composite — proprietary weights
  const compositeScore = Math.round(
    sleepScore * SLEEP_WEIGHT +
    recoveryScore * RECOVERY_WEIGHT +
    activityScore * ACTIVITY_WEIGHT,
  );

  return {
    userId: metrics.userId,
    date: metrics.date,
    sleepScore,
    activityScore,
    recoveryScore,
    compositeScore: Math.min(100, Math.max(0, compositeScore)),
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isValidDay(metrics: WearableMetrics): boolean {
  // Require at least sleep OR recovery data for a valid day
  const hasSleep = metrics.sleep !== null && metrics.sleep.totalMinutes > 0;
  const hasRecovery = metrics.recovery !== null;
  return hasSleep || hasRecovery;
}

// ---------------------------------------------------------------------------
// Stubs (production uses provider-specific API clients)
// ---------------------------------------------------------------------------

const SLEEP_WEIGHT = 0.45;
const RECOVERY_WEIGHT = 0.35;
const ACTIVITY_WEIGHT = 0.20;

async function fetchProviderData(
  _userId: string, _provider: WearableProvider, _range: { from: string; to: string },
): Promise<Record<string, unknown>[]> { return []; }

function normaliseOura(_raw: Record<string, unknown>): WearableMetrics {
  return {} as WearableMetrics;
}

function normaliseWhoop(_raw: Record<string, unknown>): WearableMetrics {
  return {} as WearableMetrics;
}

function scoreSleep(_sleep: SleepMetrics): number { return 0; }
function scoreActivity(_activity: ActivityMetrics): number { return 0; }
function scoreRecovery(_recovery: RecoveryMetrics): number { return 0; }
async function persistWearableScores(_userId: string, _scores: DailyWearableScore[]): Promise<void> {}
