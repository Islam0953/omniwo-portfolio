/**
 * Food Synergy Engine — Simplified Example
 *
 * Matches a user's personalised food basket against scientific
 * food-food interaction rules to generate actionable tips.
 *
 * Example outputs:
 *   ✅ "Squeeze lemon on your spinach — vitamin C increases iron absorption by 6x"
 *   ⛔ "Don't drink tea with iron-rich meals — tannins block absorption by 60%"
 *
 * Design:
 *   1. Get user's recommended foods from the food basket
 *   2. Get their out-of-range biomarker codes
 *   3. Filter synergy rules by relevant biomarkers
 *   4. Match food groups against the user's basket (fuzzy matching)
 *   5. Generate tips sorted by impact and type
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SynergyTip {
  ruleId: string;
  type: 'enhancer' | 'blocker';
  tip: string;
  timingTip?: string;
  matchedFoodA: string;
  matchedFoodB: string;
  relevantBiomarkers: string[];
  multiplier: number;    // Impact multiplier (higher = more important)
  basis: string;         // Scientific basis
  category: string;
}

export interface SynergyResult {
  enhancerTips: SynergyTip[];
  blockerTips: SynergyTip[];
  rulesEvaluated: number;
  matchesFound: number;
  biomarkersAddressed: string[];
}

export interface SynergyRequest {
  recommendedFoods: string[];
  foodsToReduce?: string[];
  outOfRangeBiomarkers: string[];
}

// ---------------------------------------------------------------------------
// Main Engine
// ---------------------------------------------------------------------------

const MAX_ENHANCER_TIPS = 8;
const MAX_BLOCKER_TIPS = 5;

export function generateSynergyTips(request: SynergyRequest): SynergyResult {
  const { recommendedFoods, foodsToReduce, outOfRangeBiomarkers } = request;

  // 1. Get relevant rules for user's biomarkers
  const relevantRules = getRulesForBiomarkers(outOfRangeBiomarkers);

  // 2. Combine all user foods for matching
  const allUserFoods = [...recommendedFoods, ...(foodsToReduce ?? [])];

  // 3. Match rules against user's food basket
  const enhancerTips: SynergyTip[] = [];
  const blockerTips: SynergyTip[] = [];
  const biomarkersAddressed = new Set<string>();

  for (const rule of relevantRules) {
    const matchA = findBestMatch(rule.foodGroupA, allUserFoods);
    const matchB = findBestMatch(rule.foodGroupB, allUserFoods);

    if (matchA && matchB) {
      // Both food groups found in user's basket — strong match
      const tip = createTip(rule, matchA, matchB);
      rule.relevantBiomarkers.forEach((code) => {
        if (outOfRangeBiomarkers.includes(code)) biomarkersAddressed.add(code);
      });

      if (rule.type === 'enhancer') enhancerTips.push(tip);
      else blockerTips.push(tip);
    } else if (matchA || matchB) {
      // One match — still useful as a suggestion
      const matched = matchA ?? matchB;
      const suggested = matchA
        ? getSuggestedFood(rule.foodGroupB)
        : getSuggestedFood(rule.foodGroupA);

      const tip = createTip(rule, matched!, suggested);
      rule.relevantBiomarkers.forEach((code) => {
        if (outOfRangeBiomarkers.includes(code)) biomarkersAddressed.add(code);
      });

      if (rule.type === 'enhancer') enhancerTips.push(tip);
      else blockerTips.push(tip);
    }
  }

  // 4. Sort by impact and deduplicate
  return {
    enhancerTips: deduplicateAndSort(enhancerTips).slice(0, MAX_ENHANCER_TIPS),
    blockerTips: deduplicateAndSort(blockerTips).slice(0, MAX_BLOCKER_TIPS),
    rulesEvaluated: relevantRules.length,
    matchesFound: enhancerTips.length + blockerTips.length,
    biomarkersAddressed: [...biomarkersAddressed],
  };
}

// ---------------------------------------------------------------------------
// Fuzzy Matching
// ---------------------------------------------------------------------------

/**
 * Fuzzy-match a food group against the user's food list.
 *
 * Handles: exact match, contains match, word-level overlap.
 * Example: "salmon" matches "Atlantic salmon, wild"
 */
function findBestMatch(foodGroup: string[], userFoods: string[]): string | null {
  for (const groupItem of foodGroup) {
    const normalised = groupItem.toLowerCase();
    for (const userFood of userFoods) {
      const normalisedUser = userFood.toLowerCase();

      if (normalisedUser === normalised) return userFood;
      if (normalisedUser.includes(normalised)) return userFood;
      if (normalised.includes(normalisedUser) && normalisedUser.length >= 3) return userFood;

      // Word-level matching for multi-word foods
      const groupWords = normalised.split(/\s+/);
      const userWords = normalisedUser.split(/\s+/);
      const overlap = groupWords.filter((w) =>
        userWords.some((uw) => uw === w || uw.includes(w)),
      );
      if (overlap.length >= Math.ceil(groupWords.length * 0.7) && groupWords.length > 1) {
        return userFood;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers (simplified stubs)
// ---------------------------------------------------------------------------

interface SynergyRule {
  id: string;
  type: 'enhancer' | 'blocker';
  tip: string;
  timingTip?: string;
  foodGroupA: string[];
  foodGroupB: string[];
  relevantBiomarkers: string[];
  multiplier: number;
  basis: string;
  category: string;
}

function getRulesForBiomarkers(_codes: string[]): SynergyRule[] {
  // Production version: 40+ rules filtered by biomarker relevance
  return [];
}

function getSuggestedFood(foodGroup: string[]): string {
  return [...foodGroup].sort((a, b) => a.length - b.length)[0];
}

function createTip(rule: SynergyRule, matchedA: string, matchedB: string): SynergyTip {
  return {
    ruleId: rule.id,
    type: rule.type,
    tip: rule.tip,
    timingTip: rule.timingTip,
    matchedFoodA: matchedA,
    matchedFoodB: matchedB,
    relevantBiomarkers: rule.relevantBiomarkers,
    multiplier: rule.multiplier,
    basis: rule.basis,
    category: rule.category,
  };
}

function deduplicateAndSort(tips: SynergyTip[]): SynergyTip[] {
  const seen = new Set<string>();
  return tips
    .filter((t) => { if (seen.has(t.ruleId)) return false; seen.add(t.ruleId); return true; })
    .sort((a, b) => b.multiplier - a.multiplier);
}
