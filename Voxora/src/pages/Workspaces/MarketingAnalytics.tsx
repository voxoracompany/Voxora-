// ── V4.6 Marketing Analytics ──────────────────────────────────────────────────
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4 }}>
        <div style={{ height: 8, width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", minWidth: 40, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

export default function MarketingAnalytics({ setWorkspace }: Props) {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState({
    emailOpenRate: "28", emailClickRate: "4.2", emailConversion: "2.1",
    seoTraffic: "3400", seoConversion: "3.8", seoBounce: "42",
    socialImpressions: "12000", socialEngagement: "5.4", socialFollowers: "1840",
    campaignROI: "320", campaignLeads: "145", adConversion: "2.8",
  });

  const update = (k: string, v: string) => setMetrics(prev => ({ ...prev, [k]: v }));

  const exportCSV = () => {
    const rows = Object.entries(metrics).map(([k, v]) => `${k},${v}`);
    const csv = ["Metric,Value", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "marketing-analytics.csv"; a.click();
    showToast("📥 Marketing data exported!");
  };

  const sections = [
    {
      title: "📧 Email Performance", color: "#6C63FF",
      items: [
        { label: "Open Rate", key: "emailOpenRate", unit: "%", max: 60 },
        { label: "Click-Through Rate", key: "emailClickRate", unit: "%", max: 20 },
        { label: "Conversion Rate", key: "emailConversion", unit: "%", max: 10 },
      ],
    },
    {
      title: "🔍 SEO Performance", color: "#10b981",
      items: [
        { label: "Organic Traffic", key: "seoTraffic", unit: "", max: 10000 },
        { label: "Conversion Rate", key: "seoConversion", unit: "%", max: 10 },
        { label: "Bounce Rate", key: "seoBounce", unit: "%", max: 100 },
      ],
    },
    {
      title: "📱 Social Media", color: "#ec4899",
      items: [
        { label: "Impressions", key: "socialImpressions", unit: "", max: 50000 },
        { label: "Engagement Rate", key: "socialEngagement", unit: "%", max: 15 },
        { label: "Followers", key: "socialFollowers", unit: "", max: 10000 },
      ],
    },
    {
      title: "📢 Campaign Performance", color: "#f59e0b",
      items: [
        { label: "ROI", key: "campaignROI", unit: "%", max: 500 },
        { label: "Leads Generated", key: "campaignLeads", unit: "", max: 500 },
        { label: "Ad Conversion Rate", key: "adConversion", unit: "%", max: 10 },
      ],
    },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>📣 Marketing Analytics</h1>
      <p className="workspace-subtitle">Campaign performance, SEO, social media, email, and conversion rates in one view.</p>

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">📧</div><p className="stat-value">{metrics.emailOpenRate}%</p><h3 className="stat-label">Email Open Rate</h3></div>
        <div className="stat-card"><div className="stat-icon">🔍</div><p className="stat-value">{Number(metrics.seoTraffic).toLocaleString()}</p><h3 className="stat-label">SEO Traffic</h3></div>
        <div className="stat-card"><div className="stat-icon">📱</div><p className="stat-value">{metrics.socialEngagement}%</p><h3 className="stat-label">Social Engagement</h3></div>
        <div className="stat-card"><div className="stat-icon">💰</div><p className="stat-value">{metrics.campaignROI}%</p><h3 className="stat-label">Campaign ROI</h3></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 20, marginBottom: 24 }}>
        {sections.map(section => (
          <div key={section.title} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>{section.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {section.items.map(item => (
                <div key={item.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{item.label}</span>
                    <input style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700, width: 70, textAlign: "right", color: section.color }}
                      value={(metrics as any)[item.key]} onChange={e => update(item.key, e.target.value)} />
                  </div>
                  <MiniBar value={Number((metrics as any)[item.key]) || 0} max={item.max} color={section.color} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="workspace-btn" onClick={exportCSV}>📥 Export CSV</button>
        <button className="workspace-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => showToast("📣 Marketing data saved!")}>💾 Save</button>
      </div>
    </div>
  );
}
