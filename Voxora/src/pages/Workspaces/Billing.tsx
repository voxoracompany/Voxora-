// ── V5.4 Billing Workspace ────────────────────────────────────────────────────
import { useState } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { useToast } from "../../context/ToastContext";
import { getPlan, formatPlanPrice, getYearlySavings } from "../../services/subscription/SubscriptionPlans";
import type { PlanId, BillingInterval } from "../../services/subscription/SubscriptionTypes";
import { SubscriptionEngine } from "../../services/subscription/SubscriptionEngine";
import "./Workspace.css";
import "./Billing.css";

function UsageBar({ label, used, limit, unit = "" }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#6C63FF";
  return (
    <div className="billing-usage-row">
      <div className="billing-usage-label">
        <span>{label}</span>
        <span className="billing-usage-value">
          {limit === -1 ? `${used}${unit} / Unlimited` : `${used}${unit} / ${limit}${unit}`}
        </span>
      </div>
      <div className="billing-usage-track">
        <div className="billing-usage-fill" style={{ width: `${limit === -1 ? 0 : pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Billing({ setWorkspace }: { setWorkspace: (ws: string) => void }) {
  const {
    subscription, currentPlan, usage, billingHistory, allPlans,
    isActive, isTrial, trialDaysRemaining, daysUntilRenewal,
    isDemoBillingMode, upgradePlan, startTrial, cancelAtPeriodEnd, downgradePlan,
  } = useSubscription();
  const { showToast } = useToast();

  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "usage" | "history">("overview");
  const [confirmDowngrade, setConfirmDowngrade] = useState(false);

  const handleUpgrade = async (planId: PlanId) => {
    const plan = getPlan(planId);
    if (plan.enterprise) {
      window.open("mailto:sales@voxora.ai?subject=Enterprise%20Inquiry", "_blank");
      return;
    }
    if (planId === subscription.planId) {
      showToast("You are already on this plan.", "info");
      return;
    }
    setUpgrading(planId);
    const result = await upgradePlan(planId, billingInterval);
    setUpgrading(null);
    if (result.ok) {
      showToast(`✅ Upgraded to ${plan.name}${isDemoBillingMode ? " (Demo Mode)" : ""}!`, "success");
    } else {
      showToast(result.error ?? "Upgrade failed.", "error");
    }
  };

  const handleTrial = (planId: PlanId) => {
    startTrial(planId);
    showToast(`🎉 14-day trial started for ${getPlan(planId).name}!`, "success");
  };

  const handleDowngrade = () => {
    if (!confirmDowngrade) {
      setConfirmDowngrade(true);
      setTimeout(() => setConfirmDowngrade(false), 5000);
      return;
    }
    downgradePlan();
    setConfirmDowngrade(false);
    showToast("Downgraded to Free plan.", "info");
  };

  const handleCancelToggle = () => {
    const next = !subscription.cancelAtPeriodEnd;
    cancelAtPeriodEnd(next);
    showToast(next ? "Subscription will cancel at period end." : "Cancellation reversed.", "info");
  };

  const statusColor: Record<string, string> = {
    active:    "#10b981",
    trialing:  "#6C63FF",
    expired:   "#ef4444",
    cancelled: "#94a3b8",
    past_due:  "#f59e0b",
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="workspace-container billing-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="billing-header">
        <div>
          <h1>💳 Billing & Subscription</h1>
          <p className="workspace-subtitle">Manage your plan, usage, and payment history.</p>
        </div>
        {isDemoBillingMode && (
          <div className="billing-demo-badge">
            🧪 Demo Billing Mode — no real payments processed
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="billing-tabs">
        {(["overview", "plans", "usage", "history"] as const).map(tab => (
          <button
            key={tab}
            className={`billing-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "📋 Overview"
              : tab === "plans" ? "⚡ Plans"
              : tab === "usage" ? "📊 Usage"
              : "🧾 History"}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="billing-section">
          {/* Current Plan Card */}
          <div className="billing-plan-card">
            <div className="billing-plan-top">
              <div>
                <div className="billing-plan-name">{currentPlan.name}</div>
                <div className="billing-plan-desc">{currentPlan.description}</div>
              </div>
              <div className="billing-plan-price">
                {currentPlan.monthlyPrice === 0 && !currentPlan.enterprise
                  ? "Free"
                  : currentPlan.enterprise
                  ? "Custom"
                  : formatPlanPrice(
                      subscription.interval === "yearly" ? currentPlan.yearlyPrice : currentPlan.monthlyPrice,
                      subscription.interval,
                    )}
              </div>
            </div>

            <div className="billing-plan-meta">
              <span className="billing-status-badge" style={{ background: statusColor[subscription.status] + "22", color: statusColor[subscription.status] }}>
                {subscription.status.replace("_", " ").toUpperCase()}
              </span>
              {isTrial && (
                <span className="billing-trial-badge">
                  🎉 Trial — {trialDaysRemaining} days remaining
                </span>
              )}
              {subscription.cancelAtPeriodEnd && (
                <span className="billing-cancel-badge">⚠️ Cancels at period end</span>
              )}
            </div>

            <div className="billing-plan-dates">
              <div><span>Period Start</span><strong>{formatDate(subscription.currentPeriodStart)}</strong></div>
              <div><span>Renewal Date</span><strong>{formatDate(subscription.currentPeriodEnd)}</strong></div>
              <div><span>Days Remaining</span><strong>{daysUntilRenewal} days</strong></div>
              <div><span>Billing</span><strong style={{ textTransform: "capitalize" }}>{subscription.interval}</strong></div>
            </div>

            <div className="billing-plan-actions">
              <button className="workspace-btn" onClick={() => setActiveTab("plans")}>
                ⚡ {subscription.planId === "free" ? "Upgrade Plan" : "Change Plan"}
              </button>
              {subscription.planId !== "free" && (
                <button
                  className={`billing-cancel-btn ${confirmDowngrade ? "confirm" : ""}`}
                  onClick={handleDowngrade}
                >
                  {confirmDowngrade ? "⚠️ Confirm Downgrade to Free?" : "Downgrade to Free"}
                </button>
              )}
              {subscription.planId !== "free" && isActive && (
                <button className="billing-cancel-btn" onClick={handleCancelToggle}>
                  {subscription.cancelAtPeriodEnd ? "↩ Reverse Cancellation" : "Cancel Subscription"}
                </button>
              )}
            </div>
          </div>

          {/* Payment Method & Invoice placeholders */}
          <div className="billing-row">
            <div className="billing-placeholder-card">
              <div className="billing-placeholder-icon">💳</div>
              <h3>Payment Method</h3>
              <p>{isDemoBillingMode ? "Demo Mode — no payment method required." : "No payment method on file."}</p>
              {!isDemoBillingMode && (
                <button className="billing-secondary-btn">+ Add Payment Method</button>
              )}
            </div>
            <div className="billing-placeholder-card">
              <div className="billing-placeholder-icon">📄</div>
              <h3>Invoices</h3>
              <p>{billingHistory.length > 0
                ? `${billingHistory.length} billing record${billingHistory.length === 1 ? "" : "s"}.`
                : "No invoices yet."}
              </p>
              {billingHistory.length > 0 && (
                <button className="billing-secondary-btn" onClick={() => setActiveTab("history")}>
                  View All →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Plans Tab ── */}
      {activeTab === "plans" && (
        <div className="billing-section">
          <div className="billing-interval-toggle">
            <button
              className={`billing-interval-btn ${billingInterval === "monthly" ? "active" : ""}`}
              onClick={() => setBillingInterval("monthly")}
            >Monthly</button>
            <button
              className={`billing-interval-btn ${billingInterval === "yearly" ? "active" : ""}`}
              onClick={() => setBillingInterval("yearly")}
            >Yearly <span className="billing-save-badge">Save up to 25%</span></button>
          </div>

          <div className="billing-plans-grid">
            {allPlans.map(plan => {
              const isCurrent = plan.id === subscription.planId;
              const price = billingInterval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              const savings = getYearlySavings(plan);
              return (
                <div key={plan.id} className={`billing-plan-option ${plan.highlighted ? "highlighted" : ""} ${isCurrent ? "current" : ""}`}>
                  {plan.highlighted && <div className="billing-popular-badge">Most Popular</div>}
                  {isCurrent && <div className="billing-current-badge">✓ Current Plan</div>}
                  <h3 className="billing-option-name">{plan.name}</h3>
                  <p className="billing-option-desc">{plan.description}</p>
                  <div className="billing-option-price">
                    {plan.enterprise
                      ? <span className="billing-option-amount">Custom</span>
                      : plan.monthlyPrice === 0
                      ? <span className="billing-option-amount">Free</span>
                      : (
                        <>
                          <span className="billing-option-amount">{formatPlanPrice(price, billingInterval)}</span>
                          {billingInterval === "yearly" && savings > 0 && (
                            <span className="billing-option-savings">Save ${(savings / 100).toFixed(0)}/yr</span>
                          )}
                        </>
                      )}
                  </div>
                  <ul className="billing-option-features">
                    {plan.features.map(f => (
                      <li key={f}><span className="billing-check">✓</span> {f}</li>
                    ))}
                  </ul>
                  {plan.enterprise ? (
                    <button className="billing-secondary-btn" onClick={() => handleUpgrade(plan.id)}>
                      Contact Sales
                    </button>
                  ) : isCurrent ? (
                    <button className="billing-current-btn" disabled>Current Plan</button>
                  ) : (
                    <button
                      className={`workspace-btn ${plan.highlighted ? "" : "billing-secondary-btn"}`}
                      style={{ width: "100%" }}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id}
                    >
                      {upgrading === plan.id
                        ? "Processing…"
                        : plan.id === "free"
                        ? "Downgrade to Free"
                        : `Upgrade to ${plan.name}`}
                    </button>
                  )}
                  {!isCurrent && plan.id !== "free" && !plan.enterprise && subscription.planId === "free" && (
                    <button className="billing-trial-btn" onClick={() => handleTrial(plan.id)}>
                      Start 14-day free trial
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Usage Tab ── */}
      {activeTab === "usage" && (
        <div className="billing-section">
          <div className="billing-usage-card">
            <h3>📊 Usage This Period</h3>
            <p className="billing-usage-period">
              {formatDate(usage.periodStart)} — {formatDate(usage.periodEnd)}
            </p>
            <div className="billing-usage-list">
              <UsageBar
                label="🤖 AI Requests"
                used={usage.aiRequests}
                limit={currentPlan.limits.aiRequests}
              />
              <UsageBar
                label="📁 Projects"
                used={usage.projects}
                limit={currentPlan.limits.projects}
              />
              <UsageBar
                label="👥 Team Members"
                used={usage.teamMembers}
                limit={currentPlan.limits.teamMembers}
              />
              <UsageBar
                label="🗄️ Storage"
                used={parseFloat(usage.storageGB.toFixed(2))}
                limit={currentPlan.limits.storageGB}
                unit=" GB"
              />
              <UsageBar
                label="📤 Exports"
                used={usage.exports}
                limit={currentPlan.limits.exports}
              />
            </div>
            {currentPlan.id !== "enterprise" && (
              <div className="billing-usage-upgrade">
                <p>Need more? <button className="billing-link-btn" onClick={() => setActiveTab("plans")}>Upgrade your plan →</button></p>
              </div>
            )}
          </div>

          {/* AI Usage widget */}
          <div className="billing-usage-card" style={{ marginTop: 20 }}>
            <h3>🧠 AI Usage Breakdown</h3>
            <div className="billing-ai-stats">
              <div className="billing-ai-stat">
                <span className="billing-ai-stat-val">{usage.aiRequests}</span>
                <span className="billing-ai-stat-label">Requests Used</span>
              </div>
              <div className="billing-ai-stat">
                <span className="billing-ai-stat-val">
                  {currentPlan.limits.aiRequests === -1 ? "∞" : currentPlan.limits.aiRequests - usage.aiRequests}
                </span>
                <span className="billing-ai-stat-label">Remaining</span>
              </div>
              <div className="billing-ai-stat">
                <span className="billing-ai-stat-val">
                  {currentPlan.limits.aiRequests === -1 ? "∞" : currentPlan.limits.aiRequests}
                </span>
                <span className="billing-ai-stat-label">Monthly Limit</span>
              </div>
              <div className="billing-ai-stat">
                <span className="billing-ai-stat-val">{SubscriptionEngine.getUsagePercent("aiRequests")}%</span>
                <span className="billing-ai-stat-label">Utilization</span>
              </div>
            </div>
          </div>

          {/* Storage + Team widgets */}
          <div className="billing-row" style={{ marginTop: 20 }}>
            <div className="billing-usage-card" style={{ flex: 1 }}>
              <h3>🗄️ Storage Usage</h3>
              <div className="billing-ai-stats">
                <div className="billing-ai-stat">
                  <span className="billing-ai-stat-val">{usage.storageGB.toFixed(2)} GB</span>
                  <span className="billing-ai-stat-label">Used</span>
                </div>
                <div className="billing-ai-stat">
                  <span className="billing-ai-stat-val">
                    {currentPlan.limits.storageGB === -1 ? "∞" : `${currentPlan.limits.storageGB} GB`}
                  </span>
                  <span className="billing-ai-stat-label">Limit</span>
                </div>
              </div>
            </div>
            <div className="billing-usage-card" style={{ flex: 1 }}>
              <h3>👥 Team Usage</h3>
              <div className="billing-ai-stats">
                <div className="billing-ai-stat">
                  <span className="billing-ai-stat-val">{usage.teamMembers}</span>
                  <span className="billing-ai-stat-label">Members</span>
                </div>
                <div className="billing-ai-stat">
                  <span className="billing-ai-stat-val">
                    {currentPlan.limits.teamMembers === -1 ? "∞" : currentPlan.limits.teamMembers}
                  </span>
                  <span className="billing-ai-stat-label">Seat Limit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <div className="billing-section">
          <div className="billing-usage-card">
            <h3>🧾 Billing History</h3>
            {billingHistory.length === 0 ? (
              <div className="billing-empty">
                <p>📭 No billing records yet.</p>
                {subscription.planId === "free" && (
                  <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary, #64748b)" }}>
                    Upgrade to a paid plan to see invoices here.
                  </p>
                )}
              </div>
            ) : (
              <table className="billing-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.description}</td>
                      <td>{formatAmount(record.amount)}</td>
                      <td>
                        <span className={`billing-record-status ${record.status}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        {record.invoiceUrl
                          ? <a href={record.invoiceUrl} target="_blank" rel="noreferrer">Download</a>
                          : <span className="billing-no-invoice">{isDemoBillingMode ? "Demo" : "—"}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Payment Methods placeholder */}
          <div className="billing-placeholder-card" style={{ marginTop: 20 }}>
            <div className="billing-placeholder-icon">💳</div>
            <h3>Payment Methods</h3>
            {isDemoBillingMode ? (
              <p>Demo Billing Mode — connect a payment provider (Stripe, Flutterwave, or Paystack) to manage real payment methods.</p>
            ) : (
              <>
                <p>No payment methods on file.</p>
                <button className="billing-secondary-btn">+ Add Card</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
