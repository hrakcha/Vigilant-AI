import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  BookOpen,
  Server,
  Shield,
  Layers,
  Key
} from 'lucide-react';

interface AiStatusData {
  provider: string;
  model: string;
  apiKeyConfigured: boolean;
  activeMode: string;
  status: string;
  capabilities: string[];
}

export const SettingsTab: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<AiStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-status');
      if (!res.ok) throw new Error('Failed to retrieve AI provider status');
      const data: AiStatusData = await res.json();
      setAiStatus(data);
    } catch (err: any) {
      setError(err.message || 'Error checking AI telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              System Telemetry, AI Provider Status & Security Architecture
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              VIGILANT AI pairs server-side Google Gemini neural reasoning with transparent deterministic heuristic rules. 
              Review active provider connectivity, scoring methodology, and zero-trust privacy boundaries below.
            </p>
          </div>
        </div>
      </div>

      {/* AI Provider Telemetry Card */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">AI Engine & Model Architecture</h3>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors"
            title="Refresh AI Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2.5 text-xs text-slate-400 py-6">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Probing server-side AI provider endpoint...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        ) : aiStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-400">Target Model Provider:</span>
              <div className="text-sm font-bold text-white">
                {aiStatus.provider} ({aiStatus.model})
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Connected via modern @google/genai TypeScript SDK
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-400">API Key Injection:</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">
                  {aiStatus.apiKeyConfigured ? 'Injected via Server Secrets' : 'Fallback Engine Ready'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Zero client exposure · Secure proxy routing
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-slate-400">Active Operational Mode:</span>
              <div className="text-sm font-bold text-cyan-300">
                {aiStatus.activeMode}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Deterministic regex rules provide zero-downtime resilience
              </div>
            </div>
          </div>
        ) : null}

        {/* Engine Capabilities */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-3">
            Engine Capabilities Matrix
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Social Engineering Detection',
              'Payment Diversion Heuristics',
              'Indirect Prompt Injection Inspection',
              'Offline Syntactic URL Inspection',
              'Kill Chain Attack Path Modeling',
              'Contextual Security Copilot',
              'Incident Response Workflows',
              'Deterministic Regex Fallback'
            ].map((cap, i) => (
              <div
                key={i}
                className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-2 text-xs text-slate-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="line-clamp-1">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy & Zero-Trust Architecture */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Zero-Trust Privacy & Operational Boundaries</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
            <h4 className="font-bold text-white">Volatile Memory Processing</h4>
            <p className="text-slate-400 leading-relaxed">
              Analyzed communications are processed in volatile container memory only. No permanent external databases store sensitive emails or credentials.
            </p>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
            <h4 className="font-bold text-white">Passive Offline URL Auditing</h4>
            <p className="text-slate-400 leading-relaxed">
              Suspicious links are decomposed syntactically for brand-spoofing, abnormal TLDs, and path entropy without resolving DNS or fetching malicious payloads.
            </p>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
            <h4 className="font-bold text-white">Browser-Isolated Storage</h4>
            <p className="text-slate-400 leading-relaxed">
              Case histories exist solely within browser `localStorage` on your client machine. You can purge all audit records instantly using the Clear button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
