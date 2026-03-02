# Omniwo — Longevity Intelligence Platform

> **We show people what standard labs miss — and tell them exactly what to do about it.**

Omniwo is a longevity-focused health platform launching in the UK. We combine lab-grade blood testing (40–90 biomarkers) with wearable device data, AI-powered insights, and personalised nutrition to help people understand and optimise their biology.

We are not a diagnostic service. We are a **wellness intelligence platform** that uses longevity-optimised reference ranges instead of standard clinical "normal" ranges — catching patterns that standard labs miss, and explaining them in human language, not medical jargon.

---

## The Problem

Standard blood tests tell you: *"Your results are normal."*

But "normal" means "not sick yet." For people who want to **optimise** — not just avoid disease — standard ranges are too wide. A standard lab considers TSH of 4.0 mIU/L "normal." Longevity research shows the optimal range is 0.5–2.5.

**We bridge that gap.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (PWA)                         │
│              Mobile-first responsive web app                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FIREBASE CLOUD FUNCTIONS                  │
│                    Node 20 · TypeScript                     │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  API Layer   │  │  Webhook     │  │  Scheduled Jobs   │  │
│  │  (Express)   │  │  Handlers    │  │  (Cron triggers)  │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                │                    │             │
│         ▼                ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CORE ENGINE LAYER                       │   │
│  │                                                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐  │   │
│  │  │  Scoring    │ │  Insight   │ │  Nutrition       │  │   │
│  │  │  Engine     │ │  Engine    │ │  Engine          │  │   │
│  │  │            │ │            │ │                   │  │   │
│  │  │ • Health   │ │ • Template │ │ • Food Basket    │  │   │
│  │  │   Score    │ │   matching │ │ • Synergy Rules  │  │   │
│  │  │ • PhenoAge │ │ • Longevity│ │ • Smart Hacks   │  │   │
│  │  │ • Category │ │   context  │ │ • Food Swaps    │  │   │
│  │  │   scoring  │ │ • Correl-  │ │ • USDA + FooDB  │  │   │
│  │  │ • Impact   │ │   ations   │ │   data layers   │  │   │
│  │  │   scoring  │ │ • Pro Tips │ │                   │  │   │
│  │  └────────────┘ └────────────┘ └─────────────────┘  │   │
│  │                                                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐  │   │
│  │  │ Assessment │ │  Wearable  │ │  Notification    │  │   │
│  │  │ Engine     │ │  Engine    │ │  Service         │  │   │
│  │  │            │ │            │ │                   │  │   │
│  │  │ • Trigger  │ │ • Oura API │ │ • Email (Resend)│  │   │
│  │  │   matching │ │ • Whoop API│ │ • Push / SMS    │  │   │
│  │  │ • Response │ │ • Dynamic  │ │ • Templates     │  │   │
│  │  │   processing│ │   Score   │ │                   │  │   │
│  │  └────────────┘ └────────────┘ └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DATA LAYER                              │   │
│  │                                                      │   │
│  │  NHANES 2017-2020 · FooDB (85K compounds)           │   │
│  │  USDA FoodData Central · NHS/NICE clinical ranges   │   │
│  │  48 biomarker configs · 47 correlation rules        │   │
│  │  160+ insight templates · 40+ synergy rules         │   │
│  │  30+ food intelligence rules                        │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │Firestore │ │  Lab API │ │ Wearable │
        │(Database)│ │ (Inuvi)  │ │  OAuth   │
        └──────────┘ └──────────┘ └──────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Firebase Cloud Functions, Node 20, TypeScript (strict) |
| **Database** | Firestore (NoSQL, real-time) |
| **Lab Integration** | REST API + Webhooks (Inuvi, expanding to more) |
| **Wearables** | Oura Ring + Whoop (OAuth 2.0) |
| **AI Layer** | Claude API (Anthropic) for personalised narratives |
| **Payments** | Stripe (checkout, subscriptions) |
| **Email** | Resend (transactional + lifecycle emails) |
| **PDF Generation** | PDFKit (personalised test reports) |
| **CI/CD** | GitHub Actions (3 workflows: lint, test, build) |
| **Linting** | ESLint v10 (flat config, strict TypeScript rules) |
| **Testing** | Jest (unit + integration) |

---

## Codebase Metrics

```
Source files:          82 TypeScript modules
Test files:            28 test suites
Total lines:           41,000+ (production code)
Tests:                 1,062 passing
Build errors:          0
Lint errors:           0
Lint warnings:         81 (non-blocking)
```

---

## Engineering Highlights

### 1. Longevity-Optimised Scoring Engine
We don't use standard lab ranges. Our scoring engine applies **population-level percentile thresholds** derived from NHANES (filtered to healthy adults only), producing 4-band classifications:

```typescript
// Simplified example of our scoring logic

export function determineStatus(
  value: number,
  ranges: BiomarkerRanges,
): MarkerStatus {
  if (value >= ranges.greenLow && value <= ranges.greenHigh) {
    return MarkerStatus.green;     // Optimal
  }
  if (value >= ranges.amberLow && value <= ranges.amberHigh) {
    return MarkerStatus.amber;     // Borderline — longevity concern
  }
  if (value >= ranges.redLow && value <= ranges.redHigh) {
    return MarkerStatus.red;       // Out of optimal range
  }
  return MarkerStatus.urgent_red;  // Requires immediate attention
}
```

### 2. Multi-Source Nutrition Engine (5 Data Pipelines)
Personalised food recommendations powered by 5 data sources:

```
Stage 1 → Identify priority nutrients from out-of-range markers
Stage 2 → Gather food candidates (USDA + FooDB + Biomarker Library)
Stage 3 → Score each food (composite: nutrient density + bioactive compounds + multi-marker bonus)
Stage 4 → Filter by dietary preferences, allergies, dislikes
Stage 5 → Generate meal suggestions + synergy tips + smart food hacks
```

Each food recommendation knows:
- **Which markers** it improves and how
- **Bioactive compounds** it contains (from FooDB — 85,000+ compounds)
- **Nutrient density** per serving (from USDA FoodData Central)
- **Synergy rules** — what to combine it with and what to avoid
- **Evidence level** — strong / moderate / emerging

### 3. Food Synergy & Intelligence Engine
Goes beyond "eat this food" to insider-level biohacker knowledge:

```
Synergy Rules (40+):
  ✅ "Turmeric + black pepper → 2000% better curcumin absorption"
  ⛔ "Tea with iron-rich meals → 60% absorption loss"

Smart Food Hacks (30+ rules across 6 categories):
  📋 Protocols      — step-by-step daily routines per marker
  ⚖️ Precision Doses — "2 Brazil nuts = 100% daily selenium"
  ⏰ Timing Hacks   — "protein first at meals → 30-40% lower glucose spike"
  🔪 Prep Hacks     — "crush garlic 10min before heat → 90% more allicin"
  🚫 Hidden Blockers — "morning coffee blocks 60% of breakfast iron"
  💊 Food as Supplement — replace pills with food combos
```

### 4. Longevity Context Generator
When a marker is within standard clinical range but outside our optimal range, we generate a personalised explanation:

```
"A standard laboratory would consider your result of 3.5 mIU/L normal
(their reference range is 0.27–4.2 mIU/L). However, population-level
longevity research shows that the optimal level for long-term health
is 0.5–2.5 mIU/L. Your result is above this optimal range, which is
why we've flagged it — it's an area where small improvements can make
a real difference over time."
```

This is Omniwo's key differentiator — turning a "why are you telling me I'm not fine?" into an "oh, this is insight I can't get anywhere else."

### 5. PhenoAge Calculator (Biological Age)
Implementation of the Levine PhenoAge algorithm — estimates biological age from 9 blood biomarkers:

```
Input:  Albumin, Creatinine, Glucose, CRP, Lymphocytes, MCV, RDW, ALP, WBC
Output: Biological age (e.g., 34.2 when chronological age is 38)
        → "Your body is aging 3.8 years slower than average"
```

### 6. Assessment Engine (Contextual Questionnaires)
We never assume — we ask. When biomarker patterns suggest a lifestyle factor, we trigger targeted questionnaires:

```
High Cortisol detected
→ Trigger: Sleep & Stress Assessment (5 questions, ~2 min)
→ User answers reveal: works night shifts, 10 cups of coffee/day
→ Insight modifier: suppress generic "reduce stress" advice,
  unlock shift-worker protocol with specific timing recommendations
```

16 assessment templates covering: sleep, stress, diet, exercise, alcohol, family history (heart disease, diabetes, thyroid, iron overload, hormonal).

### 7. 47 Biomarker Correlation Rules
Pattern matching across multiple markers for deeper insights:

```
Example: Low Iron + Low Ferritin + Low Hemoglobin + Low MCV
→ "This pattern suggests iron-deficiency anaemia"
→ Food protocol: iron-rich foods + vitamin C pairing
→ Blocker alert: avoid tea/coffee with iron meals
```

### 8. Dynamic Omniwo Score
A living health score that combines blood data (65%) with daily wearable data (35%):

```
Blood Component (65%):
  Decays over time (fresh test = 100% confidence, 180 days = 20%)
  Recalculates instantly when new test arrives

Lifestyle Component (35%):
  Updates daily from Oura/Whoop
  Sleep quality + HRV + Recovery + Resting Heart Rate
```

---

## Data Sources

| Source | Scale | Purpose |
|--------|-------|---------|
| **NHANES 2017-2020** | 15,000+ healthy adults, 48 biomarkers | Optimal reference ranges (p25-p75 of healthy population) |
| **FooDB** | 85,000+ compounds, 1,343 foods, 5.1M records | Bioactive compound → health effect mapping |
| **USDA FoodData Central** | 2,000+ whole foods, 40+ nutrients | Nutrient density scoring |
| **NHS / NICE / ACB / BTA / BHF** | UK national standards | Clinical range context |
| **PubMed** | API integration | Evidence-backed insight generation |

---

## Module Overview

```
functions/src/
├── config/           # 13 configs — biomarker library, ranges, templates, rules
│   ├── biomarkerLibrary.ts          (2,000+ lines — 40+ marker definitions)
│   ├── insightTemplates.ts          (160+ insight templates)
│   ├── correlationInsights.ts       (47 multi-marker pattern rules)
│   ├── assessmentTemplates.ts       (16 contextual questionnaires)
│   ├── foodSynergyRules.ts          (40+ food interaction rules)
│   ├── foodIntelligenceRules.ts     (30+ biohacker-level tips)
│   ├── clinicalReferenceRanges.ts   (NHS/NICE standard ranges)
│   └── ...
│
├── services/         # 13 engines — scoring, nutrition, PDF, notifications
│   ├── scoringEngine.ts             (health score, category scores)
│   ├── insightEngine.ts             (AI-powered insight generation)
│   ├── foodBasketEngine.ts          (5-source nutrition recommendations)
│   ├── foodSynergyEngine.ts         (food combo optimisation)
│   ├── foodIntelligenceEngine.ts    (biohacker tips engine)
│   ├── assessmentEngine.ts          (trigger matching + insight modifiers)
│   ├── pdfReportGenerator.ts        (PDFKit report generation)
│   └── ...
│
├── data/             # 4 data modules — NHANES, USDA, FooDB, enricher
│   ├── nhanesOptimalRanges.ts       (864 entries, age/sex stratified)
│   ├── usdaFoodNutrients.ts         (nutrient density rankings)
│   ├── foodBioactiveCompounds.ts    (compound-health effect mapping)
│   └── biomarkerFoodEnricher.ts     (merged view across all sources)
│
├── utils/            # 5 utilities — longevity context, PhenoAge, validation
│   ├── longevityContext.ts           (key differentiator messaging)
│   ├── phenoAgeCalculator.ts         (biological age algorithm)
│   └── ...
│
├── functions/        # 12 cloud functions — API endpoints, webhooks, triggers
│   ├── onResultsReady.ts            (main pipeline: results → scores → insights)
│   ├── generateMyReport.ts          (PDF generation endpoint)
│   └── ...
│
├── wearable/         # 3 modules — Oura, Whoop, aggregator
│   ├── ouraClient.ts
│   ├── whoopClient.ts
│   └── wearableAggregator.ts
│
└── __tests__/        # 28 test suites — 1,062 tests
```

---

## Quality Standards

- **Zero build errors** — TypeScript strict mode, no `any` types
- **Zero lint errors** — ESLint v10 with strict rules
- **1,062 tests** — unit tests for every engine, config validation, real-world scenarios
- **CI/CD** — 3 GitHub Actions workflows (lint, test, build) run on every push
- **Code review** — every feature goes through architecture review before merge

---

## Product Principles

1. **Human language first** — "Your stress hormone (Cortisol) is elevated" not "Cortisol: 580 nmol/L HIGH"
2. **Never diagnose** — "Results suggest" not "you have"
3. **Natural approaches first** — Food → lifestyle → supplements → GP only for safety
4. **Longevity framing** — Explain WHY we flag things standard labs don't
5. **Don't scare users** — Empower, not alarm
6. **Never assume — ask** — Contextual assessments before generic advice

---

## Team

**Islam** — Solo technical founder. Built entire backend from scratch.

---

## Status

- **Backend:** Production-ready (1,062 tests, 0 errors)
- **Frontend:** In design phase (working with design studio)
- **Lab partnership:** Secured (Inuvi)
- **Wearable integration:** Built (Oura + Whoop)
- **Target launch:** UK, 2026

---

## Contact

**Islam** — Founder
GitHub: [@Islam0953](https://github.com/Islam0953)

---

*This is a public portfolio repository. The production codebase is private.*
