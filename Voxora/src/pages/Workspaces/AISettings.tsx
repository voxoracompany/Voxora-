// ── V5.2 AI Engine — AI Settings Workspace ───────────────────────────────────
import { useState } from 'react';
import { useAIContext } from '../../context/AIContext';
import { PromptLibrary } from '../../services/ai/PromptLibrary';
import { GeminiProvider } from '../../services/ai/providers/GeminiProvider';
import { useToast } from '../../context/ToastContext';
import './AISettings.css';

const PROVIDERS = [
  { value: 'mock',      label: '🔮 Mock (Demo)',   desc: 'No API key needed. Smart simulated responses.' },
  { value: 'openai',    label: '🤖 OpenAI',        desc: 'GPT-4o Mini — fast, affordable, excellent quality.' },
  { value: 'gemini',    label: '✨ Google Gemini',  desc: 'Gemini 1.5 Flash — multimodal, large context window.' },
  { value: 'anthropic', label: '🧠 Anthropic Claude', desc: 'Claude 3 Haiku — safe, structured, nuanced reasoning.' },
] as const;

const PROMPT_STYLES = [
  { value: 'concise',  label: 'Concise',  desc: 'Short, punchy answers (< 300 words).' },
  { value: 'detailed', label: 'Detailed', desc: 'Comprehensive structured outputs (default).' },
  { value: 'creative', label: 'Creative', desc: 'Bold, unconventional — challenges assumptions.' },
] as const;

const WORKSPACES = [
  { value: 'assistant',  label: '🤖 AI Assistant'       },
  { value: 'content',    label: '✍️ AI Content'         },
  { value: 'apps',       label: '💡 App Ideas'           },
  { value: 'startup',    label: '🚀 Startup Ideas'       },
  { value: 'swot',       label: '📋 SWOT Analysis'       },
  { value: 'competitor', label: '🏆 Competitor Analysis' },
  { value: 'market',     label: '📈 Market Research'     },
  { value: 'research',   label: '🔬 Customer Research'   },
  { value: 'persona',    label: '👤 Customer Persona'    },
  { value: 'validation', label: '✅ Product Validation'  },
  { value: 'business',   label: '🏢 Business Model'      },
];

type TestStatus = 'idle' | 'testing' | 'ok' | 'error';

interface Props { setWorkspace: (w: string) => void }

export default function AISettings({ setWorkspace }: Props) {
  const { settings, updateSettings, isDemoMode, activeProvider } = useAIContext();
  const { showToast } = useToast();

  // Local draft state so changes only apply when Save is clicked
  const [draft, setDraft] = useState(() => ({
    provider:         settings.provider,
    temperature:      settings.temperature,
    maxTokens:        settings.maxTokens,
    streaming:        settings.streaming,
    memoryEnabled:    settings.memoryEnabled,
    defaultWorkspace: settings.defaultWorkspace,
    promptStyle:      settings.promptStyle,
    openaiKey:        '',   // never pre-fill from settings for security
    geminiKey:        '',
    anthropicKey:     '',
  }));

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMsg, setTestMsg]       = useState('');

  /** Test the Gemini API key currently in the draft or saved settings. */
  const handleTestGemini = async () => {
    const key = draft.geminiKey || settings.apiKeys.gemini;
    if (!key) {
      showToast('⚠️ Enter a Gemini API key first.', 'error');
      return;
    }
    setTestStatus('testing');
    setTestMsg('');
    try {
      const provider = new GeminiProvider(key);
      const res = await provider.generate({
        prompt:    'Reply with exactly: "Gemini connection successful."',
        maxTokens: 32,
        temperature: 0,
      });
      if (res.content.length > 0) {
        setTestStatus('ok');
        setTestMsg(`✅ Connected — ${res.responseTime}ms · model: ${res.model}`);
        showToast('✅ Gemini connection successful!');
      } else {
        throw new Error('Empty response from Gemini');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setTestStatus('error');
      setTestMsg(`❌ ${msg}`);
      showToast('❌ Gemini connection failed. Check your API key.', 'error');
    }
  };

  const handleSave = () => {
    updateSettings({
      provider:         draft.provider,
      temperature:      draft.temperature,
      maxTokens:        draft.maxTokens,
      streaming:        draft.streaming,
      memoryEnabled:    draft.memoryEnabled,
      defaultWorkspace: draft.defaultWorkspace,
      promptStyle:      draft.promptStyle,
      apiKeys: {
        openai:    draft.openaiKey    || settings.apiKeys.openai,
        gemini:    draft.geminiKey    || settings.apiKeys.gemini,
        anthropic: draft.anthropicKey || settings.apiKeys.anthropic,
      },
    });
    showToast('✅ AI settings saved!');
  };

  const handleReset = () => {
    updateSettings({
      provider: 'mock', temperature: 0.7, maxTokens: 1024,
      streaming: true, memoryEnabled: true,
      defaultWorkspace: 'assistant', promptStyle: 'detailed',
      apiKeys: { openai: '', gemini: '', anthropic: '' },
    });
    setDraft({ provider: 'mock', temperature: 0.7, maxTokens: 1024, streaming: true, memoryEnabled: true, defaultWorkspace: 'assistant', promptStyle: 'detailed', openaiKey: '', geminiKey: '', anthropicKey: '' });
    showToast('🔄 AI settings reset to defaults.', 'info');
  };

  return (
    <div className="ai-settings-container">
      <button className="back-btn" onClick={() => setWorkspace('dashboard')}>← Back to Dashboard</button>
      <h1>🧠 AI Engine Settings</h1>
      <p className="workspace-subtitle">Configure the AI that powers every Voxora workspace.</p>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="ai-demo-banner">
          <span>🔮</span>
          <div>
            <strong>Running in Demo Mode</strong>
            <p>Configure an API key below to switch to a live AI provider. All features work in demo mode with simulated responses.</p>
          </div>
        </div>
      )}

      {/* Provider */}
      <div className="ai-settings-card">
        <h3>🤖 AI Provider</h3>
        <p className="ai-settings-desc">Choose which AI powers your workspace. Voxora automatically falls back to Demo Mode if no API key is found.</p>
        <div className="ai-provider-grid">
          {PROVIDERS.map(p => (
            <button
              key={p.value}
              className={`ai-provider-card ${draft.provider === p.value ? 'active' : ''}`}
              onClick={() => setDraft(d => ({ ...d, provider: p.value }))}
            >
              <span className="ai-provider-label">{p.label}</span>
              <span className="ai-provider-desc">{p.desc}</span>
              {activeProvider === p.value && !isDemoMode && <span className="ai-provider-badge">Active</span>}
            </button>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="ai-settings-card">
        <h3>🔑 API Keys</h3>
        <p className="ai-settings-desc">Keys are stored in your browser only — never sent to Voxora servers. Leave blank to keep the existing saved key.</p>

        <div className="ai-key-row">
          <label>OpenAI API Key</label>
          <input
            type="password"
            className="ai-key-input"
            placeholder={settings.apiKeys.openai ? '••••••••••••••••••••' : 'sk-...'}
            value={draft.openaiKey}
            onChange={e => setDraft(d => ({ ...d, openaiKey: e.target.value }))}
          />
          {settings.apiKeys.openai && <span className="ai-key-status">✅ Key saved</span>}
        </div>

        <div className="ai-key-row">
          <label>Google Gemini API Key</label>
          <input
            type="password"
            className="ai-key-input"
            placeholder={settings.apiKeys.gemini ? '••••••••••••••••••••' : 'AIza...'}
            value={draft.geminiKey}
            onChange={e => { setDraft(d => ({ ...d, geminiKey: e.target.value })); setTestStatus('idle'); setTestMsg(''); }}
          />
          <div className="ai-key-actions">
            {settings.apiKeys.gemini && <span className="ai-key-status">✅ Key saved</span>}
            <button
              className={`ai-test-btn ${testStatus}`}
              onClick={handleTestGemini}
              disabled={testStatus === 'testing'}
            >
              {testStatus === 'testing' ? '⏳ Testing…' : '🔌 Test Connection'}
            </button>
          </div>
          {testMsg && (
            <p className={`ai-test-result ${testStatus}`}>{testMsg}</p>
          )}
        </div>

        <div className="ai-key-row">
          <label>Anthropic API Key</label>
          <input
            type="password"
            className="ai-key-input"
            placeholder={settings.apiKeys.anthropic ? '••••••••••••••••••••' : 'sk-ant-...'}
            value={draft.anthropicKey}
            onChange={e => setDraft(d => ({ ...d, anthropicKey: e.target.value }))}
          />
          {settings.apiKeys.anthropic && <span className="ai-key-status">✅ Key saved</span>}
        </div>
      </div>

      {/* Generation Settings */}
      <div className="ai-settings-card">
        <h3>⚙️ Generation Settings</h3>

        <div className="ai-setting-row">
          <div className="ai-setting-info">
            <label>Temperature <span className="ai-setting-value">{draft.temperature.toFixed(1)}</span></label>
            <p>Controls creativity. Lower = more predictable. Higher = more creative.</p>
          </div>
          <input
            type="range" min="0" max="2" step="0.1"
            className="ai-slider"
            value={draft.temperature}
            onChange={e => setDraft(d => ({ ...d, temperature: Number(e.target.value) }))}
          />
          <div className="ai-slider-labels"><span>0.0 Precise</span><span>2.0 Creative</span></div>
        </div>

        <div className="ai-setting-row">
          <div className="ai-setting-info">
            <label>Max Tokens <span className="ai-setting-value">{draft.maxTokens.toLocaleString()}</span></label>
            <p>Maximum length of AI responses. ~750 words per 1,000 tokens.</p>
          </div>
          <input
            type="range" min="256" max="4096" step="256"
            className="ai-slider"
            value={draft.maxTokens}
            onChange={e => setDraft(d => ({ ...d, maxTokens: Number(e.target.value) }))}
          />
          <div className="ai-slider-labels"><span>256</span><span>4,096</span></div>
        </div>
      </div>

      {/* Prompt Style */}
      <div className="ai-settings-card">
        <h3>✍️ Prompt Style</h3>
        <p className="ai-settings-desc">Controls how AI responses are structured across all workspaces.</p>
        <div className="ai-style-grid">
          {PROMPT_STYLES.map(s => (
            <button
              key={s.value}
              className={`ai-style-card ${draft.promptStyle === s.value ? 'active' : ''}`}
              onClick={() => setDraft(d => ({ ...d, promptStyle: s.value }))}
            >
              <strong>{s.label}</strong>
              <span>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Behaviour */}
      <div className="ai-settings-card">
        <h3>🎛️ Behaviour</h3>

        <div className="ai-toggle-row">
          <div className="ai-toggle-info">
            <strong>Streaming Responses</strong>
            <p>Text appears word-by-word as the AI generates it.</p>
          </div>
          <button
            className={`ai-toggle ${draft.streaming ? 'on' : 'off'}`}
            onClick={() => setDraft(d => ({ ...d, streaming: !d.streaming }))}
          >
            {draft.streaming ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="ai-toggle-row">
          <div className="ai-toggle-info">
            <strong>Conversation Memory</strong>
            <p>Save conversations and enable context across sessions.</p>
          </div>
          <button
            className={`ai-toggle ${draft.memoryEnabled ? 'on' : 'off'}`}
            onClick={() => setDraft(d => ({ ...d, memoryEnabled: !d.memoryEnabled }))}
          >
            {draft.memoryEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="ai-setting-row" style={{ marginTop: 16 }}>
          <div className="ai-setting-info">
            <label>Default Workspace</label>
            <p>The AI workspace that opens when you enter the dashboard.</p>
          </div>
          <select
            className="ai-select"
            value={draft.defaultWorkspace}
            onChange={e => setDraft(d => ({ ...d, defaultWorkspace: e.target.value }))}
          >
            {WORKSPACES.map(w => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompt Library Info */}
      <div className="ai-settings-card">
        <h3>📚 Prompt Library</h3>
        <p className="ai-settings-desc">
          {PromptLibrary.count()} reusable prompt templates power every AI workspace — covering
          startup validation, SWOT, business models, competitor analysis, customer research, marketing,
          financial forecasting, pitch decks, and more.
        </p>
        <div className="ai-prompts-grid">
          {PromptLibrary.list().slice(0, 13).map(p => (
            <span key={p.id} className="ai-prompt-chip">{p.label}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="ai-settings-actions">
        <button className="ai-save-btn" onClick={handleSave}>💾 Save AI Settings</button>
        <button className="ai-reset-btn" onClick={handleReset}>🔄 Reset to Defaults</button>
      </div>
    </div>
  );
}
