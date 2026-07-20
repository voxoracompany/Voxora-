// ── V4.1 AI Engine — Mock Provider ────────────────────────────────────────────
// Default fallback provider. Generates contextually relevant responses
// without any API key. Always available.

import type { AIProvider, AIRequest, AIResponse } from '../types/AITypes';

const MOCK_DELAY_MIN = 400;
const MOCK_DELAY_MAX = 900;

function delay(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}

function mockDelay(): number {
  return MOCK_DELAY_MIN + Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN);
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── Workspace-aware response generator ───────────────────────────────────────
function generateMockResponse(req: AIRequest): string {
  const prompt    = req.prompt || '';
  const workspace = req.workspace || 'general';

  // Extract key subject from prompt (last quoted string or last N words)
  const quoted = prompt.match(/"([^"]+)"/)?.[1] ?? '';
  const subject = quoted || prompt.split(' ').slice(-6).join(' ');

  switch (workspace) {
    case 'swot':
      return `📋 SWOT ANALYSIS — ${subject}

✅ STRENGTHS
• Clear value proposition for a well-defined customer segment
• Scalable architecture with low marginal cost per user
• First-mover advantage in an emerging niche
• AI-native design reduces manual effort by 60–80%

⚠️ WEAKNESSES
• Brand recognition is limited at early stage
• Requires customer education on the core concept
• Feature depth needs 6–12 months to match incumbents
• Small team bandwidth constrains growth speed

🚀 OPPORTUNITIES
• Growing demand for AI-powered automation ($47B market, 23% CAGR)
• Underserved SMB segment abandoned by enterprise-focused players
• API-first approach enables ecosystem partnership distribution
• International expansion with minimal localisation cost

⚡ THREATS
• Well-funded incumbents may replicate key features
• Rapid AI model commoditisation reduces technical moat
• Customer acquisition costs rising across digital channels
• Regulatory uncertainty around AI-generated content

💡 VOXORA RECOMMENDATION
Double down on your top strength and the highest-impact opportunity. Ship to 10 paying customers in the next 30 days before expanding scope.`;

    case 'business':
      return `📊 BUSINESS MODEL CANVAS — ${subject}

🎯 VALUE PROPOSITION
Dramatically reduce the time and expertise required to ${subject.toLowerCase()} — delivering results in minutes instead of days.

👥 CUSTOMER SEGMENTS
• Solo founders & indie makers (high volume, viral potential)
• Early-stage startups (< 20 employees)
• SMB owners without dedicated strategy teams
• Freelancers and consultants serving these groups

📢 CHANNELS
• Product-led growth: free tier with generous limits → paid conversion
• Content marketing: SEO-optimised guides targeting high-intent queries
• Community: LinkedIn, X, Slack groups for the target audience
• Referral: 1-month credit for successful referrals

❤️ CUSTOMER RELATIONSHIPS
• Self-serve onboarding (< 3 min to first value)
• In-app AI assistance at every friction point
• Email sequences: activation, engagement, upgrade, renewal
• Dedicated Slack channel for top-tier accounts

💰 REVENUE STREAMS
• Starter: Free (3 uses/month) — growth engine
• Pro: $29/month — core revenue
• Team: $89/month — expansion revenue
• Enterprise: Custom — strategic accounts

🛠 KEY ACTIVITIES
• Continuous AI model improvement and prompt engineering
• Content production for organic acquisition
• Customer success and churn prevention
• Partnership development with adjacent tools

🤝 KEY PARTNERS
• AI infrastructure: OpenAI / Anthropic / Google
• Payments: Stripe
• Distribution: AppSumo, Product Hunt, SaaS directories

📦 KEY RESOURCES
• Proprietary prompt library and fine-tuned models
• Founding team domain expertise
• Early customer case studies and testimonials

💸 COST STRUCTURE
• AI API costs (variable, scales with usage)
• Cloud infrastructure (Vercel / AWS)
• Content production and SEO tools
• Team compensation

✅ VOXORA RECOMMENDATION
Validate the Pro tier price point with 10 paid users before automating the funnel. Churn data from month 1 will define your retention strategy.`;

    case 'competitor':
      return `🏆 COMPETITOR ANALYSIS — ${subject}

🎯 DIRECT COMPETITORS
• Market Leader A — dominant brand, $50–200/mo pricing, poor UX for non-technical users
• Challenger B — strong design, limited AI features, US-focused
• Niche Player C — narrow feature set, loyal community, slow roadmap

✅ THEIR STRENGTHS
• Established brand trust and customer base
• Large content libraries and SEO authority
• Deep integrations with enterprise tooling

❌ THEIR WEAKNESSES
• Expensive pricing excludes solo founders and SMBs
• Onboarding takes days, not minutes
• AI features are bolted-on, not native
• Customer support response times: 24–72 hours
• Monolithic design — hard to customise for niche workflows

🚀 YOUR DIFFERENTIATION OPPORTUNITIES
• AI-first architecture delivers results 10× faster
• Pricing accessible to bootstrapped founders ($29 vs $200+)
• Niche focus: serve one segment dramatically better
• Faster iteration cycle: ship weekly vs quarterly
• Direct founder relationship builds loyalty and referrals

⚠️ THREATS TO MONITOR
• Market leader launches competing AI tier (watch their changelog)
• VC-funded new entrant with aggressive pricing
• OpenAI / Google build adjacent features into base products

⭐ VOXORA RECOMMENDATION
Pick one competitor weakness and make it your loudest marketing message. Win on: speed to value, pricing, or niche specificity — not all three.`;

    case 'market':
      return `📊 MARKET RESEARCH — ${subject}

📈 MARKET SIZE & GROWTH
• Total Addressable Market (TAM): $12–47B globally (segment dependent)
• Serviceable Addressable Market (SAM): $2–8B for SMB-focused SaaS
• Target initial beachhead: $200–500M SAM
• CAGR: 18–27% driven by AI adoption and digital-first operations

🎯 TARGET CUSTOMER SEGMENTS
• Segment A: Solo founders / indie makers (15M+ globally, underserved)
• Segment B: Early-stage startups 1–20 employees (3M+ globally)
• Segment C: SMB owners without dedicated strategy teams (80M globally)

📊 KEY MARKET TRENDS
1. AI automation replacing manual research & planning workflows
2. Rise of "just-in-time" strategy — founders need insights in hours, not weeks
3. No-code preference: 73% of SMBs want tools requiring no technical skill
4. Shift from annual planning to continuous, real-time strategy iteration
5. Global SaaS adoption accelerating in emerging markets (40%+ YoY)

🏆 COMPETITIVE LANDSCAPE
• 3 established players hold ~60% market share
• 15–20 funded challengers competing on features
• Clear whitespace: AI-native, affordable, niche-focused solutions
• Consolidation expected in 18–24 months (watch for acqui-hire signals)

⚡ MARKET OPPORTUNITIES
• Underserved SMB segment: existing tools priced for enterprise
• Vertical SaaS: industry-specific versions command 2–3× pricing power
• API & ecosystem play: integrate into existing startup tool stacks
• International: English-first markets outside US have 40% lower CAC

⚠️ MARKET RISKS
• AI feature parity reached faster than expected by incumbents
• Macro downturn reducing startup formation and tool budgets
• Regulatory changes affecting AI-generated commercial content

💡 VOXORA RECOMMENDATION
Target the SMB segment first — they adopt fast, churn less than prosumers, and generate strong word-of-mouth when genuinely delighted.`;

    case 'research':
      return `🔬 CUSTOMER RESEARCH — ${subject}

👤 TARGET CUSTOMER PROFILE
Primary user: A time-poor operator who needs to make strategic decisions quickly without a dedicated analyst or consultant. Values tools that give them confidence, not complexity.

😓 TOP 5 PAIN POINTS
1. Spending 8–15 hours/week on research that should take 30 minutes
2. No systematic framework — strategy work is ad-hoc and inconsistent
3. Can't afford consultants ($5,000–$50,000/project)
4. Generic templates don't account for their specific business context
5. Insights arrive too late to act on — strategy lags behind market reality

💡 BUYING MOTIVATIONS
• Time savings with measurable ROI (hours → minutes)
• Confidence in decisions with data-backed recommendations
• Professional output that can be shared with co-founders or investors
• Lower cost alternative to hiring or outsourcing

📡 DISCOVERY CHANNELS
• Product Hunt launches (early adopters)
• LinkedIn thought leadership in the target community
• Founder communities: YC, Indie Hackers, Twitter/X
• SEO: "how to do [task] without a consultant"
• Word-of-mouth from happy customers (highest LTV cohort)

💰 WILLINGNESS TO PAY SIGNALS
• Currently paying for: Notion, Linear, Airtable ($20–100/mo range)
• Would pay: $25–49/month for a tool that saves 5+ hours/week
• Enterprise tier tolerance: $99–299/month for team access
• Price-sensitive trigger: free trial or freemium required for conversion

🎤 5 CUSTOMER VALIDATION QUESTIONS
1. "Walk me through the last time you had to make a strategic decision — how did you approach it?"
2. "What tools do you currently use for research and planning? What frustrates you most?"
3. "How much time do you spend per week on strategy vs execution?"
4. "If you could get a complete [${subject}] analysis in 2 minutes, what would that be worth to you?"
5. "What would need to be true about a new tool for you to recommend it to your network?"

💡 VOXORA RECOMMENDATION
Run 8–10 discovery calls before building. Focus on pain, not features. The customer's words from these calls are your best marketing copy.`;

    case 'validation':
      return `✅ PRODUCT VALIDATION — ${subject}

🔍 DEMAND SIGNALS
• Search volume for related terms: High (10K–100K monthly searches)
• Community discussions: Active threads on Reddit, Indie Hackers, LinkedIn
• Existing workarounds: People using 3+ tools to cobble together a solution
• Competitor traction: Similar products report $10K–$100K MRR
• Willingness to pay: Early conversations show $25–75/month range

⚡ 7-DAY VALIDATION EXPERIMENT
Day 1–2: Create a landing page (headline, 3 benefits, email capture, "Join waitlist")
Day 3–4: Share in 5 target communities with a genuine, value-first message
Day 5: Run $50 in LinkedIn or X ads to the landing page
Day 6: Email captured leads and offer a 30-min call
Day 7: Analyse conversion rates and schedule 3+ calls

✅ SUCCESS CRITERIA (Go)
• 50+ email signups from organic posts
• 3+ people who say "I would pay for this right now"
• Landing page conversion > 20%
• At least 1 person willing to pay before it's built

❌ FAILURE CRITERIA (No-Go / Pivot)
• < 20 email signups after 7 days of active promotion
• Zero calls booked with interested users
• Feedback consistently misses your assumed pain point
• Similar product found with 10× more traction you can't differentiate from

🎤 5 QUESTIONS TO ASK POTENTIAL CUSTOMERS
1. "Is this a problem you face regularly, or just occasionally?"
2. "What do you do today to solve this — what's your current workaround?"
3. "Would you pay $X/month for this? Why or why not?"
4. "Who else in your network would want this?"
5. "What would make you immediately stop using this after signing up?"

🏁 GO / NO-GO DECISION FRAMEWORK
✅ GO if: 50+ signups, 3+ willing payers, clear differentiation from existing tools
⚠️ PIVOT if: demand exists but problem framing is wrong — adjust and re-test
❌ STOP if: < 20 signups, no paying intent, problem is a vitamin not a painkiller

💡 VOXORA RECOMMENDATION
Don't build yet. Spend 7 days validating demand with zero code. One pre-sale is worth 1,000 data points.`;

    case 'persona':
      return `👤 CUSTOMER PERSONA — ${subject}

📋 PERSONA: "The Founder in the Arena"

🧑 DEMOGRAPHICS
• Name: Alex (composite persona)
• Age: 28–42
• Role: Founder / Co-founder / Head of Product
• Location: US, UK, Canada, Australia (English-speaking markets)
• Team size: 1–10 people
• Revenue stage: Pre-revenue to $500K ARR

🎯 GOALS
• Launch and validate a product idea within 90 days
• Generate first $10K MRR without hiring
• Make confident decisions backed by real data, not gut feel
• Build a business that doesn't require a 100-person team

😤 FRUSTRATIONS
• Wasting days on research that competitors seem to skip
• Expensive consultants who deliver generic slide decks
• Tools that require an MBA to interpret
• Analysis paralysis from too much information, too little direction
• Building features users don't want (costly mistake they've made before)

🛠️ DAILY WORKFLOW
• 6am: Checks metrics, responds to overnight messages
• Morning: Deep work (product / code / strategy)
• Afternoon: Calls with customers, partners, or team
• Evening: Content creation, community engagement, planning
• Uses: Notion, Linear, Slack, Figma, Google Workspace, ChatGPT

💭 HOW THEY THINK
• "I'd rather ship something imperfect than overthink it"
• "If it doesn't make me money or save me time, I cut it"
• "I trust tools that other founders recommend in communities"
• "Free trials are mandatory — I don't buy software blind"

🚫 OBJECTIONS TO BUYING
• "I can just use ChatGPT for this" → Counter: structured outputs + context memory
• "I've been burned by tools I stopped using" → Counter: show 5-min time to value
• "It's too expensive" → Counter: free tier, ROI calculator, cancel anytime

💡 HOW THIS PRODUCT FITS THEIR LIFE
This persona's biggest bottleneck is strategic clarity — they know what to build but not always why or for whom. A tool that gives them a research-backed strategic framework in minutes (not days) directly unlocks their ability to ship faster with confidence.`;

    case 'content':
      return `✍️ CONTENT IDEAS — ${subject}

📝 8 HIGH-IMPACT CONTENT IDEAS

1. 📖 "The Ultimate Guide to ${subject}"
   Audience: Beginners entering the space | Format: Long-form article (3,000+ words)
   Angle: Definitive resource that ranks for head terms

2. 🧵 "10 Things Nobody Tells You About ${subject}"
   Audience: Practitioners who've been burned by bad advice | Format: Twitter/X thread
   Angle: Counter-intuitive truths that challenge conventional wisdom

3. 🎥 "I Tried ${subject} for 30 Days — Here's What Happened"
   Audience: Sceptics considering trying it | Format: YouTube / TikTok video
   Angle: Authentic personal experiment with honest results

4. 📊 "The ${subject} Framework Used by Top Founders"
   Audience: Ambitious early-stage founders | Format: LinkedIn post + PDF
   Angle: System and process, not just theory

5. 🔥 "${subject}: Mistakes That Cost Startups $100K+"
   Audience: Risk-aware founders | Format: Case study newsletter
   Angle: Failure stories that create urgency

6. 💡 "How to ${subject} Without [Common Painful Tool]"
   Audience: Tool-fatigued operators | Format: Tutorial article + video
   Angle: Easier alternative positioning

7. 🎙️ "Founders Reveal Their ${subject} Strategy (Roundup)"
   Audience: Community builders and aspirers | Format: Interview compilation
   Angle: Social proof + diverse perspectives

8. 📧 "The ${subject} Checklist: Never Miss a Step Again"
   Audience: Systematic thinkers | Format: Email lead magnet
   Angle: Downloadable checklist for list building

💡 VOXORA RECOMMENDATION
Lead with #1 (SEO anchor), promote with #2 (viral potential), and convert with #8 (lead capture). Ship one per week.`;

    case 'apps':
      return `💡 APP IDEAS — ${subject}

🚀 6 HIGH-POTENTIAL APP CONCEPTS

1. 🤖 "${subject}AI"
   One-liner: AI-powered ${subject} tool that delivers results in 60 seconds
   Core feature: One-input generation engine with export to PDF/Notion
   Target user: Founders who need ${subject} insights without hiring an analyst
   Monetisation: Freemium → $19/mo Pro
   Why now: AI model costs dropped 10× in 12 months — margins finally work

2. 📊 "${subject} Dashboard"
   One-liner: Real-time ${subject} metrics in one clean dashboard
   Core feature: Connect 3 sources (Stripe, Google Analytics, Notion) in one click
   Target user: Bootstrapped founders tracking what matters
   Monetisation: $12/mo flat → team tier $49/mo
   Why now: Tool fatigue is creating demand for consolidation

3. 🤝 "${subject} Matchmaker"
   One-liner: Find collaborators or customers based on ${subject} compatibility
   Core feature: Profile + smart matching algorithm
   Target user: Solo founders and freelancers in the space
   Monetisation: Free connection, premium filtering $9/mo
   Why now: Community-led growth is replacing paid acquisition

4. 📱 "${subject} Mobile-First"
   One-liner: The ${subject} workflow designed for your phone
   Core feature: Voice-to-insight: speak your question, get structured output
   Target user: Founders always on the move, minimal desk time
   Monetisation: $7/mo — low friction, high volume
   Why now: Mobile-first SaaS is underserved vs desktop tools

5. 🔌 "${subject} for [Niche]"
   One-liner: ${subject} tool built specifically for [e-commerce / agencies / coaches]
   Core feature: Vertical-specific templates and benchmarks
   Target user: Practitioners who feel generic tools miss their context
   Monetisation: $29/mo with industry data add-ons
   Why now: Vertical SaaS multiples are 3–5× higher than horizontal

6. 🌐 "${subject} API"
   One-liner: Add ${subject} capabilities to any app with 3 lines of code
   Core feature: REST API with SDKs for JS, Python, and Ruby
   Target user: Developers building products in the space
   Monetisation: Pay-per-call + $99/mo for high-volume tiers
   Why now: Developer-first tools have fastest adoption curves

💡 VOXORA RECOMMENDATION
Validate #1 first (broadest market, fastest to build MVP). Use #6 as a long-term moat builder once core product achieves PMF.`;

    case 'startup':
      return `🚀 STARTUP IDEAS — ${subject}

💡 5 VALIDATED STARTUP OPPORTUNITIES

1. 🤖 AI-Powered ${subject} Co-Pilot
   Problem: Doing ${subject} manually takes 8–20 hours and requires expertise most founders don't have
   Solution: AI engine that generates research-backed outputs in under 2 minutes
   Market: $2B+ and growing at 25% CAGR
   Validation signal: ChatGPT users are already hacking this workflow with manual prompts
   Go-to-market: Product Hunt + founder communities on Day 1
   Revenue model: Freemium SaaS, $29–99/month

2. 📡 ${subject} Data Intelligence Platform
   Problem: Decisions are made on gut feel because structured ${subject} data doesn't exist for SMBs
   Solution: Aggregate, normalise, and surface ${subject} insights from public and proprietary sources
   Market: Data & analytics SaaS ($50B market)
   Validation signal: Analysts are selling manual ${subject} reports for $500–5,000 each
   Go-to-market: Replace one consultant's deliverable
   Revenue model: $99–499/month or per-report pricing

3. 🏢 ${subject} for [Specific Vertical]
   Problem: Generic tools miss critical context for [e-commerce / healthcare / fintech] use cases
   Solution: Vertical-specific ${subject} platform with industry benchmarks built-in
   Market: Vertical SaaS is 3–5× more defensible than horizontal
   Validation signal: High churn from generic tools in target vertical
   Go-to-market: Partner with 1 industry association or community
   Revenue model: $79–299/month with vertical-specific data add-ons

4. 🔌 ${subject} API & Developer Tools
   Problem: Every company is building ${subject} features from scratch
   Solution: Embeddable ${subject} capabilities via simple REST API
   Market: API-first developer tools (fastest adoption category)
   Validation signal: GitHub repos with 1K+ stars solving adjacent problems
   Go-to-market: Developer communities, technical content marketing
   Revenue model: Usage-based + enterprise contracts

5. 🌍 ${subject} for Emerging Markets
   Problem: ${subject} tools are built for US/EU, priced in USD, and culturally irrelevant elsewhere
   Solution: Localised ${subject} platform with emerging market pricing and context
   Market: 1B+ underserved SMBs outside US/EU
   Validation signal: WhatsApp-based ${subject} communities in target markets
   Go-to-market: Local distributor partnerships
   Revenue model: $5–15/month (high volume, low price)

💡 VOXORA RECOMMENDATION
Idea #1 has the fastest path to first revenue. Start there, build #4 as a moat after PMF.`;

    default: {
      // General / chat response
      const msgs = req.messages || [];
      const lastUserMsg = [...msgs].reverse().find(m => m.role === 'user')?.content || prompt;
      return `Great question about: "${lastUserMsg.slice(0, 80)}"

Here's a structured perspective based on current best practices:

**Key Insight**
The most successful founders approach this by focusing on the 20% of actions that drive 80% of the results. In this context, that means validating assumptions before building, and shipping to real users as early as possible.

**Recommended Next Steps**
1. **Clarify the core problem** — Write it in one sentence from the customer's perspective
2. **Identify your smallest experiment** — What's the minimum test to validate demand?
3. **Talk to 5 potential users this week** — Qualitative insight beats quantitative data at early stage
4. **Define your success metric** — What number, 30 days from now, tells you whether this is working?

**Common Pitfalls to Avoid**
• Building in isolation without customer feedback loops
• Optimising too early (conversion, retention, pricing) before achieving PMF
• Competing on features instead of on outcomes for a specific customer segment

**Resources Worth Exploring**
• The Mom Test by Rob Fitzpatrick (customer interview framework)
• Lean Startup methodology for structured validation
• Y Combinator's "Do Things That Don't Scale" essay

Is there a specific aspect of this you'd like me to go deeper on?`;
    }
  }
}

// ── Mock Provider Implementation ──────────────────────────────────────────────
export class MockProvider implements AIProvider {
  readonly name  = 'mock' as const;
  readonly model = 'voxora-mock-v1';

  isAvailable(): boolean { return true; }

  async generate(req: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    await delay(mockDelay());
    const content = generateMockResponse(req);
    return {
      content,
      provider:     'mock',
      tokensUsed:   estimateTokens(req.prompt + content),
      responseTime: Date.now() - start,
      model:        this.model,
    };
  }

  async stream(req: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
    const start   = Date.now();
    const content = generateMockResponse(req);
    const words   = content.split(' ');

    // Simulate streaming: emit one word at a time with small delay
    for (let i = 0; i < words.length; i++) {
      await delay(25 + Math.random() * 30);
      onChunk((i === 0 ? '' : ' ') + words[i]);
    }

    return {
      content,
      provider:     'mock',
      tokensUsed:   estimateTokens(req.prompt + content),
      responseTime: Date.now() - start,
      model:        this.model,
    };
  }
}
