#!/usr/bin/env bash
set -euo pipefail

echo "=== Omniwo Portfolio — Validation ==="

errors=0

# Check required files exist
required_files=(
  "README.md"
  "pitch-deck-omniwo.md"
  "code-samples/food-synergy-engine.ts"
  "code-samples/scoring-engine.ts"
  "code-samples/longevity-context.ts"
  "code-samples/webhook-handler.ts"
  "code-samples/wearable-sync.ts"
  "medplum-contribution/INSTRUCTIONS.md"
  "medplum-contribution/agent.ts"
  "medplum-contribution/agentstats.ts"
)

echo ""
echo "--- Checking required files ---"
for f in "${required_files[@]}"; do
  if [ -f "$f" ]; then
    echo "  OK: $f"
  else
    echo "  MISSING: $f"
    errors=$((errors + 1))
  fi
done

# Check patch files exist and are non-empty
echo ""
echo "--- Checking patch files ---"
patch_count=0
for f in *.patch medplum-contribution/*.patch; do
  if [ -f "$f" ]; then
    if [ -s "$f" ]; then
      echo "  OK: $f ($(wc -l < "$f") lines)"
      patch_count=$((patch_count + 1))
    else
      echo "  EMPTY: $f"
      errors=$((errors + 1))
    fi
  fi
done

if [ "$patch_count" -eq 0 ]; then
  echo "  ERROR: No patch files found"
  errors=$((errors + 1))
fi

# Check TypeScript files have content (basic syntax sanity)
echo ""
echo "--- Checking TypeScript files ---"
for f in code-samples/*.ts medplum-contribution/*.ts; do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f")
    if [ "$lines" -gt 5 ]; then
      echo "  OK: $f ($lines lines)"
    else
      echo "  WARN: $f is very short ($lines lines)"
    fi
  fi
done

# Check README is non-trivial
echo ""
echo "--- Checking README quality ---"
readme_lines=$(wc -l < README.md)
if [ "$readme_lines" -gt 50 ]; then
  echo "  OK: README.md ($readme_lines lines)"
else
  echo "  WARN: README.md seems short ($readme_lines lines)"
fi

# Summary
echo ""
echo "=== Results ==="
if [ "$errors" -gt 0 ]; then
  echo "FAILED: $errors error(s) found"
  exit 1
else
  echo "ALL CHECKS PASSED"
  exit 0
fi
