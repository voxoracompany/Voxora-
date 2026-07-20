// ── V4.1 AI Engine — Prompt Library ──────────────────────────────────────────
// Reusable, parameterised prompt templates for every Voxora workspace.

export type PromptId =
  | 'startupValidation' | 'swot' | 'businessModel' | 'customerResearch'
  | 'competitorAnalysis' | 'marketingStrategy' | 'seoPlanning'
  | 'financialForecast' | 'pitchDeck' | 'executiveSummary'
  | 'emailCampaign' | 'socialMedia' | 'productRoadmap'
  | 'contentIdeas' | 'appIdeas' | 'customerPersona' | 'productValidation'
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
