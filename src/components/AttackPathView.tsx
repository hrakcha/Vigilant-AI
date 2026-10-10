import React from 'react';
import { AttackPathStage } from '../types/threat';

interface AttackPathViewProps {
  stages: AttackPathStage[];
}

export const AttackPathView: React.FC<AttackPathViewProps> = ({ stages }) => {
  if (!stages || stages.length === 0) {
    return (
      <div className="p-6 text-xs text-slate-400 bg-white/[0.02] border border-white/[0.08] rounded-xl text-center">
        Insufficient evidence in submitted text to reconstruct a multi-stage attack path.
      </div>
    );
  }

  const getUncertaintyBadge = (uncertainty: string) => {
    switch (uncertainty) {
      case 'CONFIRMED':
        return <span className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Confirmed</span>;
      case 'PROBABLE':
        return <span className="text-[11px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">Probable</span>;
      case 'PLAUSIBLE':
        return <span className="text-[11px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Plausible</span>;
      default:
        return <span className="text-[11px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1]">Speculative</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
        <span>Attack Kill Chain Timeline (Initial Contact → Exploitation)</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Direct Evidence in Text
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-700 border border-dashed border-slate-500" />
            Hypothetical Progression
          </span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.1]">
        {stages.map((stage) => {
          const isObserved = stage.status === 'OBSERVED_IN_TEXT';

          return (
            <div key={stage.step} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isObserved
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/30'
                    : 'bg-[#0A0D15] text-slate-500 border border-white/[0.1]'
                }`}
              >
                {stage.step}
              </div>

              {/* Card Container */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isObserved
                    ? 'bg-white/[0.02] border-white/[0.08] hover:border-cyan-500/40 shadow-sm'
                    : 'bg-white/[0.01] border-white/[0.06] border-dashed hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      Phase {stage.step}: {stage.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">
                      {isObserved ? 'Observed in Input' : 'Hypothetical Next Stage'}
                    </span>
                    <span className="text-white/20">·</span>
                    {getUncertaintyBadge(stage.uncertainty)}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  <span className="text-white font-medium">Attacker Objective: </span>
                  {stage.attackerObjective}
                </p>

                <div className="bg-[#07090F] rounded-lg border border-white/[0.08] p-3 text-xs">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">
                    {isObserved ? 'Supporting Input Evidence:' : 'Theoretical Threat Scenario:'}
                  </span>
                  <div className="font-mono text-cyan-300 text-[11px] break-words">
                    "{stage.evidence}"
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
