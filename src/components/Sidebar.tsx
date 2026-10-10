import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Search, 
  Cpu, 
  GitFork, 
  LifeBuoy, 
  History, 
  Settings, 
  Globe, 
  X,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ThreatReport } from '../types/threat';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentReport: ThreatReport | null;
  onNewAnalysis: () => void;
  onOpenUrlInspector: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentReport,
  onNewAnalysis,
  onOpenUrlInspector,
  mobileOpen,
  setMobileOpen
}) => {
  const navItems = [
    { 
      id: 'overview', 
      label: 'Command Center', 
      icon: LayoutDashboard,
      description: 'Threat posture & metrics'
    },
    { 
      id: 'analyzer', 
      label: 'Investigate Threat', 
      icon: Search,
      description: 'Message & scam analysis'
    },
    { 
      id: 'agent-security', 
      label: 'AI Agent Security', 
      icon: Cpu,
      description: 'Prompt injection & sandboxing'
    },
    { 
      id: 'attack-path', 
      label: 'Attack Path', 
      icon: GitFork,
      description: 'Kill chain reconstruction'
    },
    { 
      id: 'incident-response', 
      label: 'Incident Response', 
      icon: LifeBuoy,
      description: 'Containment playbooks'
    },
    { 
      id: 'history', 
      label: 'Case History', 
      icon: History,
      description: 'Forensic audit log'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'AI model & telemetry'
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const getRiskColor = (cat: string) => {
    switch (cat) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#080B12] border-r border-white/[0.08] text-slate-400 w-64 select-none relative shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40 shrink-0">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white font-mono">
                VIGILANT AI
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                INTEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              See the threat before it strikes
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Operations Console
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left relative group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 via-sky-500/10 to-transparent text-white border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {/* Luminous left edge indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-sky-500 rounded-r shadow-sm shadow-cyan-400" />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              <div className="flex-1 min-w-0 pl-0.5">
                <div className={`leading-none ${isActive ? 'font-bold text-white' : ''}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}

        {/* Security Utilities Section */}
        <div className="pt-4 px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Perimeter Tools
        </div>

        <button
          onClick={() => {
            onOpenUrlInspector();
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent transition-all text-left group"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="leading-none text-slate-300 group-hover:text-white">Safe URL Scanner</div>
            <div className="text-[10px] text-slate-500 mt-1">Syntactic offline audit</div>
          </div>
        </button>
      </div>

      {/* Active Investigation Card (If available) */}
      {currentReport && (
        <div className="p-3.5 mx-3 mb-3 rounded-xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] text-xs space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Active Dossier
            </span>
            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getRiskColor(currentReport.riskCategory)}`}>
              {currentReport.riskScore}/100
            </span>
          </div>
          <div className="text-[11px] font-semibold text-slate-200 truncate">
            {currentReport.senderAssessment.claimedSender}
          </div>
          <button
            onClick={() => handleNavClick('analyzer')}
            className="w-full mt-1 py-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>Review Investigation</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#06080E] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Zero-Trust Engine</span>
        </div>
        <span className="text-slate-500">v1.2</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-full h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
