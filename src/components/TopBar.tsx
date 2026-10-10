import React, { useEffect, useState } from 'react';
import { Menu, Plus, Globe, Shield, Sparkles, Cpu } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onNewAnalysis: () => void;
  onOpenUrlInspector: () => void;
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onNewAnalysis,
  onOpenUrlInspector,
  onToggleMobileMenu
}) => {
  const [engineStatus, setEngineStatus] = useState<{
    model: string;
    ready: boolean;
    activeMode: string;
  }>({
    model: 'gemini-3.8-flash',
    ready: true,
    activeMode: 'Live Gemini Neural Reasoning'
  });

  useEffect(() => {
    fetch('/api/ai-status')
      .then(res => res.json())
      .then(data => {
        if (data.model) {
          setEngineStatus({
            model: data.model,
            ready: true,
            activeMode: data.activeMode || 'Live Gemini Neural Reasoning'
          });
        }
      })
      .catch(() => {
        setEngineStatus({
          model: 'Heuristic Rule Scanner',
          ready: true,
          activeMode: 'Deterministic Fallback'
        });
      });
  }, []);

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Command Center Overview';
      case 'analyzer': return 'Threat Investigation Workspace';
      case 'agent-security': return 'AI Agent Security & Prompt Injection';
      case 'attack-path': return 'Attack Path Kill Chain';
      case 'incident-response': return 'Incident Response Playbooks';
      case 'history': return 'Case History & Investigation Log';
      case 'settings': return 'System Settings & AI Telemetry';
      default: return 'Security Operations Center';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-[#080B12]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 shadow-sm">
      {/* Left: Mobile menu toggle + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">VIGILANT</span>
          <span className="text-cyan-500/60 hidden sm:inline">/</span>
          <span className="text-white font-bold tracking-tight truncate">
            {getSectionTitle()}
          </span>
        </div>
      </div>

      {/* Right: Telemetry pill + Quick Tools + New Investigation CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Real-time AI Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500">ENGINE:</span>
          <span className="text-cyan-300 font-semibold truncate max-w-[150px]" title={engineStatus.activeMode}>
            {engineStatus.model}
          </span>
        </div>

        {/* URL Inspector Quick Launch */}
        <button
          onClick={onOpenUrlInspector}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/30 text-slate-200 text-xs font-semibold transition-all group"
          title="Safe Offline Syntactic Link Inspector"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>URL Scanner</span>
        </button>

        {/* Primary New Investigation CTA (Gradient Cyan/Sky Button) */}
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Investigation</span>
        </button>
      </div>
    </header>
  );
};
