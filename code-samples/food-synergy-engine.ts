/**
 * Food Synergy Engine — Simplified Example
 *
 * Matches a user's personalised food basket against proprietary
 * food-food interaction rules to generate actionable tips.
 *
 * Example outputs:
 *   ✅ "Combine these foods — absorption increases significantly"
 *   ⛔ "Avoid this combination — it blocks nutrient uptake"
 *
 * Note: Proprietary rules database and matching logic simplified.
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
  impact: number;
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

export function generateSynergyTips(request: SynergyRequest): SynergyResult {
  const { recommendedFoods, foodsToReduce, outOfRangeBiomarkers } = request;

  // 1. Filter rules relevant to user's biomarker profile
  const relevantRules = getRulesForBiomarkers(outOfRangeBiomarkers);

  // 2. Combine all user foods
  const allUserFoods = [...recommendedFoods, ...(foodsToReduce ?? [])];

  // 3. Match rules against user's actual food basket
  const enhancerTips: SynergyTip[] = [];
  const blockerTips: SynergyTip[] = [];
  const biomarkersAddressed = new Set<string>();

  for (const rule of relevantRules) {
    const matchA = findBestMatch(rule.foodGroupA, allUserFoods);
    const matchB = findBestMatch(rule.foodGroupB, allUserFoods);

    if (matchA || matchB) {
      const tip = createTip(rule, matchA ?? rule.foodGroupA[0], matchB ?? rule.foodGroupB[0]);

      rule.relevantBiomarkers.forEach((code) => {
        if (outOfRangeBiomarkers.includes(code)) biomarkersAddressed.add(code);
      });

      if (rule.type === 'enhancer') enhancerTips.push(tip);
      else blockerTips.push(tip);
    }
  }

  // 4. Deduplicate, sort by impact, limit
  return {
    enhancerTips: deduplicateAndSort(enhancerTips).slice(0, 8),
    blockerTips: deduplicateAndSort(blockerTips).slice(0, 5),
    rulesEvaluated: relevantRules.length,
    matchesFound: enhancerTips.length + blockerTips.length,
    biomarkersAddressed: [...biomarkersAddressed],
  };
}

// ---------------------------------------------------------------------------
// Fuzzy Food Matching
// ---------------------------------------------------------------------------

/**
 * Multi-strategy fuzzy matching: exact, contains, word-level overlap.
 * Handles variations like "salmon" matching "Atlantic salmon, wild".
 */
function findBestMatch(foodGroup: string[], userFoods: string[]): string | null {
  for (const groupItem of foodGroup) {
    const normalised = groupItem.toLowerCase();
    for (const userFood of userFoods) {
      const normalisedUser = userFood.toLowerCase();

      // Exact, contains, reverse contains
      if (normalisedUser === normalised) return userFood;
      if (normalisedUser.includes(normalised)) return userFood;
      if (normalised.includes(normalisedUser) && normalisedUser.length >= 3) return userFood;

      // Word-level overlap for multi-word food names
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
// Helpers (stubs — production uses proprietary rule database)
// ---------------------------------------------------------------------------

interface SynergyRule {
  id: string;
  type: 'enhancer' | 'blocker';
  tip: string;
  foodGroupA: string[];
  foodGroupB: string[];
  relevantBiomarkers: string[];
  impact: number;
  category: string;
}

function getRulesForBiomarkers(_codes: string[]): SynergyRule[] { return []; }

function createTip(rule: SynergyRule, a: string, b: string): SynergyTip {
  return { ruleId: rule.id, type: rule.type, tip: rule.tip, matchedFoodA: a, matchedFoodB: b, relevantBiomarkers: rule.relevantBiomarkers, impact: rule.impact, category: rule.category };
}

function deduplicateAndSort(tips: SynergyTip[]): SynergyTip[] {
  const seen = new Set<string>();
  return tips
    .filter((t) => { if (seen.has(t.ruleId)) return false; seen.add(t.ruleId); return true; })
    .sort((a, b) => b.impact - a.impact);
}
