// ── V6.0 Workspace-level Error Boundary ──────────────────────────────────────
// Wraps individual workspace panels so a crash in one tool never takes down
// the entire dashboard. The user can retry without a full-page reload.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  workspaceName?: string;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export default class WorkspaceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[Voxora WorkspaceErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    const name = this.props.workspaceName ?? "This workspace";

    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "60px 24px", textAlign: "center",
        minHeight: 320,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text, #0f172a)", margin: "0 0 8px" }}>
          {name} failed to load
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary, #6b7280)", maxWidth: 360, lineHeight: 1.6, margin: "0 0 24px" }}>
          An unexpected error occurred. Your data is safe — click below to try again, or navigate to a different workspace.
        </p>
        {this.state.error && (
          <details style={{
            background: "var(--color-border-light, #f1f5f9)",
            border: "1px solid var(--color-border, #e2e8f0)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
            maxWidth: 400, textAlign: "left", width: "100%",
          }}>
            <summary style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text, #374151)", cursor: "pointer" }}>
              Error details
            </summary>
            <pre style={{ fontSize: 11, color: "var(--color-text-secondary, #6b7280)", marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 120, overflow: "auto" }}>
              {this.state.error.message}
            </pre>
          </details>
        )}
        <button
          onClick={this.handleRetry}
          style={{
            padding: "10px 22px", background: "var(--accent, #6C63FF)", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(108,99,255,0.3)",
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }
}
