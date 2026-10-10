import React, { useState } from 'react';
import { ThreatReport } from '../types/threat';
import { DEMO_CASES } from '../data/demoCases';
import { UrlInspectorModal } from './UrlInspectorModal';
import { 
  Play, 
  RotateCcw, 
  Globe, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface ThreatAnalyzerTabProps {
  onAnalysisComplete: (report: ThreatReport) => void;
  onSwitchToAgentSecurity?: () => void;
}

export const ThreatAnalyzerTab: React.FC<ThreatAnalyzerTabProps> = ({ 
  onAnalysisComplete,
  onSwitchToAgentSecurity
}) => {
  const [inputText, setInputText] = useState('');
  const [sourceType, setSourceType] = useState('Corporate Email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const sourceTypes = [
    'Corporate Email',
    'SMS / Text Message',
    'Recruitment Email',
    'Delivery Notification',
    'Customer Support Chat',
    'Financial / Banking Alert',
    'Social Media Direct Message',
    'Untrusted Document / Web Snippet'
  ];

  const handleLoadDemo = (demoId: string) => {
    const demo = DEMO_CASES.find(d => d.id === demoId);
    if (!demo) return;

    if (demo.targetType === 'agent' && onSwitchToAgentSecurity) {
      setSelectedDemoId(demo.id);
      setInputText(demo.sampleText);
      setSourceType(demo.sourceType);
      return;
    }

    setSelectedDemoId(demo.id);
    setInputText(demo.sampleText);
    setSourceType(demo.sourceType);
    setError(null);
  };

  const handleAnalyze = async (textToAnalyze = inputText) => {
    if (!textToAnalyze.trim()) {
      setError('Please paste or type suspicious content to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          sourceType
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Threat analysis failed.');
      }

      const report: ThreatReport = await res.json();
      onAnalysisComplete(report);
    } catch (err: any) {
      setError(err.message || 'An error occurred during threat investigation.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSelectedDemoId(null);
    setError(null);
  };

  const getVerdictBadgeStyle = (verdict: string) => {
    switch (verdict) {
      case 'CRITICAL':
      case 'BLOCK':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MODERATE':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero / Value Prop Banner */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Threat Investigation Console
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Investigate Suspicious Messages & Scams
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Detect deceptive patterns, expose psychological coercion, reconstruct the multi-stage attack kill chain, and evaluate sender claims against technical evidence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setUrlModalOpen(true)}
              className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-medium rounded-xl transition-all flex items-center gap-2 group"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Safe URL Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synthetic Demo Center (All 7 required scenarios) */}
      <div className="cyber-card rounded-2xl p-5 border border-white/[0.08] space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Standardized Synthetic Threat Scenarios
            </h3>
            <p className="text-xs text-slate-400">
              Load any benchmark case to test explainable evidence extraction across threat types:
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
            7 Synthetic Cases
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {DEMO_CASES.map((demo) => {
            const isSelected = selectedDemoId === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => handleLoadDemo(demo.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white line-clamp-1">
                    {demo.title}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${getVerdictBadgeStyle(demo.expectedVerdict)}`}>
                    {demo.expectedVerdict}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {demo.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Input Form */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
        {/* Controls Bar: Source Selector & Character Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-300">
              Communication Vector:
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="bg-[#0A0D15] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              {sourceTypes.map((st) => (
                <option key={st} value={st} className="bg-[#0A0D15] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
            <span>{inputText.length} / 12,000 characters</span>
            {selectedDemoId && (
              <span className="text-cyan-400 text-[11px] font-semibold">
                (Loaded Benchmark Case)
              </span>
            )}
          </div>
        </div>

        {/* Quick Format & Test Vector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 font-mono shrink-0 mr-1">Quick Sample:</span>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-bank-phish')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0"
          >
            Bank SMS
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-delivery-scam')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0"
          >
            Delivery Phish
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-ceo-fraud')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0"
          >
            Executive BEC
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-job-scam')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0"
          >
            Job Offer Scam
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-agent-injection')}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-colors shrink-0 font-medium"
          >
            AI Agent Injection
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-benign-message')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors shrink-0"
          >
            Benign Meeting
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo('demo-ambiguous-message')}
            className="px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 transition-colors shrink-0"
          >
            Ambiguous Invoice
          </button>
        </div>

        {/* AI Agent Directive Notice if detected */}
        {/(?:ignore|disregard|system\s+instruction\s+override|dan|debug\s+mode|exfiltrat)/i.test(inputText) && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>AI Agent Instruction Detected:</strong> This text contains prompt injection directives.
              </span>
            </div>
            {onSwitchToAgentSecurity && (
              <button
                type="button"
                onClick={onSwitchToAgentSecurity}
                className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Inspect in Agent Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          rows={7}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste suspicious SMS, email, payment demand, recruitment letter, raw URL (e.g. https://chase-security-verify-session819.com/auth), or AI agent instructions here..."
          className="w-full bg-[#07090F] border border-white/[0.1] rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 font-mono leading-relaxed focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
        />

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400">
            Zero-Trust Processing: Memory evaluated in isolation · Zero remote storage
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleClear}
              disabled={loading || !inputText}
              className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 border border-white/[0.08] text-slate-400 hover:text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !inputText.trim()}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-sky-300 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Investigating Payload...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Threat Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Safe URL Modal */}
      <UrlInspectorModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onInsertUrl={(url) => setInputText(prev => prev ? `${prev}\n\nSuspicious Link: ${url}` : url)}
      />
    </div>
  );
};
