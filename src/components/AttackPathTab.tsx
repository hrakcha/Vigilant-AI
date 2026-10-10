import React from 'react';
import { ThreatReport } from '../types/threat';
import { AttackPathView } from './AttackPathView';
import { DEMO_CASES } from '../data/demoCases';
import { GitFork, ArrowRight, Layers, Shield } from 'lucide-react';

interface AttackPathTabProps {
  currentReport: ThreatReport | null;
  history: ThreatReport[];
  onSelectReport: (report: ThreatReport) => void;
  onLaunchDemo: (demoId: string) => void;
}

export const AttackPathTab: React.FC<AttackPathTabProps> = ({
  currentReport,
  history,
  onSelectReport,
  onLaunchDemo
}) => {
  const getRiskBadge = (cat: string) => {
    switch (cat) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'MODERATE': return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      default: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <GitFork className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Attack Path Reconstruction & Kill Chain Sequence
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Cyber deception rarely happens in a single isolated step. VIGILANT AI models the attacker's progression from initial contact through psychological trust manipulation to credential harvesting or financial diversion—explicitly separating verified input evidence from hypothetical post-exploitation stages.
            </p>
          </div>
        </div>
      </div>

      {currentReport ? (
        <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  ACTIVE CASE DOSSIER:
                </span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${getRiskBadge(currentReport.riskCategory)}`}>
                  {currentReport.riskCategory} ({currentReport.riskScore}/100)
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                {currentReport.senderAssessment.claimedSender} · {currentReport.sourceType}
              </h3>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {currentReport.attackPath.length} Kill Chain Stages
            </span>
          </div>

          <AttackPathView stages={currentReport.attackPath} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="cyber-card rounded-2xl p-10 border border-white/[0.08] text-center space-y-3 shadow-xl">
            <GitFork className="w-10 h-10 text-cyan-400/60 mx-auto" />
            <h3 className="text-sm font-bold text-white">
              No Active Investigation Loaded
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              To reconstruct a multi-stage attack kill chain, select a case from your session history or launch one of our synthetic demonstration cases below.
            </p>
          </div>

          {/* Session History Picker if available */}
          {history.length > 0 && (
            <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Select Past Investigation from Session Log ({history.length})
                </h3>
                <span className="text-[11px] text-cyan-400 font-mono">Saved in Memory</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => onSelectReport(rep)}
                    className="p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/40 rounded-xl text-left transition-all group space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(rep.riskCategory)}`}>
                        {rep.riskCategory} · {rep.riskScore}/100
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {rep.senderAssessment.claimedSender}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {rep.summary}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Demo Case Selector */}
          <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-3 shadow-xl">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Or Select Demo Case to Reconstruct Kill Chain
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEMO_CASES.filter(d => d.expectedVerdict === 'CRITICAL' || d.expectedVerdict === 'HIGH').map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => onLaunchDemo(demo.id)}
                  className="p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/40 rounded-xl text-left transition-all group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {demo.title}
                    </span>
                    <span className="text-[10px] font-bold text-rose-400 font-mono">
                      {demo.expectedVerdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {demo.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
