import React from 'react';
import { ThreatReport } from '../types/threat';
import { DEMO_CASES } from '../data/demoCases';
import { ThreatRadarVisualizer } from './ThreatRadarVisualizer';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Search, 
  Activity, 
  Layers, 
  ChevronRight, 
  TrendingUp, 
  Inbox, 
  ArrowRight, 
  Shield, 
  Zap, 
  Radar, 
  Compass,
  Lock
} from 'lucide-react';

interface CommandCenterOverviewProps {
  history: ThreatReport[];
  onSelectReport: (report: ThreatReport) => void;
  onLaunchDemo: (demoId: string) => void;
  onNavigateToAnalyzer: () => void;
  onNavigateToAgentSecurity: () => void;
}

export const CommandCenterOverview: React.FC<CommandCenterOverviewProps> = ({
  history,
  onSelectReport,
  onLaunchDemo,
  onNavigateToAnalyzer,
  onNavigateToAgentSecurity
}) => {
  const totalCases = history.length;
  const criticalCases = history.filter(c => c.riskCategory === 'CRITICAL').length;
  const highCases = history.filter(c => c.riskCategory === 'HIGH').length;
  const moderateCases = history.filter(c => c.riskCategory === 'MODERATE').length;
  const lowCases = history.filter(c => c.riskCategory === 'LOW').length;

  const severeThreatsCount = criticalCases + highCases;

  const categoryCounts: Record<string, number> = {};
  history.forEach(c => {
    c.threatCategories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

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
      {/* High-Fidelity Cyber Defense Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden cyber-card-elevated border border-cyan-500/30 shadow-2xl">
        {/* Generated Cinematic Cyber Intel Radar Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/src/assets/images/hero_cyber_intel_radar_1791557111963.jpg"
            alt="Global Cyber Threat Intelligence Command Center"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#05070B]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                VIGILANT DEFENSE MATRIX
              </span>
              <span className="text-white/20">/</span>
              <span className="text-slate-300 font-medium">Unified AI Security Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              See the threat before it strikes.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Real-time intelligence exposing deceptive social engineering, high-pressure credential theft, and prompt injections targeting autonomous AI agents with transparent evidence reports.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToAnalyzer}
              className="px-5 py-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              Start Threat Analysis
            </button>
            <button
              onClick={onNavigateToAgentSecurity}
              className="px-4 py-3 bg-[#0A0E17]/80 hover:bg-[#0E1422] border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI Agent Security
            </button>
          </div>
        </div>
      </div>

      {/* Real Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Investigations */}
        <div className="cyber-card rounded-2xl p-5 flex flex-col justify-between cyber-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px] text-slate-400">Total Analyzed</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tabular-nums text-white tracking-tight">
              {totalCases}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
              <span>{totalCases === 0 ? 'No session scans yet' : `${totalCases} evaluated in memory`}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Severe Threats */}
        <div className="cyber-card rounded-2xl p-5 flex flex-col justify-between cyber-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-transparent" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px] text-slate-400">Severe Threats</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tabular-nums text-rose-400 tracking-tight">
              {severeThreatsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
              <span>{totalCases > 0 ? `${Math.round((severeThreatsCount / totalCases) * 100)}% of investigated volume` : 'Zero active alerts'}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Benign & Low-Risk */}
        <div className="cyber-card rounded-2xl p-5 flex flex-col justify-between cyber-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px] text-slate-400">Verified Benign</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tabular-nums text-emerald-400 tracking-tight">
              {lowCases}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
              <span>Clean communications</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Ambiguous Requiring Verification */}
        <div className="cyber-card rounded-2xl p-5 flex flex-col justify-between cyber-card-hover group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-transparent" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px] text-slate-400">Inquiry Required</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono tabular-nums text-amber-400 tracking-tight">
              {moderateCases}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
              <span>Out-of-band checks warranted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Threat Radar & Vector Tracking Console */}
      <div className="cyber-card rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Perimeter Threat Radar</h2>
              <p className="text-[11px] text-slate-400">Interactive live 360° scan of adversarial intrusion vectors</p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            RADAR ACTIVE
          </span>
        </div>

        <ThreatRadarVisualizer onSelectBlip={onLaunchDemo} />
      </div>

      {/* Main Command Center Grid: Threat Distribution + Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Investigations Stream */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Threat Investigations</h2>
            </div>
            {totalCases > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                {totalCases} cases logged
              </span>
            )}
          </div>

          {totalCases === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01] space-y-3">
              <Inbox className="w-9 h-9 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                No active session investigations yet
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Paste suspicious text into the Threat Analyzer or select one of the 7 synthetic demo cases below to inspect complete evidence reports.
              </p>
              <button
                onClick={onNavigateToAnalyzer}
                className="mt-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all shadow-sm"
              >
                Launch Threat Analyzer →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {history.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="py-3.5 px-3 flex items-center justify-between gap-4 hover:bg-white/[0.03] rounded-xl cursor-pointer transition-all group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getVerdictBadgeStyle(report.riskCategory)}`}>
                        {report.riskCategory} · {report.riskScore}/100
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {report.senderAssessment.claimedSender}
                      </span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {report.sourceType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-cyan-400 group-hover:text-cyan-300 font-semibold transition-colors">
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Threat Distribution Breakdown */}
        <div className="cyber-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">Threat Category Vector Split</h2>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-white/[0.06] rounded-xl bg-white/[0.01]">
              Execute scans to populate real category telemetry.
            </div>
          ) : (
            <div className="space-y-3.5">
              {sortedCategories.slice(0, 5).map(([category, count]) => {
                const pct = Math.round((count / totalCases) * 100);
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200 font-medium truncate max-w-[170px]">{category}</span>
                      <span className="text-slate-400 font-mono tabular-nums">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Zero Fabricated Data:</strong> All metrics derive strictly from in-memory session investigations with zero fake indicators.
          </div>
        </div>
      </div>

      {/* Synthetic Demo Scenario Vault (7 Required Test Cases) */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Standardized Synthetic Threat Scenarios
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              One-click evaluation of benchmark fraud vectors and benign workplace controls:
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
            7 Scenarios Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {DEMO_CASES.map((demo) => (
            <button
              key={demo.id}
              onClick={() => onLaunchDemo(demo.id)}
              className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/40 rounded-xl text-left transition-all group space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {demo.title}
                </span>
                <span className={`text-[10px] font-mono font-bold shrink-0 ml-1.5 px-1.5 py-0.5 rounded-full border ${getVerdictBadgeStyle(demo.expectedVerdict)}`}>
                  {demo.expectedVerdict}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {demo.description}
              </p>
              <div className="text-[10px] text-cyan-400 font-mono font-semibold flex items-center gap-1 pt-1">
                <span>Evaluate Vector</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
