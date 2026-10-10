import React from 'react';
import { Shield, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickScan }) => {
  const navItems = [
    { id: 'analyzer', label: 'Threat Analyzer' },
    { id: 'agent-security', label: 'AI Agent Guard' },
    { id: 'incident-response', label: 'Incident Response' },
    { id: 'history', label: 'Case History' },
    { id: 'settings', label: 'System & Intelligence' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button 
          onClick={() => setActiveTab('analyzer')} 
          className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              VIGILANT AI
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Single-line, unboxed, subtle hover states) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickScan}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20 active:scale-[0.98]"
          >
            New Investigation
          </button>
        </div>
      </div>
    </header>
  );
};
