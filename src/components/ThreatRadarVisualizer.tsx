import React, { useState } from 'react';
import { ShieldAlert, Crosshair, Zap, Eye, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ThreatBlip {
  id: string;
  name: string;
  category: string;
  risk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  angle: number; // degrees
  distance: number; // percentage from center 0..100
  demoId?: string;
}

interface ThreatRadarVisualizerProps {
  onSelectBlip?: (demoId: string) => void;
}

export const ThreatRadarVisualizer: React.FC<ThreatRadarVisualizerProps> = ({ onSelectBlip }) => {
  const [activeBlip, setActiveBlip] = useState<ThreatBlip | null>(null);

  const blips: ThreatBlip[] = [
    {
      id: 'blip-1',
      name: 'Bank Phishing Attack',
      category: 'Credential Harvesting',
      risk: 'CRITICAL',
      angle: 42,
      distance: 78,
      demoId: 'demo-bank-phish'
    },
    {
      id: 'blip-2',
      name: 'Agent Prompt Override',
      category: 'Autonomous LLM Hijack',
      risk: 'CRITICAL',
      angle: 145,
      distance: 88,
      demoId: 'demo-agent-injection'
    },
    {
      id: 'blip-3',
      name: 'Delivery Fee Smishing',
      category: 'Financial Diversion',
      risk: 'HIGH',
      angle: 210,
      distance: 64,
      demoId: 'demo-delivery-scam'
    },
    {
      id: 'blip-4',
      name: 'Fake Executive Wire',
      category: 'Business Email Compromise',
      risk: 'CRITICAL',
      angle: 310,
      distance: 72,
      demoId: 'demo-ceo-fraud'
    },
    {
      id: 'blip-5',
      name: 'Unsolicited Job Offer',
      category: 'Advance Fee Employment',
      risk: 'HIGH',
      angle: 18,
      distance: 55,
      demoId: 'demo-job-scam'
    },
    {
      id: 'blip-6',
      name: 'Internal IT Routine Check',
      category: 'Legitimate System Notice',
      risk: 'LOW',
      angle: 110,
      distance: 30,
      demoId: 'demo-benign-message'
    },
    {
      id: 'blip-7',
      name: 'Vendor Invoice Query',
      category: 'Ambiguous Verification',
      risk: 'MODERATE',
      angle: 260,
      distance: 48,
      demoId: 'demo-ambiguous-message'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return '#F43F5E';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#EAB308';
      default: return '#10B981';
    }
  };

  const center = 150;
  const radius = 130;

  return (
    <div className="flex flex-col xl:flex-row items-center gap-6 p-4">
      {/* Radar SVG Visualizer Viewport */}
      <div className="relative w-[300px] h-[300px] shrink-0 select-none">
        {/* Luminous Glow under Radar */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

        <svg viewBox="0 0 300 300" className="w-full h-full relative z-10">
          <defs>
            {/* Sweep gradient */}
            <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>

            <filter id="blipGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Circular Plate */}
          <circle cx={center} cy={center} r={radius} fill="#090D16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

          {/* Concentric Distance Rings */}
          <circle cx={center} cy={center} r={radius * 0.75} fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.25} fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Crosshairs */}
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Diagonal Guides */}
          <line x1={center - radius * 0.7} y1={center - radius * 0.7} x2={center + radius * 0.7} y2={center + radius * 0.7} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 4" />
          <line x1={center - radius * 0.7} y1={center + radius * 0.7} x2={center + radius * 0.7} y2={center - radius * 0.7} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 4" />

          {/* Live Rotating Sweep Sector */}
          <g className="animate-radar-sweep" style={{ transformOrigin: `${center}px ${center}px` }}>
            <path
              d={`M ${center} ${center} L ${center + radius} ${center} A ${radius} ${radius} 0 0 0 ${center + radius * Math.cos(Math.PI / 3)} ${center - radius * Math.sin(Math.PI / 3)} Z`}
              fill="url(#radarSweepGradient)"
            />
            {/* Leading Edge Beam */}
            <line x1={center} y1={center} x2={center + radius} y2={center} stroke="#22D3EE" strokeWidth="1.5" />
          </g>

          {/* Interactive Threat Blips */}
          {blips.map((blip) => {
            const rad = (blip.angle * Math.PI) / 180;
            const distPx = (blip.distance / 100) * radius;
            const x = center + distPx * Math.cos(rad);
            const y = center + distPx * Math.sin(rad);
            const isHovered = activeBlip?.id === blip.id;
            const color = getRiskColor(blip.risk);

            return (
              <g
                key={blip.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => {
                  setActiveBlip(blip);
                  if (blip.demoId && onSelectBlip) onSelectBlip(blip.demoId);
                }}
                onMouseEnter={() => setActiveBlip(blip)}
              >
                {/* Ping wave */}
                <circle
                  cx={x}
                  cy={y}
                  r="9"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  className="animate-beacon-ping"
                  opacity="0.75"
                />

                {/* Outer Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '6' : '4.5'}
                  fill={isHovered ? color : '#0A0E17'}
                  stroke={color}
                  strokeWidth="2"
                  filter="url(#blipGlow)"
                />

                {/* Inner Core */}
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#FFFFFF"
                />
              </g>
            );
          })}

          {/* Center Origin Node */}
          <circle cx={center} cy={center} r="4" fill="#00E5FF" filter="url(#blipGlow)" />
          <circle cx={center} cy={center} r="1.5" fill="#FFFFFF" />
        </svg>

        {/* Tactical Corner HUD Labels */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
          RADAR · 360° SWEEP
        </div>
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500">
          RANGE: PERIMETER
        </div>
      </div>

      {/* Target Dossier Detail Box */}
      <div className="flex-1 min-w-0 w-full space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white tracking-tight uppercase font-mono">
              Vector Telemetry Lock
            </h4>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            {activeBlip ? 'TARGET LOCKED' : 'SELECT RADAR NODE'}
          </span>
        </div>

        {activeBlip ? (
          <div className="space-y-3 bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-white tracking-tight">
                  {activeBlip.name}
                </h5>
                <span className="text-xs text-slate-400 font-mono">
                  Vector: {activeBlip.category}
                </span>
              </div>
              <span
                className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0"
                style={{
                  color: getRiskColor(activeBlip.risk),
                  borderColor: `${getRiskColor(activeBlip.risk)}55`,
                  backgroundColor: `${getRiskColor(activeBlip.risk)}18`
                }}
              >
                {activeBlip.risk} SEVERITY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                <span className="block text-[9px] text-slate-500">BEARING ANGLE</span>
                <span className="text-white font-bold">{activeBlip.angle}° AZIMUTH</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                <span className="block text-[9px] text-slate-500">DETECTION DEPTH</span>
                <span className="text-white font-bold">{activeBlip.distance}% PERIMETER</span>
              </div>
            </div>

            {activeBlip.demoId && onSelectBlip && (
              <button
                onClick={() => onSelectBlip(activeBlip.demoId!)}
                className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Evaluate This Threat Vector Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/[0.08] space-y-1.5">
            <p className="text-xs text-slate-300 font-medium">
              Hover over or click any pulsing coordinate on the radar grid
            </p>
            <p className="text-[11px] text-slate-500">
              Real-time visualization of simulated adversarial intrusion vectors across enterprise perimeter boundaries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
