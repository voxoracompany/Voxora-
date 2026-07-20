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
