// ── Global Error Boundary ─────────────────────────────────────────────────────
import { Component, type ReactNode } from "react";
import { ErrorReportingService } from "../services/admin/ErrorReportingService";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    ErrorReportingService.reportFromError(error, "runtime", "GlobalErrorBoundary");
    console.error("[Voxora ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => window.location.reload();

  handleDashboard = () => window.location.assign("/dashboard");

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main role="alert" aria-labelledby="global-error-title" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif",
        padding: "20px",
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "48px 40px",
          maxWidth: 480, width: "100%", textAlign: "center",
          boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>⚠️</div>
          <h1 id="global-error-title" style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6, margin: "0 0 28px" }}>
            Voxora encountered an unexpected error. Your data is safe — this is a display issue only.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={this.handleReload}
              autoFocus
              style={{
                padding: "12px 24px", background: "#6C63FF", color: "#fff", border: "none",
                borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
              }}
            >
              ↻ Reload
            </button>
            <button
              onClick={this.handleDashboard}
              style={{
                padding: "12px 24px", background: "#f9fafb", color: "#374151",
                border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 14,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              ▣ Return to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }
}
