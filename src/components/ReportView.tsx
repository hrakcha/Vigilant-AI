import React, { useState } from 'react';
import { ThreatReport } from '../types/threat';
import { AttackPathView } from './AttackPathView';
import { CopilotPanel } from './CopilotPanel';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Bot, 
  Info, 
  CheckCircle2, 
  UserCheck, 
  ArrowUpRight,
  Sparkles,
  Cpu,
  Layers,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  Terminal,
  Crosshair
} from 'lucide-react';

interface ReportViewProps {
  report: ThreatReport;
  onNewAnalysis: () => void;
  onNavigateToIncidentResponse?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ 
  report, 
  onNewAnalysis,
  onNavigateToIncidentResponse 
}) => {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'redflags' | 'attackpath' | 'limitations'>('overview');
  const [showRawTerminal, setShowRawTerminal] = useState(true);

  const getRiskTheme = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return {
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-500/10',
          badgeBg: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
          strokeColor: '#F43F5E',
          glowColor: 'rgba(244, 63, 94, 0.25)'
        };
      case 'HIGH':
        return {
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgColor: 'bg-amber-500/10',
          badgeBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
          strokeColor: '#F59E0B',
          glowColor: 'rgba(245, 158, 11, 0.25)'
        };
      case 'MODERATE':
        return {
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/40',
          bgColor: 'bg-yellow-500/10',
          badgeBg: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
          strokeColor: '#EAB308',
          glowColor: 'rgba(234, 179, 8, 0.25)'
        };
      default:
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40',
          bgColor: 'bg-emerald-500/10',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
          strokeColor: '#10B981',
          glowColor: 'rgba(16, 185, 129, 0.25)'
        };
    }
  };

  const theme = getRiskTheme(report.riskCategory);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vigilant-threat-report-${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    const md = `# VIGILANT AI Threat Intelligence Report
**Report ID:** ${report.id}  
**Timestamp:** ${report.timestamp}  
**Risk Score:** ${report.riskScore}/100 (${report.riskCategory})  
**Confidence Score:** ${report.confidenceScore}%  
**Analysis Engine:** ${report.engineUsed} (${report.analysisTimeMs}ms)  

---

## Executive Summary
${report.summary}

## Claimed Sender & Verification Status
- **Claimed Sender:** ${report.senderAssessment.claimedSender}
- **Verification Status:** ${report.senderAssessment.verificationStatus}
- **Evidence:** ${report.senderAssessment.evidence}
- **Technical Caveat:** ${report.senderAssessment.technicalCaveat}

## Requested Action Analysis
- **Action Type:** ${report.requestedAction.actionType}
- **Description:** ${report.requestedAction.description}
- **Urgency Level:** ${report.requestedAction.urgencyLevel}
- **Potential Impact:** ${report.potentialImpact}

## Red Flags (${report.redFlags.length})
${report.redFlags.map(rf => `- **[${rf.severity.toUpperCase()}]** "${rf.phrase}": ${rf.reason} (${rf.category})`).join('\n')}

## Recommended Actions
${report.recommendedActions.map(ra => `${ra.priority}. **${ra.action}** - ${ra.explanation} [${ra.category}]`).join('\n')}

## Limitations
${report.limitations.map(lim => `- ${lim}`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigilant-report-${report.id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.riskScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.glowColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* High-Tech Circular SVG Gauge with calibrated tick glow */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-white/10"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={theme.strokeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black font-mono tabular-nums leading-none ${theme.textColor}`}>
                  {report.riskScore}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  /100
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
                  {report.riskCategory} THREAT
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {report.sourceType}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-cyan-400 font-mono">
                  Confidence: {report.confidenceScore}%
                </span>
                
                {report.isFallback && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span
                      title="VIGILANT AI used its local deterministic engine because Gemini analysis was unavailable."
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono"
                    >
                      {report.fallbackReason === 'QUOTA_EXCEEDED'
                        ? 'Gemini Quota Exhausted'
                        : report.fallbackReason === 'TIMEOUT'
                          ? 'Gemini Request Timed Out'
                          : report.fallbackReason === 'API_ERROR'
                            ? 'Local Analysis Active · Gemini Unavailable'
                            : 'Deterministic Fallback Mode'}
                    </span>
                  </>
                )}

              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Threat Intelligence Dossier
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {report.summary}
              </p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              onClick={() => setCopilotOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Security Copilot</span>
            </button>

            {onNavigateToIncidentResponse && (
              <button
                onClick={onNavigateToIncidentResponse}
                className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Containment Playbook</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
              title="Download JSON Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
              title="Download Markdown Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>MD</span>
            </button>

            <button
              onClick={onNewAnalysis}
              className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors"
            >
              New Scan
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Evidence Terminal View */}
      <div className="cyber-card rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Analyzed Input Payload
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">{report.inputSnippet.length} characters evaluated</span>
            <button
              onClick={() => setShowRawTerminal(!showRawTerminal)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              {showRawTerminal ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {showRawTerminal && (
          <div className="p-5 bg-[#06080E] font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text border-t border-white/[0.04]">
            {report.inputSnippet}
          </div>
        )}
      </div>

      {/* Segmented Sub-Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-[#090D15] border border-white/[0.08] rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          Executive Overview & Red Flags
        </button>

        <button
          onClick={() => setActiveSubTab('redflags')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeSubTab === 'redflags'
              ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <span>Evidence Extraction</span>
          <span className="px-1.5 py-0.2 bg-white/10 rounded text-[10px] font-mono">
            {report.redFlags.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('attackpath')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeSubTab === 'attackpath'
              ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <span>Attack Kill Chain</span>
          <span className="px-1.5 py-0.2 bg-white/10 rounded text-[10px] font-mono">
            {report.attackPath.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('limitations')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeSubTab === 'limitations'
              ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          Forensic Boundaries & Limitations
        </button>
      </div>

      {/* SUB-TAB 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Impersonation Detection Card */}
            <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    AI Impersonation Detection & Identity Claims
                  </h3>
                </div>
                {report.senderAssessment.impersonationRisk && (
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    report.senderAssessment.impersonationRisk === 'CRITICAL'
                      ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                      : report.senderAssessment.impersonationRisk === 'HIGH'
                      ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                      : report.senderAssessment.impersonationRisk === 'MODERATE'
                      ? 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30'
                      : 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                  }`}>
                    {report.senderAssessment.impersonationRisk} RISK
                  </span>
                )}
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Claimed Identity:</span>
                    <div className="text-xs font-semibold text-white bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 truncate">
                      {report.senderAssessment.claimedSender}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Target / Role Type:</span>
                    <div className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 truncate">
                      {report.senderAssessment.impersonationType || 'Unspecified Entity'}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Verification Status:</span>
                  <div className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between">
                    <span>{report.senderAssessment.verificationStatus}</span>
                    <span className="text-[10px] font-sans text-slate-400 font-normal">Unverified cryptographic chain</span>
                  </div>
                </div>

                {report.senderAssessment.deceptiveSignals && report.senderAssessment.deceptiveSignals.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-medium block mb-1.5">Deceptive Cues & Mismatches:</span>
                    <ul className="space-y-1.5">
                      {report.senderAssessment.deceptiveSignals.map((sig, sIdx) => (
                        <li key={sIdx} className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-200 text-xs flex items-start gap-2">
                          <span className="text-rose-400 font-mono mt-0.5">•</span>
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Clear Explanation of Uncertainty Callout */}
                <div className="p-3.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-1 text-slate-300">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono text-[11px]">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>EXPLANATION OF UNCERTAINTY & LIMITATIONS</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.senderAssessment.uncertaintyExplanation || report.senderAssessment.evidence}
                  </p>
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    Technical constraint: {report.senderAssessment.technicalCaveat}
                  </p>
                </div>
              </div>
            </div>

            {/* Requested Action & Impact */}
            <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Requested Action & Attack Progression
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Action Type:</span>
                  <div className="text-xs font-semibold text-white bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                    {report.requestedAction.actionType}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Action Description:</span>
                  <p className="text-slate-300 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                    {report.requestedAction.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Urgency Level</span>
                    <span className="font-mono font-bold text-white uppercase text-xs">
                      {report.requestedAction.urgencyLevel}
                    </span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Primary Vector</span>
                    <span className="font-mono font-bold text-rose-300 text-xs truncate block">
                      {report.threatCategories[0] || 'Phishing'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Potential Harm / Impact:</span>
                  <p className="text-slate-300 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                    {report.potentialImpact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Psychological Manipulation Tactics Section */}
          {report.manipulationTactics && report.manipulationTactics.length > 0 && (
            <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Identified Psychological Manipulation Tactics ({report.manipulationTactics.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.manipulationTactics.map((tactic, tIdx) => (
                  <div key={tIdx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {tactic.tactic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {tactic.explanation}
                    </p>
                    {tactic.evidenceSnippet && (
                      <div className="p-2 rounded bg-black/40 border border-white/[0.06] text-[11px] font-mono text-slate-400 break-words">
                        "{tactic.evidenceSnippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Safety Recommendations */}
          <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Actionable Defense & Safety Recommendations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {report.recommendedActions.map((rec) => (
                <div
                  key={rec.priority}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/30 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {rec.priority}. {rec.action}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Red Flags Forensics */}
      {activeSubTab === 'redflags' && (
        <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Forensic Red Flags Extracted from Text ({report.redFlags.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Grounded Evidence
            </span>
          </div>

          {report.redFlags.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-white/[0.06] rounded-xl bg-white/[0.01]">
              No high-severity deception phrases detected in the submitted content.
            </div>
          ) : (
            <div className="space-y-3.5">
              {report.redFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        flag.severity === 'high' 
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                          : flag.severity === 'medium'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                      }`}>
                        {flag.severity.toUpperCase()} SEVERITY
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Category: {flag.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#07090F] border border-white/[0.08] font-mono text-xs text-amber-300 break-words">
                    "{flag.phrase}"
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Why this is suspicious: </strong>
                    {flag.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Attack Kill Chain */}
      {activeSubTab === 'attackpath' && (
        <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Reconstructed Attack Kill Chain ({report.attackPath.length} Stages)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Observed vs. Hypothetical
            </span>
          </div>

          <AttackPathView stages={report.attackPath} />
        </div>
      )}

      {/* SUB-TAB 4: Limitations & Forensic Caveats */}
      {activeSubTab === 'limitations' && (
        <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Analysis Boundaries & Limitations
            </h3>
          </div>

          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 leading-relaxed">
            VIGILANT AI operates strictly in-memory without initiating outbound network connections to suspicious infrastructure. Below are the verified boundaries of this assessment:
          </div>

          <div className="space-y-2.5">
            {report.limitations.map((lim, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl text-xs text-slate-300 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 text-slate-400 font-mono text-[10px]">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{lim}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Engine: {report.engineUsed}</span>
            <span>Elapsed: {report.analysisTimeMs}ms</span>
          </div>
        </div>
      )}

      {/* Grounded AI Security Copilot Slide-over Drawer */}
      <CopilotPanel
        report={report}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
};
