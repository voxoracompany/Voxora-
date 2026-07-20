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

    case 'emailCampaign':
      return `📧 EMAIL DRIP CAMPAIGN — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 EMAIL 1 — WELCOME & HOOK (Day 0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: The one thing founders get wrong about ${subject}
Preview: You're probably making this mistake right now...

Hey {first_name},

You just signed up — which tells me you're serious about ${subject}.

Most founders approach it completely backwards. They spend weeks building, analysing, and planning... then wonder why nothing is converting.

Here's the thing: the founders who succeed with ${subject} do one counterintuitive thing first.

[→ Read the 3-minute breakdown]

They validate before they invest.

Tomorrow, I'll show you exactly how to do that in 7 days or less.

— The Voxora Team

P.S. Hit reply and tell me your #1 challenge with ${subject}. I read every response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 EMAIL 2 — VALUE & CASE STUDY (Day 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: How [Founder] got 47 customers in 30 days with ${subject}
Preview: No ads. No team. Just this one framework.

Hey {first_name},

Remember what I said about validating first?

Here's what that looks like in practice...

[CASE STUDY: 3 bullet points showing concrete outcome]

The entire strategy took 6 hours to build using Voxora AI.

The result? 47 paying customers before writing a single line of code.

Want to see the exact framework?

[→ Generate your ${subject} strategy in 2 minutes — it's free]

— The Voxora Team

P.S. The founders who act this week will have a 30-day head start on everyone else.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 EMAIL 3 — CONVERSION (Day 7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: Last chance to get your ${subject} plan (closing soon)
Preview: This offer expires in 24 hours.

Hey {first_name},

Quick check-in — did you get a chance to try Voxora?

If you're still on the fence, here's what you get when you upgrade to Pro:

✅ Unlimited ${subject} analysis
✅ AI-powered competitor intelligence
✅ Full content calendar generation
✅ Export everything as PDF or Notion

Regular price: $49/month
Your price this week: $29/month

[→ Lock in the $29 rate — 24 hours left]

This isn't a manufactured scarcity. This pricing closes when we hit 500 Pro users.

We're at 487.

— The Voxora Team

P.S. Even if you don't upgrade, keep using the free tier. But don't say I didn't warn you when the price goes up. 😊`;

    case 'socialMedia':
      return `📱 SOCIAL MEDIA CONTENT PLAN — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 LINKEDIN POSTS (5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST 1 — INSIGHT (Monday)
"Most founders think ${subject} is complicated.

It's not. You're just doing it in the wrong order.

Here's the 3-step framework that changed everything for me:

1. Validate the problem (before building)
2. Identify one beachhead customer
3. Solve it manually first, then automate

The founders who skip step 1 spend 6 months building the wrong thing.

The ones who do step 1 ship in 6 weeks.

Which camp are you in? 👇"
[CTA: Share your biggest ${subject} challenge in the comments]

POST 2 — STORY (Wednesday)
"6 months ago I almost gave up on ${subject}.

Then I did one thing differently.

[3-paragraph story with clear turning point and outcome]

The lesson? The market doesn't reward effort. It rewards clarity.

If you're stuck on ${subject}, save this post. You'll thank yourself later."
[CTA: Follow for weekly founder insights]

POST 3 — DATA (Friday)
"73% of founders fail at ${subject} for the same reason:

They optimise before they validate.

The data is clear:
• Founders who validate first: 3× higher success rate
• Time to first revenue: 6 weeks vs 6 months
• Customer churn in year 1: 40% lower

The framework isn't secret. The discipline to follow it is rare.

Build the discipline."
[CTA: Save this for your next planning session]

POST 4 — CONTRARIAN (Tuesday)
"Unpopular opinion: most ${subject} advice is wrong.

Everyone tells you to:
❌ Research your market for months
❌ Build a perfect product
❌ Hire a team before launching

What actually works:
✅ Ship something ugly in 2 weeks
✅ Talk to 10 customers
✅ Charge from day one

Agree or disagree? Comment below."
[CTA: Follow for contrarian founder takes]

POST 5 — TOOL/RESOURCE (Thursday)
"I built a ${subject} strategy in 4 minutes using AI.

Here's what it covered:
📊 Full market analysis
🎯 Competitor positioning map
📧 3-email launch sequence
📱 30-day social content plan
💰 Revenue projection framework

Old way: hire a consultant ($5,000–$50,000)
New way: Voxora AI (free to try)

Link in bio — no email required."
[CTA: Try it free, link in bio]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐦 X/TWITTER THREADS (5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

THREAD 1: "The ${subject} playbook that generated $100K MRR (thread) 🧵"
→ 8-tweet thread: problem, framework, step-by-step, result, CTA

THREAD 2: "I studied 50 failed startups. They all made the same ${subject} mistake:"
→ 6-tweet thread: the mistake, why it happens, how to avoid it

THREAD 3: "How to do ${subject} in 2 hours instead of 2 months:"
→ 7-tweet practical how-to thread with actionable steps

THREAD 4: "The ${subject} tools I actually use (and which ones are a waste of money):"
→ 5-tweet honest review thread

THREAD 5: "If I were starting ${subject} from scratch today, I'd do this:"
→ 6-tweet aspirational framework thread

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 INSTAGRAM CAPTIONS (3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPTION 1 (Carousel — educational):
"The ${subject} framework that nobody teaches you in business school 📚
[Visual: clean infographic with 4 steps]
Save this for your next planning session.
#startups #founder #${subject.toLowerCase().replace(/\s+/g, '')} #entrepreneurship"

CAPTION 2 (Quote card):
"The best time to figure out your ${subject} was before you started. The second best time is right now.
What's your biggest ${subject} challenge? Drop it in the comments 👇
#founderlife #startup #growth"

CAPTION 3 (Behind-the-scenes):
"Real talk: here's what ${subject} actually looks like in the early days...
[Authentic, messy, real photo/screenshot]
It's not pretty. But this is where the breakthroughs happen.
Tag a founder who needs to hear this today 💪"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 TIKTOK HOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━
"POV: You're a founder who just discovered the ${subject} strategy that made your competitor $50K in 30 days... and it only took them 4 hours to build. Here's exactly what they did:" [cut to screen recording or whiteboard breakdown]`;

    case 'seoPlanner':
      return `🔍 SEO PLAN — ${subject}

📊 KEYWORD STRATEGY

🎯 PRIMARY KEYWORDS (High Volume, High Intent)
1. "${subject}" — Est. 10K–50K searches/mo | Difficulty: High | Priority: Build authority toward
2. "best ${subject} tools" — Est. 5K–20K/mo | Difficulty: Medium | Priority: Product pages
3. "how to do ${subject}" — Est. 8K–30K/mo | Difficulty: Medium | Priority: Guide content
4. "${subject} for startups" — Est. 2K–8K/mo | Difficulty: Low-Medium | Priority: Quick win

🌱 LONG-TAIL KEYWORDS (Lower Volume, Higher Conversion)
• "how to do ${subject} without experience" — 500–2K/mo | Difficulty: Low
• "${subject} checklist for founders" — 200–800/mo | Difficulty: Low
• "${subject} vs [alternative]" — 300–1K/mo | Difficulty: Low
• "best ${subject} strategy for small business" — 400–1.5K/mo | Difficulty: Low
• "${subject} mistakes to avoid" — 600–2K/mo | Difficulty: Low

📚 CONTENT CLUSTER ARCHITECTURE

🏛️ PILLAR PAGE: "The Complete Guide to ${subject}" (Target: "${subject}")
  ↳ Cluster 1: "How to Get Started with ${subject}"
  ↳ Cluster 2: "Top ${subject} Tools & Resources"
  ↳ Cluster 3: "${subject} Templates & Frameworks"
  ↳ Cluster 4: "${subject} Case Studies"
  ↳ Cluster 5: "${subject} Mistakes to Avoid"

⚡ QUICK-WIN OPPORTUNITIES (Rank in 30–60 Days)
1. "${subject} checklist" — low competition, high intent, easy to rank with a downloadable asset
2. "${subject} vs [specific alternative]" — comparison content converts at 5× the rate of informational
3. "Free ${subject} template" — captures emails + ranks for transactional queries
4. "What is ${subject}?" — featured snippet opportunity with a concise 40-60 word definition

🏆 COMPETITOR KEYWORD GAPS
• Competitors ranking for: "[adjacent term]", "[related tool name]", "how to [related task]"
• You can outrank them on: long-tail how-to content, comparison pages, niche-specific guides
• Fastest path: create better, more actionable content on terms where competitors rank page 2

📅 90-DAY CONTENT CALENDAR

Month 1 (Foundation):
• Week 1: Pillar page — "Complete Guide to ${subject}" (3,000+ words)
• Week 2: Quick win — "${subject} Checklist" (1,000 words + downloadable PDF)
• Week 3: Comparison — "${subject} vs [Alternative]" (1,500 words)
• Week 4: Definition — "What is ${subject}?" (800 words, optimise for featured snippet)

Month 2 (Authority):
• Week 5: Case study — "How [Company] Used ${subject} to [Result]"
• Week 6: Tool roundup — "10 Best ${subject} Tools in 2026"
• Week 7: How-to — "How to Do ${subject} in 7 Days"
• Week 8: Template — "Free ${subject} Template for Founders"

Month 3 (Conversion):
• Week 9: Landing pages for each primary keyword
• Week 10: Guest posts on 3 high-DA industry publications
• Week 11: Internal linking audit + optimise existing content
• Week 12: Measure, analyse, double down on top performers

💡 VOXORA RECOMMENDATION
Start with the pillar page this week. It creates the content hub everything else links to. Aim for 3,000+ words, 10+ internal links to cluster content, and a lead magnet (checklist or template) to capture emails from organic traffic.`;

    case 'adCopy':
      return `📢 AD COPY VARIATIONS — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 GOOGLE SEARCH ADS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

VARIATION A (Problem-focused)
Headline 1: Stop Struggling With ${subject}
Headline 2: AI-Powered Results in 2 Minutes
Headline 3: Trusted by 10,000+ Founders
Description 1: Generate professional ${subject} insights without the consultant price tag. Start free today.
Description 2: Save 8+ hours per week. Export to PDF or Notion instantly. No credit card required.

VARIATION B (Benefit-focused)
Headline 1: ${subject} Made Simple
Headline 2: From Idea to Strategy in Minutes
Headline 3: Free to Try — No Credit Card
Description 1: The AI platform that turns your ${subject} challenges into clear action plans. Used by 10K+ founders.
Description 2: Join the founders saving 8 hours per week with Voxora AI. Get started free today.

VARIATION C (Social proof)
Headline 1: #1 AI Tool for ${subject}
Headline 2: 10,000+ Founders Can't Be Wrong
Headline 3: Try Free — See Results Today
Description 1: "Saved me $5,000 in consultant fees and got better results." — real founder review
Description 2: Professional ${subject} analysis in minutes. Join 10,000+ founders using Voxora AI.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📘 FACEBOOK / INSTAGRAM AD
━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY TEXT:
Tired of spending days on ${subject} research that should take 30 minutes?

Meet Voxora AI — the platform that gives you professional-grade ${subject} insights in under 2 minutes.

✅ No consultants. No expensive agencies.
✅ Export everything as PDF or Notion
✅ Works for any business, any stage

Over 10,000 founders are already using it.

Try it free today. No credit card required. →

Headline: ${subject} in 2 Minutes — Try Free
CTA Button: Learn More / Sign Up / Try for Free

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 LINKEDIN AD
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Introductory Text:
Founders: still spending days on ${subject} research?

The top 1% of builders have a different system. They use AI to generate the same quality output in 2 minutes — then spend their time executing.

Voxora AI gives you professional ${subject} analysis, competitor intelligence, and strategic frameworks instantly.

Join 10,000+ founders already working smarter.

Headline: AI-Powered ${subject} for Serious Founders
CTA: Try Voxora Free

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐦 TWITTER / X AD
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Copy A: Founders: your ${subject} strategy shouldn't take 3 weeks. Voxora AI builds it in 2 minutes. Free to try →
Copy B: Stop paying $5,000 for ${subject} consulting. Get the same quality output from AI in 2 minutes. →
Copy C: 10,000+ founders use Voxora to handle ${subject} in minutes, not weeks. Join them free →

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 YOUTUBE PRE-ROLL (15 SECONDS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

[0–3s HOOK — before skip button]
"What if ${subject} took 2 minutes instead of 2 weeks?"

[3–10s VALUE]
"Voxora AI gives founders professional-grade ${subject} analysis instantly. No consultants. No MBA required."

[10–15s CTA]
"Try it free at voxora.com — no credit card needed."

💡 VOXORA RECOMMENDATION
Test Variation A (Google) against Variation B for 7 days with $50 budget. Winner determines your core message. Run the Facebook ad to lookalike audience of your current users for fastest results.`;

    case 'contentCalendar':
      return `📅 4-WEEK CONTENT CALENDAR — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📆 WEEK 1 — FOUNDATION (Establish Authority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 LONG-FORM CONTENT
Article 1 (Monday): "The Complete Beginner's Guide to ${subject}" — 3,000 words, SEO-optimised, targets head keyword. Goal: organic traffic + email capture via inline CTA.
Article 2 (Thursday): "${subject} Mistakes That Cost Startups 6 Months" — 1,500 words. Goal: social sharing + positioning as trusted advisor.

📱 SOCIAL POSTS (Mon–Fri)
Mon: LinkedIn — "The #1 thing founders get wrong about ${subject}" [insight post]
Tue: X/Twitter — "5 ${subject} facts that will change how you think about growth" [thread]
Wed: Instagram — Behind-the-scenes reel on your ${subject} process
Thu: LinkedIn — Share article + key takeaway quote card
Fri: X/Twitter — Week recap + one actionable tip for the weekend

📧 EMAIL NEWSLETTER
Subject: "The ${subject} framework we use every Monday morning"
Content: 3 actionable tips + link to Week 1 articles + one reader success story

🎥 SHORT-FORM VIDEO
Concept: "I analysed 100 successful ${subject} strategies — here's what they all had in common" (60-second TikTok/Reel)

🎁 LEAD MAGNET
"The ${subject} Starter Checklist" — 1-page PDF, gate behind email signup. Promote via all channels this week.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📆 WEEK 2 — EDUCATION (Build Trust)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 LONG-FORM CONTENT
Article 3: "How [Founder Name] Built $10K MRR Using This ${subject} Approach" — Case study. Goal: social proof + conversion.
Article 4: "${subject} Tools Compared: Which One is Right for Your Stage?" — Tool roundup. Goal: comparison traffic + affiliate/partner opportunities.

📱 SOCIAL — Theme: "Proof & Data"
Mon: LinkedIn case study excerpt (with founder quote)
Tue: X thread — "Data from 50 ${subject} strategies: what works, what doesn't"
Wed: Instagram carousel — "5 ${subject} stats that surprised us"
Thu: LinkedIn — Share tool comparison article + your recommendation
Fri: X — Community question: "What's your ${subject} process?"

📧 EMAIL
Subject: "How [Name] did it — ${subject} case study breakdown"
Content: Full case study with lessons + CTA to free trial

🎥 VIDEO: "Real vs Fake ${subject} advice — how to tell the difference"

🎁 LEAD MAGNET: "${subject} Strategy Template" — Notion template download

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📆 WEEK 3 — CONVERSION (Drive Action)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 LONG-FORM CONTENT
Article 5: "How to Do ${subject} in 7 Days (Step-by-Step)" — Tutorial. Goal: bottom-of-funnel conversion + featured snippet.
Article 6: "${subject} vs [Alternative]: Which Approach Wins in 2026?" — Comparison. Goal: high-intent comparison traffic.

📱 SOCIAL — Theme: "Take Action"
All posts this week include clear CTA to try free tool or download resource.

📧 EMAIL: Product-focused newsletter with trial CTA and limited-time offer

🎥 VIDEO: "I tried 5 ${subject} strategies in one week — here's what happened"

🎁 LEAD MAGNET: "Free ${subject} Audit" — interactive worksheet

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📆 WEEK 4 — COMMUNITY (Retain & Amplify)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 LONG-FORM CONTENT
Article 7: "The ${subject} Questions Founders Ask Most (Answered)" — FAQ. Goal: long-tail SEO + customer support deflection.
Article 8: Monthly round-up — "Best ${subject} Insights from [Month]" — Curation. Goal: easy to produce, high shareability.

📱 SOCIAL — Theme: "Community & Conversation"
Focus on engagement: polls, questions, reposts of customer wins, community shoutouts.

📧 EMAIL: Community-focused — reader wins, curated content, invitation to share their story

🎥 VIDEO: "Your ${subject} questions answered" — Q&A format

🎁 LEAD MAGNET: "${subject} Resource Vault" — curated collection of best tools + templates

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 KEY METRICS TO TRACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Organic sessions (target: +20% week-on-week)
• Email signups from lead magnets (target: 50+/week)
• Social engagement rate (target: >3% per post)
• Trial signups from content (track UTMs)
• Email open rate (target: >35%)

💡 VOXORA RECOMMENDATION
Batch-produce Week 1 content before publishing. Schedule everything on Sunday so you can focus on engagement (replies, comments) during the week — not creation.`;

    case 'brandVoice':
      return `🎙️ BRAND VOICE & MESSAGING FRAMEWORK — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 BRAND PERSONALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━

5 Core Adjectives:
1. Sharp — We cut through complexity and get to the point
2. Ambitious — We believe big is possible, and we help you get there
3. Grounded — We're honest about what works and what doesn't
4. Energetic — We move fast and bring urgency to everything
5. Human — We talk like founders, not corporations

Brand Archetype: The Mentor
We've been where you are. We know the obstacles. And we have the shortcuts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗣️ TONE OF VOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASUAL, not formal  |  ENERGETIC, not breathless  |  DIRECT, not blunt
CONFIDENT, not arrogant  |  WARM, not fluffy

EXAMPLE — Same message, different tones:

❌ Corporate: "Our platform leverages cutting-edge artificial intelligence to deliver optimised ${subject} outcomes."
✅ Voxora voice: "Voxora AI handles your ${subject} in 2 minutes. You focus on shipping."

❌ Over-casual: "Yo! ${subject} is super hard amirite? We got you lol 🔥"
✅ Voxora voice: "Most founders waste 10+ hours on ${subject}. We think that's absurd. So we fixed it."

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 CORE MESSAGING PILLARS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

PILLAR 1: SPEED
We believe founder time is the scarcest resource. Everything we build returns hours to your week.
Key phrases: "in minutes", "instantly", "stop wasting time", "faster path"

PILLAR 2: CLARITY
We cut through information overload and give you clear, actionable direction.
Key phrases: "clear action plan", "no fluff", "exactly what to do", "straight answer"

PILLAR 3: CONFIDENCE
We give founders the same quality insights as a $50,000 consultant — without the price tag.
Key phrases: "backed by data", "proven frameworks", "make confident decisions"

PILLAR 4: MOMENTUM
We're built for founders who ship. We celebrate progress over perfection.
Key phrases: "ship faster", "first customer", "stop overthinking", "move"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ TAGLINE OPTIONS (5 Variations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. "Your unfair advantage." — Simple, confident, aspirational
2. "Build smarter. Ship faster." — Action-oriented, founder-focused
3. "The AI co-pilot for serious founders." — Clear positioning, strong persona
4. "Strategy in minutes. Growth in months." — Time + result contrast
5. "Stop guessing. Start building." — Problem/solution, direct

Recommended: #3 for brand consistency. Test #5 in ads for conversion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DO SAY / ❌ NEVER SAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DO SAY
• "founders" (not "users" or "customers")
• "ship" (not "deploy" or "release")
• Specific numbers ("2 minutes", "10,000+ founders")
• Direct imperative verbs ("try", "build", "start", "ship")
• Honest limitations ("this works best when...", "not for everyone")

❌ NEVER SAY
• "synergy", "leverage", "paradigm", "ecosystem" (corporate jargon)
• "AI-powered" alone — always explain the benefit
• "We believe in..." — show it, don't say it
• "Revolutionary" or "disruptive" — overused, meaningless
• Passive voice ("results can be achieved" → "you achieve results")

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ WRITING STYLE GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sentences: Short. Max 20 words for key points. Vary rhythm.
Paragraphs: Max 3 sentences on web. 1–2 on social.
Punctuation: Use em-dashes for impact — like this. Minimal exclamation marks (max 1 per piece).
Numbers: Always use numerals ("10 minutes", not "ten minutes")
Headlines: Sentence case, not Title Case. Action-oriented.

💡 VOXORA RECOMMENDATION
Lead with Pillar 1 (Speed) in top-of-funnel content. Shift to Pillar 3 (Confidence) closer to conversion. The tagline "#3" should appear in your bio, email footer, and paid ads immediately.`;

    case 'fundraisingStrategy':
      return `🚀 FUNDRAISING STRATEGY — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 ROUND TYPE & AMOUNT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommended Stage: Pre-Seed / Seed
Amount to Raise: $250,000–$1,500,000

Why this amount:
• 18 months runway at current burn rate
• Enough to hit the next de-risking milestone (first $10K MRR / 500 users)
• Not so much that you take excessive dilution before proving PMF
• Rule of thumb: raise 18–24 months of runway, never more than you can deploy productively

Valuation range: $2M–$6M pre-money (pre-seed) / $5M–$15M pre-money (seed)
Dilution to expect: 15–25% (target the lower end — negotiate hard on valuation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 IDEAL INVESTOR PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary targets — Angel Investors:
• Former founders in your vertical who understand the pain point firsthand
• Operators turned investors (ex-Google, Stripe, Shopify) with relevant network
• Domain experts who can open doors to your first 100 customers
• Check size: $25K–$250K

Secondary targets — Micro-VCs / Pre-seed funds:
• Funds with AUM $20–$100M (they need small checks, not $1M minimum)
• Known for founder-friendly terms (look for 1× non-participating preferred)
• Stage-appropriate: actively lead or participate in $500K–$1.5M rounds
• Check size: $100K–$500K

Do NOT target:
• Tier 1 VCs (Sequoia, a16z) — too early, wrong check size, distracts you
• Strategic investors (corporate VCs) — slow process, agenda conflicts
• Family offices without startup experience — slow, unpredictable

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 5 SPECIFIC INVESTOR ARCHETYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. THE DOMAIN EXPERT ANGEL
Profile: 10+ years in your industry, recently sold company or went from operator to angel
Value: Customer introductions, market credibility, honest product feedback
Where to find: Twitter/X, LinkedIn, AngelList, YC alumni network
First message: Lead with the specific problem, ask for 20-min call, not money

2. THE COMMUNITY INVESTOR
Profile: Active in your target customer community (Indie Hackers, specific Slack groups)
Value: Distribution through their audience, authentic community credibility
Where to find: The same communities your customers live in
First message: Build a genuine relationship FIRST, then raise when they know your work

3. THE PORTFOLIO SYNERGY INVESTOR
Profile: Has invested in adjacent companies (your potential partners or integrations)
Value: Warm intros to their portfolio companies, ecosystem knowledge
Where to find: Check LinkedIn of investors in companies you'd want to partner with
First message: Reference the synergy explicitly — "I noticed you invested in X, we solve Y for their customers"

4. THE OPERATOR ANGEL
Profile: Current or former exec at a company your customers use (Notion, Figma, Linear)
Value: Product sense, recruiting network, potential enterprise channel
Where to find: LinkedIn search "[Company] + VP/Director + angel"
First message: Lead with product vision, not just numbers

5. THE SUPER CONNECTOR
Profile: Well-networked individual who makes 20+ angel investments/year
Value: Warm intros to institutional VCs, high-quality co-investors
Where to find: AngelList, Twitter/X, FirstRound's "Notable" lists
First message: Be concise — they see hundreds of decks. One-line hook + clear ask

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 FUNDRAISING TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Month 1 — PREPARATION (Do NOT skip this)
✅ Metrics dashboard ready and updated weekly
✅ Data room: deck, financials, product demo, cap table, team bios
✅ List of 100 target investors (prioritised by fit)
✅ Warm intro paths identified for top 30
✅ Narrative locked — can tell the story in 60 seconds

Month 2 — OUTREACH PHASE
Week 1–2: Activate warm intro requests (not cold outreach yet)
Week 3–4: First meetings with 10–15 investors
Rule: Meet with less important investors first to refine pitch before your top targets

Month 3 — MOMENTUM
• Create FOMO: "We have X committed, closing in 3 weeks"
• Send weekly investor update to everyone who's in diligence
• Never negotiate solo — get a lawyer for term sheet review

Month 4 — CLOSE
• Sign term sheet with lead investor first
• 2–4 weeks for diligence and legal
• Wire and close — celebrate briefly, then get back to building

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ COMMON MISTAKES TO AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Raising before you have something to show — get to 10 customers first
❌ Giving too much equity at pre-seed — 20%+ dilution at idea stage is a red flag
❌ Only talking to VCs — angels are faster, more helpful, and founder-friendly
❌ Accepting a bad term sheet to close fast — 1 month of patience saves years of regret
❌ Not having a lead investor — rounds without leads look weak to co-investors
❌ Emailing your deck cold — warm intros convert 10× better

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 WHAT TO HAVE READY (Day 1 of Outreach)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 12-slide pitch deck (PDF, no animations)
✅ 2-minute demo video (screen recording, Loom)
✅ Financial model (12-month projection in Google Sheets)
✅ Cap table (current + post-raise pro forma)
✅ One-page executive summary
✅ Reference list (3–5 customers who will take a call)
✅ Data room (Notion or Docsend — track who views it and for how long)

💡 VOXORA RECOMMENDATION
Raise when you have momentum, not when you need money. The best fundraise happens when you don't desperately need it. Get to the milestone that makes investors lean forward, then run a tight 60–90 day process.`;

    case 'termSheet':
      return `📋 TERM SHEET GUIDE — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 VALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRE-MONEY VALUATION: The value of your company before the investment.
POST-MONEY VALUATION: Pre-money + investment amount.

Example:
• $4M pre-money + $1M investment = $5M post-money
• Investor owns: $1M ÷ $5M = 20%

Founder-friendly: Higher pre-money = less dilution
Investor-friendly: Lower pre-money = more ownership for same check
Negotiate: Always negotiate pre-money up. A $1M difference at seed = $10M+ difference at exit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 DILUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dilution occurs every time you issue new shares. At each round:
• Seed: ~20–25% dilution
• Series A: ~20% dilution
• Series B: ~15–20% dilution

After Pre-seed + Seed + Series A, founders often own 40–55%.

✅ Healthy: Founders own 50%+ at Series A
⚠️ Warning: Founders own <30% at Series A (retention/motivation risk)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ LIQUIDATION PREFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━

This determines who gets paid first if the company is sold.

1× NON-PARTICIPATING PREFERRED (Founder-friendly ✅)
• Investor gets their money back OR converts to common stock — whichever is higher
• If acquired for $5M and investor put in $1M: they take $1M back OR 20% of $5M ($1M) — same
• If acquired for $20M: investor takes 20% of $20M ($4M) > their $1M → converts to common

2× PARTICIPATING PREFERRED (Investor-friendly ❌)
• Investor gets 2× their money back PLUS their pro-rata share of remaining proceeds
• This "double dip" significantly reduces founder payout at most exit sizes
• Red flag: Push back hard. 1× non-participating is market standard at seed.

FULL RATCHET / WEIGHTED AVERAGE ANTI-DILUTION (Complex — watch carefully)
• Protects investors if you raise a "down round" (lower valuation than previous round)
• Weighted average is standard and fair; full ratchet is extremely punitive to founders
• Never accept full ratchet anti-dilution.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRO-RATA RIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gives investors the right (not obligation) to invest in future rounds to maintain their ownership %.

Founder-friendly: Limit pro-rata to lead investors only (not every angel in the round)
Why it matters: Too many pro-rata rights make future rounds complicated for new investors

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ BOARD COMPOSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Seed round (typical):
• 3-person board: 2 founders + 1 investor
• OR 5-person board: 2 founders + 1 investor + 2 independent directors

Red flag: Investor wants majority board control at seed (unacceptable)
Founder-friendly: Founders maintain board majority through Series A at minimum

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INFORMATION RIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Standard: Monthly or quarterly investor updates
Market standard: P&L, balance sheet, cash position, key metrics, strategic update

Founders prefer: Informal updates (Notion/email) rather than formal audited financials
Investor preference: Standardised reporting with audited financials (ask for this only at Series B+)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 VESTING SCHEDULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Standard: 4-year vesting with 1-year cliff
• 0% vests in first 12 months (cliff)
• 25% vests at month 12 (the cliff)
• Remaining 75% vests monthly over 36 months

Acceleration:
• Single trigger: Vesting accelerates on acquisition (negotiate for this)
• Double trigger: Vesting accelerates only if acquired AND you're fired (common compromise)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚩 RED FLAGS IN TERM SHEETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Full ratchet anti-dilution (extremely punitive)
❌ 2× or 3× participating preferred (double/triple dip)
❌ Investor board majority at seed
❌ Pay-to-play provisions (forced pro-rata or lose rights)
❌ Broad veto rights on business decisions (hiring, spending, pivots)
❌ Drag-along rights held only by investors (you lose control of exit timing)
❌ No acquisition without investor approval below $X amount

💡 VOXORA RECOMMENDATION
Always use a startup lawyer to review your term sheet (budget $1,500–$5,000 for this). The money spent here can save millions at exit. YC's SAFE note is the cleanest instrument for pre-seed — avoid priced rounds until Series A if possible.`;

    case 'dueDiligence':
      return `✅ DUE DILIGENCE CHECKLIST — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 BUSINESS & STRATEGY [Critical]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documents to Prepare:
✅ One-pager executive summary
✅ 12-slide investor pitch deck (PDF)
✅ Market research supporting your TAM/SAM/SOM
✅ Competitive landscape analysis (who they are, why you win)
✅ 3-year strategic roadmap

Questions Investors Will Ask:
• "Why does this market need to exist now?" — Have a specific tailwind
• "What's your unfair advantage?" — Be specific, not generic
• "What happens if Google/Shopify builds this?" — Show defensibility
• "What's your 5-year vision?" — Paint a credible big picture

Strong Answer: Specific, data-backed, with evidence of market timing
Weak Answer: "The market is huge and growing" (everyone says this)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 TEAM & HIRING [Critical]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documents to Prepare:
✅ Team bios (1 paragraph each, focus on relevant experience)
✅ LinkedIn profiles current and public
✅ Vesting agreements for all founders
✅ Employment contracts / contractor agreements
✅ List of first 5–10 planned hires with role descriptions

Questions Investors Will Ask:
• "Have the founders worked together before?" — Yes is better
• "What's the split and why?" — Must be defensible (50/50 or merit-based split)
• "Who does what?" — Clear role separation
• "What's the biggest team risk?" — Answer honestly, then explain mitigation

Strong Answer: Lived the problem, complementary skills, prior success together
Weak Answer: "We're a rockstar team" with no evidence

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ PRODUCT & TECHNOLOGY [Critical]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documents to Prepare:
✅ Live product demo (or video if pre-launch)
✅ Technical architecture overview (non-technical version for non-technical investors)
✅ Product roadmap (12-month)
✅ IP ownership confirmation (patents, trademarks, or "we own all code")
✅ Security / data privacy policy

Questions Investors Will Ask:
• "Can I see it work?" — Have a polished 3-minute demo ready
• "What's the tech stack?" — Explain in terms of speed, scalability, cost
• "Do you own all your IP?" — Confirm no contractor disputes
• "What's the biggest technical risk?" — Be honest

Strong Answer: Working product, clear technical moat, fast iteration history
Weak Answer: Slides about a product that doesn't exist yet

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 FINANCIAL & LEGAL [Critical]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documents to Prepare:
✅ Financial model (12–24 month projection with assumptions)
✅ Current cap table (fully-diluted)
✅ Bank statements (last 3–6 months)
✅ P&L statement (actual vs projected)
✅ All existing investor agreements (SAFEs, convertible notes)
✅ Corporate structure (Delaware C-Corp preferred by VCs)
✅ Any outstanding legal issues disclosed

Questions Investors Will Ask:
• "How much runway do you have?" — Know this to the day
• "What's your burn rate and what drives it?" — Be specific
• "Are there any legal issues we should know about?" — Disclose proactively
• "Is the company incorporated in Delaware?" — Should be

Strong Answer: Clean cap table, clear financials, Delaware C-Corp, no surprises
Weak Answer: "We'll figure out the legal stuff later"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MARKET & COMPETITION [Important]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documents to Prepare:
✅ Market size research with sources
✅ Competitive matrix (features, pricing, positioning)
✅ Customer interviews / discovery notes
✅ Industry reports (even free ones from Statista, CB Insights)

Questions Investors Will Ask:
• "Who are your competitors and why do you win?" — Know all of them
• "What do customers say when they compare you to X?" — Have real quotes
• "What's the market tailwind?" — Specific regulatory, technology, or behaviour shift

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 CUSTOMER TRACTION [Critical if available]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documents to Prepare:
✅ Customer list (anonymised is fine)
✅ Revenue/MRR chart (even if small — show the trend)
✅ Key metrics dashboard (DAU, MAU, churn, NPS, etc.)
✅ 3–5 customer reference contacts (investors WILL call them)
✅ Case studies or testimonials

Questions Investors Will Ask:
• "What's your Month-1 retention?" — Target > 80%
• "Why do customers churn?" — Know the answer
• "Can we talk to your customers?" — Always say yes

Strong Answer: Even $1K MRR growing 20% MoM tells a better story than zero
Weak Answer: "We have 200 signups" with no engagement data

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PRIORITY RANKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━

MUST HAVE (Don't schedule meetings without these):
• Working demo or prototype
• Clean cap table
• Incorporated company
• Basic financial model
• At least 3 customer conversations documented

NICE TO HAVE (Have these by due diligence stage):
• Revenue (even $1)
• Audited financials
• Full patent portfolio
• Detailed tech architecture docs

💡 VOXORA RECOMMENDATION
Start building your data room on Day 1. Investors move fast when they're interested — the fastest way to lose momentum is "let me get you that document." Have everything ready before your first meeting.`;

    case 'investorNarrative':
      return `📖 INVESTOR NARRATIVE — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE FOUNDING STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every great company starts with a founder who experienced the problem firsthand. Your narrative should answer: "Why are YOU the right person to build this?"

Template narrative for ${subject}:

"Two years ago, I was [doing the thing that led to the insight]. I needed to [specific task], and the existing solutions were either [too expensive / too complex / didn't exist]. I tried [competitor 1], [competitor 2], and [workaround]. None of them worked. So I asked the founders I knew — and they were all having the same problem.

That's when I realised this wasn't my problem. This was the problem of every [target customer] trying to [desired outcome] without a dedicated team or $50,000 budget."

Key elements:
• Specific moment, not a general feeling
• Named the failed alternatives (shows market research)
• Validated it wasn't just your problem (shows market exists)
• Clear target customer and desired outcome

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE INSIGHT OTHERS ARE MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the most powerful part of your narrative. What do you know that the market hasn't figured out yet?

The insight for ${subject}:

"Here's what everyone gets wrong about this space: [conventional wisdom]. But the data shows [counter-intuitive truth]. This means [implication that opens a market opportunity]."

Examples of strong insights:
• "Everyone thinks [audience] won't pay for software. But they're already paying $X for [inferior alternative]."
• "The real bottleneck isn't [obvious thing]. It's [non-obvious thing]."
• "This market looks saturated, but all incumbents are built for [enterprise]. Nobody has built for [SMB/creator/solo]."

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE MARKET TIMING ARGUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Investors are pattern-matching for "why now?" You need a compelling answer.

Timing arguments for ${subject}:

TECHNOLOGY SHIFT: "AI model costs dropped 10× in 18 months. The compute that would have cost $5/query in 2022 now costs $0.05. This makes [product] economically viable for the first time."

BEHAVIOR SHIFT: "Since [event/trend], [target customer] changed how they [behaviour]. They're now [doing new thing] which creates demand for [product]."

REGULATORY SHIFT: "Upcoming [regulation] requires companies to [comply]. Nobody has built the tool that makes compliance easy for SMBs."

MARKET MATURITY: "The enterprise market is now solved by [company]. But they priced out [SMB segment]. There's a $2.5B opportunity in the segment they abandoned."

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 5-YEAR VISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Investors are betting on a future state. Paint it clearly.

Vision arc for ${subject}:

"In Year 1, we become the default tool for [specific niche]. In Year 3, we expand to [adjacent market] with [new capability]. In Year 5, we are the [operating system / platform / intelligence layer] for [market]. At that point, the company is worth [plausible multiple of current implied valuation]."

The key: Your 5-year vision must be big enough to justify venture returns, but specific enough to be credible.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEAM UNFAIR ADVANTAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

"We are the right team because:
1. [Founder 1] spent [X] years inside this problem — they've lived what our customers experience daily
2. [Founder 2] has [specific technical/distribution/domain advantage] that took [X] years to build and can't be replicated in 6 months
3. Together, we already have [specific early advantage — 1,000 customers, key partnerships, proprietary data, regulatory relationships]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE BELIEF STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Close your narrative with what investors need to believe to say yes:

"For this investment to make sense, you need to believe three things:
1. [Market belief]: The [TAM] market will grow to $[X] by [year] — we think it will, here's why.
2. [Execution belief]: We are the right team to capture [specific share] of this market — here's our unfair advantage.
3. [Timing belief]: The next [18 months] is the critical window to build this — here's why waiting means losing."

If an investor says no, ask which belief they don't share. That tells you what to work on.

💡 VOXORA RECOMMENDATION
Practise your narrative out loud until you can tell it in 3 minutes and 15 minutes. Investors will interrupt — you need to be able to re-enter the narrative from any point. Record yourself and watch it back. The founders who raise are the ones who can tell this story without reading it.`;

    case 'capTable':
      return `📊 CAP TABLE PLANNER — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ FOUNDER EQUITY SPLIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

The best founder splits are decided early and based on contribution, not future hopes.

Framework for splitting equity:
• Technical contribution (who built the product): 20–40%
• Business contribution (who drives revenue/distribution): 20–40%
• Idea generation (who had the insight): 10–20%
• Risk taken (who quit their job first, who invested cash): 10–20%

Common patterns:
• 2 founders, equal contribution: 50/50 — simplest, prevents long-term conflict
• 2 founders, technical lead: 60/40 — tech-heavy products
• 3 founders: 40/30/30 — one clear CEO, two contributors
• Solo founder: Start at 100%, create ESOP before fundraising

Red flags investors watch for:
❌ 3-way 33/33/33 split — suggests no clear leader
❌ A founder with < 10% — they'll leave before exit, creates cap table mess
❌ No vesting — if a founder leaves on Day 30, they shouldn't own 30%

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁 EMPLOYEE OPTION POOL (ESOP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESOP is the equity reserved for future employees and advisors.

Standard pool sizes by stage:
• Pre-seed: 10–15% (enough to hire first 3–5 key people)
• Seed: 15–20% (expanded to attract senior hires)
• Series A: 20% (institutional norm, refreshed at each round)

Timing: Create the ESOP BEFORE your seed round. Investors will require one anyway, and creating it before means investors are diluted too — not just founders.

Vesting for employees (standard):
• 4-year vesting, 1-year cliff
• Accelerate 12 months on acquisition (single trigger) if possible

Advisory shares: 0.1–0.5% with 2-year monthly vesting — don't give more than 0.5% to any advisor without a clear deliverable

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 DILUTION SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting point: 2 founders, 50/50 split, 10% ESOP created pre-seed

┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Stage           │ Founder1 │ Founder2 │ ESOP     │ Investors│
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Day 1           │ 45%      │ 45%      │ 10%      │ 0%       │
│ After Pre-Seed  │ 36%      │ 36%      │ 8%       │ 20%      │
│ After Seed      │ 28%      │ 28%      │ 6%       │ 38%      │
│ After Series A  │ 22%      │ 22%      │ 18%      │ 38%      │
│ After Series B  │ 18%      │ 18%      │ 14%      │ 50%      │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘

Note: ESOP grows because each round typically includes an ESOP refresh/top-up.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ LIQUIDATION PREFERENCE IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

How exit proceeds are distributed matters as much as ownership %.

Example: $10M exit, post-seed (investors own 20%, 1× non-participating preferred)

Scenario A — Investors convert to common (if exit > 5× their investment):
• Investors invested $1M → 1× = $1M, but 20% of $10M = $2M → they convert
• Investors: $2M | Founders: $8M (split by common share ownership)

Scenario B — Investors take preference (if exit < 5× their investment):
• Investors invested $1M → take $1M back first
• Remaining $9M split by common: Founders keep ~$7.2M, investors get rest

With participating preferred (investor-unfriendly):
• Investors take $1M PLUS 20% of remaining $9M = $2.8M total
• Founders receive less than 80% despite owning 80%

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 FOUNDER PAYOUT SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assuming: 2 founders at 22% each after Series A, $15M raised total (1× non-participating)

$10M ACQUISITION:
• Investors (38%) take up to $15M preference → not covered → take $10M
• Founders receive: ~$0 (liquidation preference wipes out common)
• Lesson: At $10M, founders get nothing with $15M raised. Size your round carefully.

$50M ACQUISITION:
• Investors take $15M preference (or convert to 38% = $19M) → convert
• Investors: $19M | Founders (44% combined): $22M
• Each founder takes home: ~$11M

$100M ACQUISITION:
• Investors convert: 38% = $38M
• Founders (44%): $44M | Each founder: ~$22M

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚩 CAP TABLE RED FLAGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Too many small investors — 50 investors at $10K each creates management hell
❌ Friends & family at strange valuations (creates pricing issues for institutional rounds)
❌ No vesting on founder shares (if a founder leaves, they take equity with them)
❌ Missing authorised share count — run out of shares and you can't close a round
❌ Outstanding convertible notes with aggressive terms (high interest rate, short maturity)

💡 VOXORA RECOMMENDATION
Use SAFE notes (Y Combinator standard) for your first 3–5 investors. They're simple, cheap to execute ($0 legal), and delay valuation negotiation to your priced round. A cap table of < 15 investors is much easier to manage than 50. Quality investors over quantity always.`;

    case 'financialForecast':
      return `💰 FINANCIAL FORECAST — ${subject}

📊 REVENUE MODEL ASSUMPTIONS
• Pricing: $29/mo (Starter), $79/mo (Pro), $199/mo (Team)
• Average Revenue Per User (ARPU): $45/mo blended
• Monthly churn rate target: 3–5% (industry benchmark: 5–8%)
• Conversion rate: free trial → paid: 8–12%
• Growth rate assumption: 15–25% MoM in months 1–6, 10–15% in months 7–12

📈 12-MONTH REVENUE PROJECTION MILESTONES

Month 1–2: FOUNDATION
• Target: 10–25 paying customers
• MRR target: $450–$1,125
• Focus: First 10 customers at any price, collect testimonials

Month 3–4: EARLY TRACTION
• Target: 50–100 customers
• MRR target: $2,250–$4,500
• Focus: Referral program, first paid channel test

Month 5–6: GROWTH
• Target: 150–250 customers
• MRR target: $6,750–$11,250
• Focus: Content marketing flywheel, first $10K MRR milestone

Month 7–9: SCALING
• Target: 400–600 customers
• MRR target: $18,000–$27,000
• Focus: Team hire, expand acquisition channels

Month 10–12: OPTIMISATION
• Target: 700–1,000 customers
• MRR target: $31,500–$45,000
• Focus: Retention improvements, annual plan push, upsell

⚡ UNIT ECONOMICS TARGETS
• CAC (Customer Acquisition Cost): < $150 (organic), < $300 (paid)
• LTV (Lifetime Value): $900–$1,800 (20–40 month retention at $45 ARPU)
• LTV:CAC Ratio: Target > 3:1 (healthy SaaS benchmark)
• Payback Period: 3–7 months

🔑 KEY COST DRIVERS
• AI API costs: $0.50–$2.00/customer/month (variable, optimize aggressively)
• Infrastructure (hosting, CDN): $50–$500/month (scales slowly)
• Team: $0 (founder-only) → $12,000/month (first hire at Month 8)
• Marketing: $0–$500/month (content-led), $500–$2,000/month (paid)
• Tools & software: $200–$500/month

💡 BREAK-EVEN ESTIMATE
• Total monthly fixed costs (months 1–6): ~$1,000–$2,000/month
• Break-even MRR: $2,000–$3,000
• Break-even customer count: ~50–70 customers
• Estimated time to break-even: Month 4–6 (with consistent growth)

⚠️ FINANCIAL RISKS
1. AI API cost spike — set hard limits per user, monitor daily
2. High churn before product-market fit — focus on onboarding quality
3. Premature scaling — don't hire before $10K MRR
4. Pricing too low — raise prices after first 25 customers

💡 VOXORA RECOMMENDATION
Hit $10K MRR before optimising margins. Revenue solves most early-stage problems. Focus on customer acquisition and retention, not unit economics perfection.`;

    case 'revenueModel':
      return `💵 REVENUE MODEL — ${subject}

💡 PRIMARY REVENUE STREAMS

STREAM 1: Subscription SaaS (Primary — 80% of revenue)
• Model: Monthly/Annual subscription with tiered access
• Pricing tiers:
  - Free: 3 uses/month, no export — growth engine, not revenue
  - Starter ($19/mo): 50 uses/month, PDF export, email support
  - Pro ($49/mo): Unlimited uses, all features, priority support ← CORE TIER
  - Team ($129/mo): 5 seats, collaboration, admin dashboard
  - Enterprise (custom, $500+/mo): SSO, SLA, custom integrations

• Annual plan discount: 20% (converts 30–40% of monthly subscribers)
• Pricing rationale: Pro at $49 is below the "I'll think about it" threshold for the target customer, above "too cheap to trust"

STREAM 2: Usage-Based Add-Ons (Secondary — 15% of revenue)
• AI Credits top-up: $9 for 100 extra uses (high-margin)
• Premium report exports: $4.99/report for non-subscribers
• White-label exports: $19/month add-on

STREAM 3: Marketplace / Affiliate (Future — 5% of revenue)
• Refer customers to partner tools (Notion, Linear, Stripe) — 20% revenue share
• Template marketplace: community-created templates at $9–29 each, 70/30 split

💰 EXPANSION REVENUE OPPORTUNITIES

Upsell triggers (when to prompt upgrade):
• User hits 80% of monthly limit → prompt Starter → Pro upgrade
• User adds second team member → prompt Team plan
• User requests API access → prompt Enterprise conversation

Cross-sell opportunities:
• Pro user buying AI Credits → bundle into Team plan pitch
• Content Calendar user → pitch Email Campaign + Social Media bundle
• SWOT user → pitch full Strategy Bundle (SWOT + Market + Competitor)

📈 12-MONTH REVENUE WATERFALL
Month 3: First $1K MRR (proof of concept)
Month 6: $5K MRR (product-market fit signal)
Month 9: $15K MRR (scalable acquisition working)
Month 12: $30K+ MRR (path to $1M ARR visible)

⚠️ REVENUE RISKS
• Free tier cannibalises paid if limits are too generous → review quarterly
• Annual plans create cash flow spikes — plan around renewal cohorts
• Enterprise deals take 3–6 months to close — don't count until signed

💡 VOXORA RECOMMENDATION
Anchor on the Pro tier at $49/month. Test raising to $59 after Month 6 — most SaaS tools are underpriced early. The goal is 200 Pro users ($9,800 MRR) within 12 months.`;

    case 'pricingStrategy':
      return `🏷️ PRICING STRATEGY — ${subject}

✅ RECOMMENDED PRICING MODEL: Tiered Flat-Rate + Usage Top-Ups

Why: Tiered pricing gives predictable revenue, usage top-ups capture high-value users without friction. Best for AI SaaS tools with variable usage patterns.

💰 SUGGESTED PRICE POINTS

FREE TIER (Lead Generation)
• Price: $0/month
• Limits: 3 AI generations/month, no export, no history
• Goal: Acquisition, not revenue. Convert 8–12% to paid.

STARTER ($19/month or $152/year — save 33%)
• 50 AI generations/month
• PDF + Notion export
• 30-day history
• Email support (48h response)
• Positioning: "Try it seriously without full commitment"

PRO ($49/month or $390/year — save 33%)
• Unlimited AI generations
• All workspace tools unlocked
• Export to PDF, Markdown, Notion, Google Docs
• Full conversation history + AI Memory
• Priority support (24h response)
• Positioning: "The serious founder tier" ← PRIMARY REVENUE TARGET

TEAM ($129/month or $1,032/year — save 33%)
• Everything in Pro × 5 seats
• Team workspace + shared projects
• Admin dashboard + usage analytics
• Slack integration
• Onboarding call
• Positioning: "For founding teams and small agencies"

ENTERPRISE (Custom, $500–$2,000+/month)
• Everything in Team, custom seat count
• SSO (Okta, Google Workspace)
• SLA (99.9% uptime guarantee)
• Custom AI model integration
• Dedicated account manager
• Positioning: "For companies that need control"

🎯 COMPETITOR PRICE BENCHMARKING
• Notion AI: $10/month add-on (narrow feature set)
• Jasper: $49–$125/month (content-focused, broader)
• Copy.ai: $49–$186/month (similar positioning)
• Consultant alternative: $5,000–$50,000/project
• Your positioning: Better than Notion AI, more focused than Jasper, 100× cheaper than consultants

📊 VALUE METRIC ANALYSIS
Charge on: AI generations (most predictable, easiest to explain)
Alternative: Seat-based (simpler), Project-based (ties value directly to output)
Recommendation: Generation-based for Starter, unlimited for Pro+ (removes anxiety)

🎁 FREE TRIAL / FREEMIUM STRATEGY
• Offer 14-day Pro trial, no credit card required
• Show the "you would have used X generations" counter during trial
• Day 3: "You've already saved 2 hours this week" email
• Day 10: Upgrade prompt with one-click (card already saved from previous trial if returning user)
• Trial conversion target: 12–20%

📅 ANNUAL DISCOUNT RECOMMENDATION
• Offer 33% discount for annual (equivalent to 4 months free)
• Push annual at signup, at 30-day anniversary, and at Month 6
• Annual goal: 35% of subscribers on annual plans by Month 12
• Cash flow benefit: $390 upfront vs $49×12 = $588 (better retention, worse cash timing)

🧪 3 PRICING EXPERIMENTS (Days 1–90)
1. Test $39 vs $49 vs $59 Pro (A/B test checkout page) — find elasticity
2. Test "Most Popular" badge on Pro vs Team — which converts higher?
3. Test lifetime deal via AppSumo ($197 one-time) — captures early adopters, validates demand

💡 VOXORA RECOMMENDATION
Launch at $49 Pro. Raise to $59 after 100 paying customers. Add annual plans from Day 1 — they reduce churn by 70% vs monthly.`;

    case 'unitEconomics':
      return `📊 UNIT ECONOMICS — ${subject}

🎯 CUSTOMER ACQUISITION COST (CAC)

CAC Breakdown by Channel:
┌─────────────────────┬──────────┬──────────────┬────────────┐
│ Channel             │ Conv Rate│ Cost/Lead    │ CAC        │
├─────────────────────┼──────────┼──────────────┼────────────┤
│ Organic/SEO         │ 3–6%     │ $5–20 (time) │ $50–200    │
│ Content Marketing   │ 2–4%     │ $10–30 (time)│ $75–300    │
│ LinkedIn Ads        │ 1–2%     │ $30–80       │ $300–800   │
│ Google Search Ads   │ 3–5%     │ $15–40       │ $200–600   │
│ Referral Program    │ 15–25%   │ $20–40       │ $40–150    │
│ Community/Word-of-Mouth│ 20–30%│ ~$0          │ $10–50     │
└─────────────────────┴──────────┴──────────────┴────────────┘

Blended CAC Target: < $150 (months 1–6), < $250 (months 7–12)

💰 LIFETIME VALUE (LTV)

LTV Calculation:
• Average MRR (ARPU): $45/month (blended free/paid conversion)
• Average customer lifespan: 18–24 months (3–5% monthly churn)
• Gross margin: 70–80% (after AI API costs)
• LTV = ARPU × Gross Margin × Average Lifespan
• LTV = $45 × 0.75 × 20 = $675 (conservative)
• LTV = $45 × 0.75 × 30 = $1,013 (base)
• LTV = $45 × 0.80 × 40 = $1,440 (optimistic)

⚡ LTV:CAC RATIO

┌────────────────┬──────────┬──────────┬────────────┐
│ Scenario       │ LTV      │ CAC      │ LTV:CAC    │
├────────────────┼──────────┼──────────┼────────────┤
│ Pessimistic    │ $675     │ $300     │ 2.25:1 ⚠️  │
│ Base Case      │ $1,013   │ $150     │ 6.75:1 ✅  │
│ Optimistic     │ $1,440   │ $80      │ 18:1 🚀    │
└────────────────┴──────────┴──────────┴────────────┘

Target: > 3:1 (sustainable), > 5:1 (healthy growth), > 10:1 (exceptional)

📅 PAYBACK PERIOD

Payback = CAC ÷ (ARPU × Gross Margin)
• $150 CAC ÷ ($45 × 0.75) = 4.4 months ✅
• $300 CAC ÷ ($45 × 0.75) = 8.9 months ⚠️
• Target payback: < 12 months (investors love < 6 months)

📉 CHURN IMPACT ANALYSIS

Monthly Churn vs LTV:
• 2% churn → 50-month retention → LTV = $1,688 🚀
• 3% churn → 33-month retention → LTV = $1,013 ✅
• 5% churn → 20-month retention → LTV = $675 ⚠️
• 8% churn → 12-month retention → LTV = $405 ❌

Every 1% reduction in churn = +$300+ in LTV per customer.

💡 5 ACTIONS TO IMPROVE UNIT ECONOMICS

1. REDUCE CAC: Build SEO moat — content marketing CAC of $50–100 vs $300+ for paid ads. Publish 4 articles/month targeting high-intent keywords.

2. INCREASE LTV: Add annual plan option. Annual subscribers churn 70% less than monthly. Moving 30% to annual adds 6+ months to average lifespan.

3. EXPAND ARPU: Build upsell flow. Pro users who hit usage limits and upgrade add $30–80/month. Target: 15% of Pro users upgrade to Team within 6 months.

4. LOWER CHURN: Improve onboarding. Users who complete 3+ tasks in Week 1 churn 60% less. Build a "Quick Win" sequence (Day 1: first generation, Day 3: save project, Day 7: second use case).

5. REDUCE AI API COSTS: Implement caching for identical or near-identical prompts. Potential to reduce AI costs by 30–40%, improving gross margin from 70% to 78%.

💡 VOXORA RECOMMENDATION
Fix churn before scaling acquisition. A leaky bucket problem makes every marketing dollar less efficient. Get Month-1 retention above 85% before investing in paid acquisition.`;

    case 'breakEven':
      return `📈 BREAK-EVEN ANALYSIS — ${subject}

💸 FIXED COSTS BREAKDOWN

Monthly Fixed Costs (Founder-Only Stage):
┌─────────────────────────┬──────────────┐
│ Cost Category           │ Monthly Cost │
├─────────────────────────┼──────────────┤
│ Hosting (Vercel/AWS)    │ $20–$100     │
│ Domain + Email          │ $10–$20      │
│ AI API (base tier)      │ $50–$200     │
│ Analytics & monitoring  │ $30–$100     │
│ Design tools (Figma)    │ $15          │
│ Email marketing (ConvertKit/etc)│ $29–$99 │
│ Other SaaS tools        │ $50–$100     │
│ TOTAL FIXED             │ $204–$634/mo │
└─────────────────────────┴──────────────┘

Conservative estimate: $400/month fixed costs
With first hire (Month 8+): $12,000–$15,000/month

📊 VARIABLE COSTS PER CUSTOMER

Cost per paying customer/month:
• AI API usage: $0.50–$2.00 (depends on feature usage)
• Support time: $2–$5 (amortised, scales with volume)
• Payment processing (Stripe): 2.9% + $0.30 per transaction
• Total variable cost: ~$4–$8/customer/month

At $45 ARPU: Contribution margin per customer = $45 – $6 = $39 (87%)

📐 CONTRIBUTION MARGIN

Revenue per customer: $45 ARPU
Variable cost per customer: $6
Contribution Margin: $39/customer/month (87% CM ratio)

💡 BREAK-EVEN CALCULATION

Formula: Break-Even Units = Fixed Costs ÷ Contribution Margin per Unit

Break-even customers = $400 ÷ $39 = ~11 paying customers ← Immediately achievable!
Break-even MRR = 11 × $45 = $495/month

With first hire ($12,000 fixed costs):
Break-even customers = $12,000 ÷ $39 = 308 customers
Break-even MRR = $13,860

📅 TIME TO BREAK-EVEN SCENARIOS

PESSIMISTIC (5% MoM growth):
Month 1: 5 customers → $225 MRR
Month 6: 30 customers → $1,350 MRR
Break-even: Month 8–10

BASE CASE (15% MoM growth):
Month 1: 5 customers → $225 MRR
Month 4: 25 customers → $1,125 MRR ← Break-even milestone!
Month 6: 50 customers → $2,250 MRR
Break-even: Month 3–4

OPTIMISTIC (25% MoM growth):
Month 1: 10 customers → $450 MRR ← Already break-even!
Month 3: 40 customers → $1,800 MRR
Month 6: 122 customers → $5,490 MRR
Break-even: Month 1–2

🏁 MILESTONE TRIGGERS

Milestone 1 — Break-Even (11 customers / $495 MRR)
→ Action: Increase content output, launch referral program

Milestone 2 — Ramen Profitable (50 customers / $2,250 MRR)
→ Action: First paid marketing test ($500 budget)

Milestone 3 — Default Alive (150 customers / $6,750 MRR)
→ Action: Plan first hire, expand to new acquisition channels

Milestone 4 — Hire-Ready (308 customers / $13,860 MRR)
→ Action: Make first hire (engineer or marketer)

💡 VOXORA RECOMMENDATION
Your break-even point is just 11 customers — an achievable goal in Week 1 if you pre-sell. Focus on getting to 50 customers (ramen profitability) before spending on paid acquisition. Every customer below 50 is existential; every customer above 150 is strategic.`;

    case 'pitchDeck':
      return `🎯 INVESTOR PITCH DECK OUTLINE — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 1: COVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company name + tagline + logo
"${subject} — [one-line value proposition]"
Presenter name, title, date
Contact: [email] | [website]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 2: PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "[Target customer] spends [X hours/dollars] on [painful task] every [week/month]"
• Pain Point 1: Specific, quantified, relatable to investors
• Pain Point 2: Shows urgency — why this matters NOW
• Pain Point 3: Reveals the gap current solutions leave
Visual: Customer quote or photo showing the problem in real life
Key stat: Market pain signal (search volume, consultant fees, workaround adoption)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 3: SOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "${subject} [does specific thing] in [timeframe]"
• Simple 1-2 sentence product description
• 3 core benefits (not features) — tie directly to pain points
• Screenshot or demo GIF of the product in action
• "Before vs After" framing if possible
Investor takeaway: "This is the obvious solution to the problem on slide 2"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 4: MARKET SIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAM (Total Addressable Market): $X billion — full market if everyone adopted
SAM (Serviceable Addressable Market): $X billion — realistic target with current product
SOM (Serviceable Obtainable Market): $X million — what you can win in 3 years
Source your numbers — investors fact-check these immediately
Insight: Why this market is growing now (tailwind driving demand)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 5: PRODUCT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product walkthrough — 3 key screens that show the magic moment
Feature 1: [Name] — solves [specific pain point] — proof: [metric or customer quote]
Feature 2: [Name] — differentiates from [specific competitor]
Feature 3: [Name] — creates retention / switching cost
Technical moat (if any): proprietary data, model fine-tuning, patent pending

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 6: BUSINESS MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Revenue streams: Subscription SaaS (primary), usage add-ons (secondary)
Pricing: Free / $19 / $49 / $129 / Enterprise
Key metric: ARPU $45/month, targeting $49 Pro as primary tier
Unit economics: CAC < $150, LTV > $900, LTV:CAC > 6:1, Payback < 6 months
Gross margin: 70–80%

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 7: TRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Show your best metrics — be honest, spin is obvious to investors]
• MRR: $X (or "pre-revenue — here's why that's okay")
• Customers: X paying / X free users / X waitlist
• Growth rate: X% MoM
• Retention: X% Month-1 retention
• NPS or qualitative: "[quote from best customer]"
• Key milestones hit: Product Hunt launch, first enterprise customer, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 8: COMPETITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Positioning matrix: 2x2 grid (e.g. "Ease of Use" vs "AI-Native")
• Show 3–4 competitors + your position
• Never say "we have no competitors" — it signals poor market research
• Differentiation: What you do that no one else does, and why it's hard to copy
• The real competition: "Status quo / doing nothing" is often the biggest competitor

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 9: TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Most important slide for early-stage — investors bet on people]
Founder 1: Name, photo, 3-bullet credibility (domain expertise + execution proof)
Founder 2: Name, photo, 3-bullet credibility (complementary skills)
Key Hires / Advisors: 1–2 relevant names with credibility signals
Why us: "We are the right team because [unfair advantage — lived the problem, built similar thing, domain expertise]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 10: FINANCIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
3-year projection (conservative/base/aggressive):
• Year 1: $X ARR (X customers)
• Year 2: $X ARR (X customers, first hire)
• Year 3: $X ARR (X customers, team of X)
Key assumptions: Clearly state growth rate, churn rate, ARPU
Current burn: $X/month | Runway: X months

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 11: USE OF FUNDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raising: $X [Seed/Pre-seed/Series A]
Runway: X months
Allocation:
• 50% — Engineering (X hire)
• 30% — Marketing & Growth (content, paid, community)
• 15% — Operations (tools, legal, accounting)
• 5%  — Reserve
Milestones this funding unlocks: "$10K MRR, 500 customers, [feature] shipped"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 12: VISION & ASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vision: "[Where does this go in 5 years?]" — paint the big picture
The ask: "We are raising $[X] at $[Y] valuation. We have [X] committed."
Why now: The specific tailwinds making this the right moment
Next step: "We'd love to schedule a follow-up call. Here are 3 things we'll show you."

💡 VOXORA RECOMMENDATION
Lead with traction on Slide 7 if you have it — rearrange the deck. Investors make up their mind by Slide 4. Get to the point fast. Your job is one meeting, not the close.`;

    case 'executiveSummary':
      return `📄 EXECUTIVE SUMMARY — ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANY OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${subject} is an AI-powered SaaS platform that helps founders and early-stage operators make faster, better business decisions. We replace expensive consultants and manual research with instant, structured AI insights — delivered in minutes, not weeks.

Founded: [Date] | Stage: [Pre-seed/Seed] | Location: [Remote/City]
Website: [URL] | Contact: [Email]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Founders and SMB operators spend 8–15 hours per week on research, strategy, and planning tasks that generate zero revenue. The alternatives are either too expensive ($5,000–$50,000 for consultants) or too generic (templates that don't account for their specific context). This results in slower decisions, wasted resources, and preventable mistakes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE SOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${subject} provides a suite of 20+ AI-powered workspaces that generate professional-grade strategic output — SWOT analyses, market research, competitor intelligence, financial forecasts, pitch decks, and more — in under 2 minutes. Founders describe their idea once; ${subject} delivers the same quality analysis a consultant would charge $5,000 to produce.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET MARKET
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary: Solo founders and early-stage startup teams (1–10 employees)
Secondary: SMB owners (10–50 employees) without dedicated strategy functions
TAM: $12B+ (AI tools for business intelligence)
SAM: $2.5B (SMB-focused AI strategy tools)
SOM: $25M (achievable 3-year target with current GTM)
Market tailwind: AI adoption accelerating 40%+ YoY among SMBs

━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUSINESS MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subscription SaaS with freemium entry point:
• Free: 3 uses/month (growth engine)
• Starter: $19/month
• Pro: $49/month (primary revenue tier)
• Team: $129/month (5 seats)
• Enterprise: Custom

Gross margin: 72–80% | ARPU: $45/month blended
LTV: $900–$1,440 | CAC target: < $150 | Payback: < 6 months

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRACTION HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Update with actual metrics — placeholder framework:]
• MRR: $X growing X% month-over-month
• Customers: X paying, X free trial users
• Month-1 retention: X%
• NPS: X
• Key milestone: [First enterprise customer / Product Hunt #1 / $10K MRR]
• Customer quote: "This replaced our $3,000/month strategy consultant."

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Founder 1 Name] — CEO | [Background: domain expertise + execution proof]
[Founder 2 Name] — CTO | [Background: technical + product]
Advisors: [Name, credibility signal], [Name, credibility signal]
Why us: [Specific unfair advantage — lived the problem, domain expertise, prior exit]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
FUNDING ASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raising: $[X] [Pre-seed/Seed] Round
Current committed: $[X]
Use of funds:
• 50% Engineering — [specific hires]
• 30% Growth — content marketing, paid acquisition
• 20% Operations — legal, tools, reserve

Milestones this round unlocks:
• $10K MRR (Month 6)
• 500 paying customers (Month 9)
• Series A metrics ready (Month 18)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Founder Name] — [email] — [LinkedIn]
One-pager: [URL] | Deck: [URL] | Demo: [URL]

💡 VOXORA RECOMMENDATION
Keep executive summaries to one page when printed. The goal is one meeting, not a full sale. Lead with your best traction metric in the first sentence.`;

    case 'marketingStrategy':
      return `📣 MARKETING STRATEGY — ${subject}

🎯 TARGET AUDIENCE
Primary: Solo founders and early-stage startup operators (1–10 person teams) who need strategic output fast, without hiring consultants or large teams.
Secondary: SMB owners who've outgrown basic tools and need AI-powered insights.
Psychographic: Action-biased, resource-constrained, sceptical of hype, time-obsessed.

📢 PRIMARY CHANNELS (Ranked by ROI)

1. CONTENT MARKETING + SEO (Long-term)
   Goal: Organic traffic for high-intent "${subject}" queries
   Tactics: Pillar page, 5 cluster articles, keyword-targeted landing pages
   Timeline: 60–90 days to first page rankings
   Budget: 0 (time investment only)

2. SOCIAL MEDIA — LinkedIn + X (Medium-term)
   Goal: Brand authority + warm audience for launches
   Tactics: Daily posts, weekly threads, founder story content
   Timeline: 2–4 weeks to noticeable engagement
   Budget: 0 (organic-first strategy)

3. PRODUCT-LED GROWTH (Immediate)
   Goal: Virality through product usage
   Tactics: "Made with Voxora" watermark on exports, referral program, public project sharing
   Timeline: Implement week 1
   Budget: Engineering time only

4. COMMUNITY (Medium-term)
   Goal: Word-of-mouth from trusted sources
   Tactics: Indie Hackers, YC community, LinkedIn groups, Reddit r/startups
   Timeline: 2–3 weeks to initial traction
   Budget: 0 (authentic participation only)

5. PAID ACQUISITION (When proven)
   Goal: Scale what's already working organically
   Channels: Google Search (bottom-of-funnel), LinkedIn (B2B targeting)
   Timeline: Month 3+ (after PMF signals)
   Budget: $500–1,500/month test budget

📐 MESSAGING FRAMEWORK

Hook: "Professional ${subject} insights in 2 minutes — without the $5,000 consultant."
Proof: "10,000+ founders trust Voxora to make faster, smarter decisions."
CTA: "Try free — no credit card required."

🔄 ACQUISITION FUNNEL

Awareness: SEO content + social posts → land on pillar page
Interest: Lead magnet (checklist/template) → email capture
Consideration: Case study email sequence → free trial
Decision: Onboarding sequence + quick win → paid conversion
Retention: Weekly insights newsletter + new feature announcements

📅 30-DAY ACTION PLAN

Week 1: Publish pillar page + 2 cluster articles. Set up email sequence. Post daily on LinkedIn + X.
Week 2: Launch lead magnet. Submit to 5 directories (Product Hunt, Capterra, G2). Guest post pitch to 3 publications.
Week 3: Start referral program. Email case study to current users. Double down on best-performing social content.
Week 4: Analyse what worked. Double budget/time on top-performing channel. Begin paid acquisition test.

💡 VOXORA RECOMMENDATION
Commit to ONE primary channel for 30 days before adding another. Founders who try to do everything simultaneously do nothing well. SEO + LinkedIn is the highest-ROI combination for B2B SaaS at early stage.`;

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
