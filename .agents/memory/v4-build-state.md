---
name: V4 AI Engine Build State
description: Tracks which V4 modules are complete, committed, and pushed to GitHub.
---

## Completed & Pushed

| Version | Module               | Commit      | Key Files |
|---------|----------------------|-------------|-----------|
| V4.1    | AI Engine Infrastructure | c5f5c8c | AIService, AIMemory, AIUsage, PromptLibrary, MockProvider + 3 real providers, AIContext, useAI, AISettings, DemoBanner; all 10 original workspaces wired |
| V4.2    | Marketing Studio     | bf12a0e | MarketingHub, EmailCampaign, SocialMediaPost, SEOPlanner, AdCopy, ContentCalendar, BrandVoice, MarketingStrategy + 3 new prompts + mock responses |
| V4.3    | Financial Studio     | 05ef60a | FinancialHub, FinancialForecast, RevenueModel, PricingStrategy, UnitEconomics, BreakEven, PitchDeck, ExecutiveSummary + 4 new prompts + mock responses |

## Next: V4.4 — Investor Studio
New tools: InvestorHub, FundraisingStrategy, TermSheetGuide, DueDiligence, InvestorNarrative, CapTablePlanner

## Architecture Decisions
- All workspace files follow identical pattern: useAI(workspace) + DemoBanner + save to useProjects
- Back button navigates to hub (e.g. `setWorkspace("marketingHub")`) not dashboard
- AIProvider wraps Dashboard in App.tsx — useAIContext available inside all dashboard children
- AIContext.tsx has `/* @refresh reset */` to prevent HMR crash during dev (production fine)
- PromptLibrary promptMap in AIService.analyze() must be updated for each new workspace type
- MockProvider switch cases use workspace name (not prompt ID) — add new case for each new workspace
- Sidebar sections: MAIN_NAV, AI_TOOLS, RESEARCH_TOOLS, STRATEGY_TOOLS, FINANCIAL_TOOLS, MARKETING_TOOLS, (INVESTOR_TOOLS next)

**Why:**
Consistent workspace-based Mock routing (workspace string → mock) decoupled from prompt ID routing (type string → promptId). This allows the same workspace to use different prompts.
