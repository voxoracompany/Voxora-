// ── V4.1 AI Engine — Demo Mode Banner ────────────────────────────────────────
// Shown in every AI workspace when no API key is configured.

interface Props { onConfigure?: () => void }

export default function DemoBanner({ onConfigure }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
      border: '1.5px solid #a5b4fc', borderRadius: 12,
      padding: '10px 16px', marginBottom: 16, fontSize: 13,
    }}>
      <span style={{ fontSize: 20 }}>🔮</span>
      <div style={{ flex: 1 }}>
        <strong style={{ color: '#4338ca' }}>Running in Demo Mode</strong>
        <span style={{ color: '#3730a3', marginLeft: 6 }}>— AI responses are simulated.</span>
      </div>
      {onConfigure && (
        <button
          onClick={onConfigure}
          style={{
            padding: '4px 12px', background: '#6C63FF', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          Configure AI →
        </button>
      )}
    </div>
  );
}
