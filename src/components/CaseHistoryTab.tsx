import React, { useState } from 'react';
import { ThreatReport } from '../types/threat';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  ChevronRight,
  Shield,
  Layers,
  Inbox
} from 'lucide-react';

interface CaseHistoryTabProps {
  history: ThreatReport[];
  onSelectReport: (report: ThreatReport) => void;
  onClearHistory: () => void;
}

export const CaseHistoryTab: React.FC<CaseHistoryTabProps> = ({
  history,
  onSelectReport,
  onClearHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesRisk = filterRisk === 'ALL' || item.riskCategory === filterRisk;
    const matchesQuery = 
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.senderAssessment.claimedSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inputSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesQuery;
  });

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vigilant-investigation-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">HIGH</span>;
      case 'MODERATE':
        return <span className="text-[10px] font-mono font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">MODERATE</span>;
      default:
        return <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Case History & Forensic Investigation Log
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Review past analyses from your local session. All investigative cases are maintained in local client storage with zero external retention to preserve data privacy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              onClick={handleExportAll}
              disabled={history.length === 0}
              className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON Log</span>
            </button>
            {confirmClearOpen ? (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl p-1">
                <span className="text-[11px] text-rose-300 px-2 font-mono">Confirm clear?</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setConfirmClearOpen(false);
                  }}
                  className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClearOpen(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearOpen(true)}
                disabled={history.length === 0}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 disabled:opacity-40 text-rose-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Log</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 cyber-card rounded-2xl p-4 border border-white/[0.08] shadow-xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sender, keyword, or report ID..."
            className="w-full bg-[#07090F] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-[#090D15] rounded-xl border border-white/[0.06]">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                filterRisk === risk
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Case List View */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-xl">
        {filteredHistory.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">
              No Investigations Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {history.length === 0
                ? 'Your session audit log is currently empty. Run scans in the Threat Analyzer to populate forensic records.'
                : 'No investigation records match your current search and filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredHistory.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] rounded-xl cursor-pointer transition-all group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRiskBadge(report.riskCategory)}
                    <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                      {report.riskScore}/100
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs font-bold text-white truncate">
                      {report.senderAssessment.claimedSender}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-[11px] text-slate-400">
                      {report.sourceType}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-xs text-cyan-400 group-hover:text-cyan-300 font-semibold transition-colors">
                  <span>Open Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
