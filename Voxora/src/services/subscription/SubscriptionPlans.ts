// ── V5.4 Subscription Plans ───────────────────────────────────────────────────
import type { Plan, BillingInterval } from "./SubscriptionTypes";

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Everything you need to get started.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "All 80+ AI Tools",
      "50 AI requests / month",
      "5 Projects",
      "Local storage",
      "Smart Search",
      "Export (MD, TXT)",
      "Activity Center",
      "Help Center",
    ],
    limits: {
      aiRequests: 50,
      projects: 5,
      teamMembers: 1,
      storageGB: 0.1,
      exports: 10,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power users and serious builders.",
    monthlyPrice: 1200,  // $12/mo
    yearlyPrice: 900,    // $9/mo billed yearly
    highlighted: true,
    features: [
      "Everything in Free",
      "1,000 AI requests / month",
      "Unlimited Projects",
      "Cloud Sync (Firebase)",
      "PDF Export",
      "Priority Support",
      "Advanced Analytics",
      "Custom Integrations",
    ],
    limits: {
      aiRequests: 1000,
      projects: -1,
      teamMembers: 1,
      storageGB: 5,
      exports: -1,
    },
  },
  {
    id: "team",
    name: "Team",
    description: "Collaborate with your entire team.",
    monthlyPrice: 4900,  // $49/mo
    yearlyPrice: 3900,   // $39/mo billed yearly
    features: [
      "Everything in Pro",
      "5,000 AI requests / month",
      "Up to 10 Team Members",
      "Team Collaboration Suite",
      "Shared Projects",
      "Role & Permission Management",
      "Team Analytics",
      "Priority Support",
    ],
    limits: {
      aiRequests: 5000,
      projects: -1,
      teamMembers: 10,
      storageGB: 25,
      exports: -1,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large teams and organizations.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    enterprise: true,
    features: [
      "Everything in Team",
      "Unlimited AI requests",
      "Unlimited Team Members",
      "Unlimited Storage",
      "Custom AI Models",
      "SSO / SAML",
      "Dedicated Support",
      "SLA Guarantee",
      "Custom Integrations",
      "Volume Discounts",
    ],
    limits: {
      aiRequests: -1,
      projects: -1,
      teamMembers: -1,
      storageGB: -1,
      exports: -1,
    },
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find(p => p.id === id) ?? PLANS[0];
}

export function formatPlanPrice(cents: number, interval: BillingInterval = "monthly"): string {
  if (cents === 0) return "Free";
  const dollars = (cents / 100).toFixed(0);
  return interval === "yearly" ? `$${dollars}/mo` : `$${dollars}/mo`;
}

export function getYearlySavings(plan: Plan): number {
  if (plan.monthlyPrice === 0 || plan.yearlyPrice === 0) return 0;
  return (plan.monthlyPrice - plan.yearlyPrice) * 12;
}
