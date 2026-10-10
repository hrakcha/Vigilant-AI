import React, { useState } from 'react';
import { X, Search, Globe, AlertTriangle, Info, CheckCircle2, Shield } from 'lucide-react';
import { UrlInspectionResult } from '../types/threat';

interface UrlInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertUrl?: (url: string) => void;
}

export const UrlInspectorModal: React.FC<UrlInspectorModalProps> = ({
  isOpen,
  onClose,
  onInsertUrl
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState<UrlInspectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/inspect-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Inspection failed');
      }

      const data: UrlInspectionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect URL');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'HIGH': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'MODERATE': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="cyber-card border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#080B12]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Safe Offline URL Syntactic Scanner</h3>
              <p className="text-[11px] text-slate-400">Zero remote HTTP requests or DNS resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#0A0D15]/95">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Zero-Trust Protocol:</strong> This inspector evaluates structural, lexical, and brand-spoofing characteristics entirely offline. No HTTP requests or DNS queries are initiated to untrusted remote destinations.
            </p>
          </div>

          <form onSubmit={handleInspect} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Suspicious URL or Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. https://chase-security-verify-session819.com/auth?token=948194"
                className="flex-1 bg-[#07090F] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !urlInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-sky-300 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                {loading ? 'Analyzing...' : 'Scan Offline'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-4 pt-2">
              {/* Verdict header */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Calculated Threat Level</span>
                  <span className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-full border inline-block mt-1 ${getRiskColor(result.riskLevel)}`}>
                    {result.riskLevel} RISK
                  </span>
                </div>
                {onInsertUrl && (
                  <button
                    onClick={() => {
                      onInsertUrl(result.url);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-colors"
                  >
                    Insert Into Threat Analysis →
                  </button>
                )}
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <span className="text-slate-500 block text-[10px]">PARSED HOST</span>
                  <span className="text-white font-semibold truncate block mt-0.5">{result.parsedHost}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <span className="text-slate-500 block text-[10px]">PROTOCOL</span>
                  <span className="text-white font-semibold block mt-0.5">{result.protocol}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <span className="text-slate-500 block text-[10px]">SUSPICIOUS TLD</span>
                  <span className={result.hasSuspiciousTld ? 'text-rose-400 font-bold block mt-0.5' : 'text-emerald-400 block mt-0.5'}>
                    {result.hasSuspiciousTld ? 'YES (High Abuse TLD)' : 'Standard Registry'}
                  </span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <span className="text-slate-500 block text-[10px]">IP HOSTNAME</span>
                  <span className={result.isIpAddress ? 'text-rose-400 font-bold block mt-0.5' : 'text-emerald-400 block mt-0.5'}>
                    {result.isIpAddress ? 'Direct IP Address (Evasive)' : 'Domain Name Resolved'}
                  </span>
                </div>
              </div>

              {/* Findings */}
              {result.findings.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    Suspicious Structural Indicators:
                  </span>
                  <div className="space-y-1.5">
                    {result.findings.map((finding: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
