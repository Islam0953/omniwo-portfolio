# Medplum Agent $stats Operation — PR #7221

## How to apply this patch to your medplum fork

```bash
# 1. Clone your fork
git clone https://github.com/Islam0953/medplum.git
cd medplum

# 2. Create a feature branch
git checkout -b feat/agent-stats-operation

# 3. Apply the patch (copy the .patch file into the repo first)
git am 0001-feat-agent-stats-operation.patch

# 4. Push to your fork
git push -u origin feat/agent-stats-operation

# 5. Go to https://github.com/medplum/medplum and create a Pull Request
#    from Islam0953:feat/agent-stats-operation -> medplum:main
```

## What this changes

| File | Change |
|------|--------|
| `packages/core/src/agent.ts` | New `AgentStatsRequest` and `AgentStatsResponse` interfaces |
| `packages/server/src/fhir/operations/agentstats.ts` | New server-side operation handler |
| `packages/server/src/fhir/routes.ts` | Register `GET /Agent/$stats` and `GET /Agent/:id/$stats` routes |
| `packages/agent/src/app.ts` | Handle `agent:stats:request` message, gather and return stats |
