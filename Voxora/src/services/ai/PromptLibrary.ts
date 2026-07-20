// ── V4.1 AI Engine — Prompt Library ──────────────────────────────────────────
// Reusable, parameterised prompt templates for every Voxora workspace.

export type PromptId =
  | 'startupValidation' | 'swot' | 'businessModel' | 'customerResearch'
  | 'competitorAnalysis' | 'marketingStrategy' | 'seoPlanning'
  | 'financialForecast' | 'pitchDeck' | 'executiveSummary'
  | 'emailCampaign' | 'socialMedia' | 'productRoadmap'
  | 'contentIdeas' | 'appIdeas' | 'customerPersona' | 'productValidation'
  | 'adCopy' | 'contentCalendar' | 'brandVoice'
  | 'revenueModel' | 'pricingStrategy' | 'unitEconomics' | 'breakEven'
  | 'fundraisingStrategy' | 'termSheet' | 'dueDiligence' | 'investorNarrative' | 'capTable'
  // V5.1 — Growth & Analytics prompts
  | 'growthPlanner' | 'growthOpportunity' | 'aiGrowthRecommendations'
  | 'analyticsReports' | 'collaborationPlan'
  | 'chat';

interface PromptTemplate {
  id:          PromptId;
  label:       string;
  workspace:   string;
  system:      string;
  user:        (input: string, style?: string) => string;
}

const BASE_SYSTEM = `You are Voxora AI — a sharp, practical business intelligence assistant. Be specific, actionable, and structured. Use bullet points and clear sections. Reference the user's exact input in your response.`;

const CONCISE_INSTRUCTION  = ' Be concise — maximum 300 words.';
const CREATIVE_INSTRUCTION = ' Be bold and unconventional — challenge assumptions.';

export const PROMPT_TEMPLATES: Record<PromptId, PromptTemplate> = {

  chat: {
    id: 'chat', label: 'AI Chat', workspace: 'assistant',
    system: `${BASE_SYSTEM} You are having a helpful conversation about startups, products, and business strategy.`,
    user: (input) => input,
  },

  startupValidation: {
    id: 'startupValidation', label: 'Startup Validation', workspace: 'startup',
    system: `${BASE_SYSTEM} You specialise in startup validation and lean methodology.`,
    user: (input, style) => `Validate this startup idea: "${input}". Cover: problem clarity, target market size, existing solutions, differentiation opportunity, biggest risks, and a 3-step validation experiment. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  swot: {
    id: 'swot', label: 'SWOT Analysis', workspace: 'swot',
    system: `${BASE_SYSTEM} You specialise in strategic SWOT analysis.`,
    user: (input, style) => `Generate a detailed SWOT analysis for: "${input}". Include 4+ points per quadrant (Strengths, Weaknesses, Opportunities, Threats) and a strategic recommendation at the end. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  businessModel: {
    id: 'businessModel', label: 'Business Model Canvas', workspace: 'business',
    system: `${BASE_SYSTEM} You specialise in business model design.`,
    user: (input, style) => `Create a complete Business Model Canvas for: "${input}". Cover all 9 blocks: Value Proposition, Customer Segments, Channels, Customer Relationships, Revenue Streams, Key Activities, Key Partners, Key Resources, Cost Structure. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  customerResearch: {
    id: 'customerResearch', label: 'Customer Research', workspace: 'research',
    system: `${BASE_SYSTEM} You specialise in customer discovery and user research.`,
    user: (input, style) => `Conduct customer research for: "${input}". Cover: target customer profile, top 5 pain points, buying motivations, discovery channels, willingness to pay signals, and 5 interview questions to validate assumptions. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  competitorAnalysis: {
    id: 'competitorAnalysis', label: 'Competitor Analysis', workspace: 'competitor',
    system: `${BASE_SYSTEM} You specialise in competitive intelligence.`,
    user: (input, style) => `Analyse competitors for: "${input}". Cover: direct & indirect competitors, their strengths/weaknesses, pricing strategy, positioning gaps, and your 3 most actionable competitive advantages. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  marketingStrategy: {
    id: 'marketingStrategy', label: 'Marketing Strategy', workspace: 'content',
    system: `${BASE_SYSTEM} You specialise in growth marketing and content strategy.`,
    user: (input, style) => `Build a marketing strategy for: "${input}". Cover: target audience, primary channels, content pillars, acquisition funnel, messaging framework, and 30-day action plan. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  seoPlanning: {
    id: 'seoPlanning', label: 'SEO Planning', workspace: 'content',
    system: `${BASE_SYSTEM} You specialise in SEO and organic growth.`,
    user: (input, style) => `Create an SEO plan for: "${input}". Cover: primary keywords, content clusters, competitor keyword gaps, quick-win opportunities, and a 90-day content calendar outline. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  financialForecast: {
    id: 'financialForecast', label: 'Financial Forecast', workspace: 'financial',
    system: `${BASE_SYSTEM} You specialise in financial modelling for startups.`,
    user: (input, style) => `Create a financial forecast framework for: "${input}". Cover: revenue model assumptions, unit economics (CAC, LTV, payback period), 12-month revenue projection milestones, key cost drivers, and break-even estimate. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  pitchDeck: {
    id: 'pitchDeck', label: 'Pitch Deck', workspace: 'pitch',
    system: `${BASE_SYSTEM} You specialise in investor pitches and fundraising.`,
    user: (input, style) => `Outline a compelling investor pitch deck for: "${input}". Cover all 12 slides: Problem, Solution, Market Size, Product, Business Model, Traction, Competition, Team, Financials, Use of Funds, Vision, Ask. Include key talking points for each slide. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  executiveSummary: {
    id: 'executiveSummary', label: 'Executive Summary', workspace: 'general',
    system: `${BASE_SYSTEM} You specialise in executive communication.`,
    user: (input, style) => `Write a one-page executive summary for: "${input}". Include: company overview, problem & solution, target market, business model, traction highlights, team, and funding ask. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  emailCampaign: {
    id: 'emailCampaign', label: 'Email Campaign', workspace: 'content',
    system: `${BASE_SYSTEM} You specialise in email marketing and copywriting.`,
    user: (input, style) => `Create a 3-email drip campaign for: "${input}". Each email needs: subject line, preview text, opening hook, main body, CTA, and P.S. line. Focus on conversion. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  socialMedia: {
    id: 'socialMedia', label: 'Social Media', workspace: 'content',
    system: `${BASE_SYSTEM} You specialise in social media content and growth.`,
    user: (input, style) => `Create a social media content plan for: "${input}". Include: 5 LinkedIn posts, 5 X/Twitter threads, 3 Instagram captions, and a TikTok hook idea. Each post should have a specific angle and call to action. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  productRoadmap: {
    id: 'productRoadmap', label: 'Product Roadmap', workspace: 'roadmap',
    system: `${BASE_SYSTEM} You specialise in product strategy and roadmapping.`,
    user: (input, style) => `Create a product roadmap for: "${input}". Cover: MVP scope (must-haves only), Phase 1 (0–3 months), Phase 2 (3–6 months), Phase 3 (6–12 months), and success metrics for each phase. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  contentIdeas: {
    id: 'contentIdeas', label: 'Content Ideas', workspace: 'content',
    system: `${BASE_SYSTEM} You specialise in creative content ideation.`,
    user: (input, style) => `Generate 8 high-quality content ideas for the topic: "${input}". For each idea include: a compelling title, the target audience, the key angle, and the best format (article, video, thread, podcast, etc.). ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  appIdeas: {
    id: 'appIdeas', label: 'App Ideas', workspace: 'apps',
    system: `${BASE_SYSTEM} You specialise in product ideation and app concepts.`,
    user: (input, style) => `Generate 6 app ideas for: "${input}". For each: app name, one-liner description, core feature, target user, monetisation model, and why now is the right time to build it. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  customerPersona: {
    id: 'customerPersona', label: 'Customer Persona', workspace: 'persona',
    system: `${BASE_SYSTEM} You specialise in customer persona development.`,
    user: (input, style) => `Create a detailed customer persona for: "${input}". Include: name, age, job title, goals, frustrations, daily workflow, preferred tools, objections to buying, and how this product fits their life. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  productValidation: {
    id: 'productValidation', label: 'Product Validation', workspace: 'validation',
    system: `${BASE_SYSTEM} You specialise in product validation and lean experiments.`,
    user: (input, style) => `Validate this product concept: "${input}". Cover: demand signals, minimum viable test to run in 7 days, success/failure criteria, 5 questions to ask potential customers, and go/no-go recommendation framework. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  adCopy: {
    id: 'adCopy', label: 'Ad Copy Generator', workspace: 'adCopy',
    system: `${BASE_SYSTEM} You specialise in high-converting advertising copywriting for digital platforms.`,
    user: (input, style) => `Generate compelling ad copy for: "${input}". Create variations for: 1) Google Search Ads (3 headlines + 2 descriptions), 2) Facebook/Instagram Ad (primary text, headline, CTA), 3) LinkedIn Ad (introductory text + headline), 4) Twitter/X Ad (short copy + CTA), 5) YouTube Pre-roll Script (15-second hook). Each should be conversion-focused with a strong CTA. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  contentCalendar: {
    id: 'contentCalendar', label: 'Content Calendar', workspace: 'contentCalendar',
    system: `${BASE_SYSTEM} You specialise in content marketing strategy and editorial planning.`,
    user: (input, style) => `Build a 4-week content calendar for: "${input}". For each week provide: 2 long-form content pieces (blog/article), 5 social posts (LinkedIn/X), 1 email newsletter idea, 1 short-form video concept, and 1 lead magnet or download idea. Include topic angles, posting days, and content goals for each piece. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  brandVoice: {
    id: 'brandVoice', label: 'Brand Voice Analyzer', workspace: 'brandVoice',
    system: `${BASE_SYSTEM} You specialise in brand identity, tone of voice, and messaging strategy.`,
    user: (input, style) => `Define the brand voice and messaging framework for: "${input}". Cover: brand personality (5 adjectives), tone of voice (formal vs casual, serious vs playful — with examples), core messaging pillars (3–4), tagline options (5 variations), what to always say and never say, writing style guide (sentence length, punctuation, word choice), and a before/after copy example demonstrating the voice. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  revenueModel: {
    id: 'revenueModel', label: 'Revenue Model Builder', workspace: 'revenueModel',
    system: `${BASE_SYSTEM} You specialise in SaaS revenue modelling and business model design.`,
    user: (input, style) => `Design a comprehensive revenue model for: "${input}". Cover: primary revenue streams, pricing tiers (Free/Starter/Pro/Enterprise), pricing rationale, expansion revenue opportunities (upsell, cross-sell, add-ons), annual vs monthly pricing strategy, revenue projections for Month 1/6/12, and key revenue risks and mitigations. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  pricingStrategy: {
    id: 'pricingStrategy', label: 'Pricing Strategy', workspace: 'pricingStrategy',
    system: `${BASE_SYSTEM} You specialise in SaaS pricing strategy and value-based pricing.`,
    user: (input, style) => `Build a pricing strategy for: "${input}". Cover: pricing model recommendation (per-seat, usage-based, flat-rate, tiered), suggested price points with rationale, competitor price benchmarking, value metric to charge on, free trial/freemium strategy, annual discount recommendation, and 3 pricing experiments to run in the first 90 days. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  unitEconomics: {
    id: 'unitEconomics', label: 'Unit Economics', workspace: 'unitEconomics',
    system: `${BASE_SYSTEM} You specialise in SaaS unit economics, CAC, LTV, and growth efficiency.`,
    user: (input, style) => `Analyse the unit economics framework for: "${input}". Cover: Customer Acquisition Cost (CAC) breakdown by channel, Lifetime Value (LTV) calculation with assumptions, LTV:CAC ratio target and current estimate, payback period calculation, churn rate impact analysis, and 5 specific actions to improve unit economics. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  breakEven: {
    id: 'breakEven', label: 'Break-Even Analysis', workspace: 'breakEven',
    system: `${BASE_SYSTEM} You specialise in startup financial planning and break-even analysis.`,
    user: (input, style) => `Calculate and explain the break-even framework for: "${input}". Cover: fixed costs breakdown, variable costs per customer, contribution margin, break-even customer count, break-even MRR target, estimated time to break-even with assumptions, and 3 scenarios (pessimistic/base/optimistic) with milestone triggers. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  fundraisingStrategy: {
    id: 'fundraisingStrategy', label: 'Fundraising Strategy', workspace: 'fundraisingStrategy',
    system: `${BASE_SYSTEM} You specialise in startup fundraising, investor relations, and venture capital.`,
    user: (input, style) => `Create a fundraising strategy for: "${input}". Cover: right stage and round type (pre-seed/seed/Series A), how much to raise and why, ideal investor profile (sector, check size, value-add), 5 specific investor archetypes to target, outreach sequence and messaging, timeline (prep, outreach, due diligence, close), common mistakes to avoid, and what to have ready before your first meeting. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  termSheet: {
    id: 'termSheet', label: 'Term Sheet Guide', workspace: 'termSheet',
    system: `${BASE_SYSTEM} You specialise in venture capital term sheets, startup legal concepts, and founder-friendly deal structures.`,
    user: (input, style) => `Explain the key term sheet concepts relevant to: "${input}". Cover the most important terms: valuation (pre-money vs post-money), dilution, liquidation preferences, anti-dilution provisions, pro-rata rights, board composition, information rights, vesting schedules, and drag-along/tag-along rights. For each: plain English explanation, founder-friendly vs investor-friendly versions, and what to negotiate. Include red flags to watch for. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  dueDiligence: {
    id: 'dueDiligence', label: 'Due Diligence Checklist', workspace: 'dueDiligence',
    system: `${BASE_SYSTEM} You specialise in startup due diligence, investor relations, and fundraising preparation.`,
    user: (input, style) => `Create a comprehensive due diligence preparation checklist for: "${input}". Cover all categories investors will examine: Business & Strategy, Team & Hiring, Product & Technology, Market & Competition, Financial & Legal, and Customer Traction. For each category, list specific documents to prepare, questions investors will ask, and what makes a strong vs weak response. Include a priority ranking (critical vs nice-to-have). ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  investorNarrative: {
    id: 'investorNarrative', label: 'Investor Narrative', workspace: 'investorNarrative',
    system: `${BASE_SYSTEM} You specialise in startup storytelling, investor pitching, and founder narrative.`,
    user: (input, style) => `Write a compelling investor narrative for: "${input}". Cover: the founding story (why you, why now, why this problem), the insight that others are missing, the market timing argument, the product vision (where this goes in 5–10 years), the team unfair advantage, and the key belief investors need to share to invest. Write as a structured narrative, not bullet points — this is the story that precedes the deck. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  capTable: {
    id: 'capTable', label: 'Cap Table Planner', workspace: 'capTable',
    system: `${BASE_SYSTEM} You specialise in startup cap tables, equity structures, and founder dilution modelling.`,
    user: (input, style) => `Explain the cap table structure and dilution modelling for: "${input}". Cover: typical founder equity split rationale, employee option pool (ESOP) sizing and timing, pre-seed/seed/Series A dilution scenarios, how liquidation preference affects founder payout, what a healthy cap table looks like at each stage, mistakes that make cap tables investor-unfriendly, and 3 concrete scenarios showing founder ownership at exit ($10M, $50M, $100M acquisition). ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  // ── V5.1 — Growth Studio prompts ────────────────────────────────────────────
  growthPlanner: {
    id: 'growthPlanner', label: 'Growth Planner', workspace: 'growthPlanner',
    system: `${BASE_SYSTEM} You specialise in startup growth strategy, acquisition channels, and sustainable scaling.`,
    user: (input, style) => `Create a 90-day growth plan for: "${input}". Cover: top 3 acquisition channels to prioritise (with rationale), conversion funnel improvements, retention tactics, key metrics to track weekly, and one bold growth experiment to run. For each item include a concrete action, expected impact, and resource requirement. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  growthOpportunity: {
    id: 'growthOpportunity', label: 'Growth Opportunity Analysis', workspace: 'growthOpportunity',
    system: `${BASE_SYSTEM} You specialise in identifying untapped growth opportunities for startups and SMBs.`,
    user: (input, style) => `Identify the top growth opportunities for: "${input}". Analyse: underserved customer segments, adjacent markets, product expansion options, partnership opportunities, pricing model improvements, and viral/referral mechanics. For each opportunity rate the effort (low/medium/high) and potential impact (low/medium/high). Prioritise the top 3 with a recommended first action. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  aiGrowthRecommendations: {
    id: 'aiGrowthRecommendations', label: 'AI Growth Recommendations', workspace: 'aiGrowthRecommendations',
    system: `${BASE_SYSTEM} You are a data-driven growth advisor who gives specific, prioritised recommendations.`,
    user: (input, style) => `Generate AI-powered growth recommendations for: "${input}". Provide: 5 prioritised growth actions ranked by ROI potential, the one metric to move this quarter, a 30-day quick win, a 90-day strategic move, and a 12-month compounding play. For each recommendation include why it works, what success looks like, and a risk to watch. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  // ── V5.1 — Analytics Studio prompts ─────────────────────────────────────────
  analyticsReports: {
    id: 'analyticsReports', label: 'Analytics Report', workspace: 'analyticsReports',
    system: `${BASE_SYSTEM} You specialise in business analytics, KPI interpretation, and executive reporting.`,
    user: (input, style) => `Create an analytics report framework for: "${input}". Cover: key metrics to track (with benchmarks), how to interpret trends, leading vs lagging indicators, recommended reporting cadence, and 3 data-driven insights to act on immediately. Include a simple dashboard structure with the 5 most important numbers. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },

  // ── V5.1 — Team Studio prompts ───────────────────────────────────────────────
  collaborationPlan: {
    id: 'collaborationPlan', label: 'Collaboration Plan', workspace: 'collaborationPlan',
    system: `${BASE_SYSTEM} You specialise in team collaboration, remote work best practices, and async communication.`,
    user: (input, style) => `Create a collaboration plan for: "${input}". Cover: team communication cadence (daily/weekly/monthly rituals), decision-making framework (who decides what), async-first principles, shared documentation standards, conflict resolution process, and onboarding checklist for new team members. Make it practical and immediately actionable. ${style === 'concise' ? CONCISE_INSTRUCTION : style === 'creative' ? CREATIVE_INSTRUCTION : ''}`,
  },
};

export class PromptLibrary {
  static get(id: PromptId): PromptTemplate {
    return PROMPT_TEMPLATES[id];
  }

  static build(id: PromptId, input: string, style?: string): { system: string; user: string } {
    const tpl = PROMPT_TEMPLATES[id];
    return { system: tpl.system, user: tpl.user(input, style) };
  }

  static list(): PromptTemplate[] {
    return Object.values(PROMPT_TEMPLATES);
  }

  static count(): number {
    return Object.keys(PROMPT_TEMPLATES).length;
  }
}
