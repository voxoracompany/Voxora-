---
name: V5.1 AI Engine Modules
description: Four new service modules added in V5.1 and how they integrate with AIService/AIContext/useAI.
---

# V5.1 AI Engine — New Modules

## What was added
- `src/services/ai/AICache.ts` — localStorage-backed response cache, TTL 5min (mock) / 30min (real), LRU eviction, `AICache.get/set/invalidateProvider/clear/getStats`
- `src/services/ai/AIHealthMonitor.ts` — rolling latency + error rate per provider, reactive `subscribe(listener)` pattern, `recordSuccess/recordError/getHealth/getAllHealth`
- `src/services/ai/AIRequestManager.ts` — concurrency limit (3), 500ms dedup window, `enqueue(prompt, workspace, fn)` returns `ManagedRequest<T>` with `.promise`
- `src/services/ai/AIContextManager.ts` — per-workspace conversation context stored in localStorage, injected into `AIRequest.messages` when `req.messages` is absent

## Integration pattern
All four are wired inside `AIService.generate()` in this order: Cache lookup → ContextManager.injectContext → RequestManager.enqueue → Provider.generate → HealthMonitor.recordSuccess/Error → AICache.set → AIContextManager.record

## Updated files
- `AIService.ts` — exposes `.cache`, `.healthMonitor`, `.requestManager`, `.contextManager` accessors; `updateSettings()` invalidates cache + resets health on provider switch
- `AITypes.ts` — added `AICacheStats`, `ProviderHealth`, `RequestStatus`, `RequestConcurrencyInfo`; `AISettings` has `cacheEnabled` + `contextEnabled` (both default safe)
- `AIContext.tsx` — exposes `health`, `refreshHealth`, `cacheStats`, `refreshCache`, `clearCache`; subscribes to `AIHealthMonitor.subscribe` for reactive updates
- `useAI.ts` — added `generateFull()` (returns `AIResponse` with metadata), `clearError()`, refreshes cache stats after every call
- `PromptLibrary.ts` — added 5 new prompt IDs: `growthPlanner`, `growthOpportunity`, `aiGrowthRecommendations`, `analyticsReports`, `collaborationPlan`

## Key rules
- Streaming calls (`stream`, `chatStream`) bypass the cache and RequestManager (they use their own flow path in `AIService.stream`)
- `contextEnabled` defaults to `false` — opt-in per workspace to avoid injecting irrelevant history
- Cache is invalidated when the user switches AI provider (in `updateSettings`)

**Why:** Centralises all AI infrastructure so workspaces never need custom AI logic — they only call `useAI()` hook methods.
