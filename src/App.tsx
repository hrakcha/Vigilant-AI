import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandCenterOverview } from './components/CommandCenterOverview';
import { ThreatAnalyzerTab } from './components/ThreatAnalyzerTab';
import { ReportView } from './components/ReportView';
import { AgentSecurityTab } from './components/AgentSecurityTab';
import { AttackPathTab } from './components/AttackPathTab';
import { IncidentResponseTab } from './components/IncidentResponseTab';
import { CaseHistoryTab } from './components/CaseHistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { UrlInspectorModal } from './components/UrlInspectorModal';
import { ThreatReport } from './types/threat';
import { DEMO_CASES } from './data/demoCases';
import { Shield, Lock } from 'lucide-react';

const STORAGE_KEY = 'vigilant_threat_cases_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentReport, setCurrentReport] = useState<ThreatReport | null>(null);
  const [history, setHistory] = useState<ThreatReport[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const [agentPayload, setAgentPayload] = useState<string>('');

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to read case history from localStorage', err);
    }
  }, []);

  const saveReportToHistory = (report: ThreatReport) => {
    setHistory((prev) => {
      const updated = [report, ...prev.filter(r => r.id !== report.id)].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }
      return updated;
    });
  };

  const handleAnalysisComplete = (report: ThreatReport) => {
    setCurrentReport(report);
    saveReportToHistory(report);
    setActiveTab('analyzer');
  };

  const handleNewAnalysis = () => {
    setCurrentReport(null);
    setActiveTab('analyzer');
  };

  const handleSelectHistoryReport = (report: ThreatReport) => {
    setCurrentReport(report);
    setActiveTab('analyzer');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear localStorage', err);
    }
  };

  // Launch a demo case directly into the analyzer
  const handleLaunchDemo = (demoId: string) => {
    const demo = DEMO_CASES.find(d => d.id === demoId);
    if (!demo) return;

    if (demo.targetType === 'agent') {
      setAgentPayload(demo.sampleText);
      setActiveTab('agent-security');
      return;
    }

    // Switch to analyzer and analyze demo text
    setActiveTab('analyzer');
    fetch('/api/analyze-threat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: demo.sampleText,
        sourceType: demo.sourceType
      })
    })
      .then(res => res.json())
      .then(report => {
        if (report.id) {
          handleAnalysisComplete(report);
        }
      })
      .catch(err => {
        console.error('Demo launch error:', err);
      });
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-[#F1F5F9] flex antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentReport={currentReport}
        onNewAnalysis={handleNewAnalysis}
        onOpenUrlInspector={() => setUrlModalOpen(true)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Compact Top Bar */}
        <TopBar
          activeTab={activeTab}
          onNewAnalysis={handleNewAnalysis}
          onOpenUrlInspector={() => setUrlModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Central Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <CommandCenterOverview
              history={history}
              onSelectReport={handleSelectHistoryReport}
              onLaunchDemo={handleLaunchDemo}
              onNavigateToAnalyzer={() => {
                setCurrentReport(null);
                setActiveTab('analyzer');
              }}
              onNavigateToAgentSecurity={() => setActiveTab('agent-security')}
            />
          )}

          {activeTab === 'analyzer' && (
            currentReport ? (
              <ReportView
                report={currentReport}
                onNewAnalysis={handleNewAnalysis}
                onNavigateToIncidentResponse={() => setActiveTab('incident-response')}
              />
            ) : (
              <ThreatAnalyzerTab
                onAnalysisComplete={handleAnalysisComplete}
                onSwitchToAgentSecurity={() => setActiveTab('agent-security')}
              />
            )
          )}

          {activeTab === 'agent-security' && (
            <AgentSecurityTab initialPayload={agentPayload} />
          )}

          {activeTab === 'attack-path' && (
            <AttackPathTab
              currentReport={currentReport}
              history={history}
              onSelectReport={handleSelectHistoryReport}
              onLaunchDemo={handleLaunchDemo}
            />
          )}

          {activeTab === 'incident-response' && (
            <IncidentResponseTab currentReport={currentReport} />
          )}

          {activeTab === 'history' && (
            <CaseHistoryTab
              history={history}
              onSelectReport={handleSelectHistoryReport}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </main>

        {/* Enterprise Subtle SOC Footer */}
        <footer className="border-t border-white/[0.06] bg-[#070A10] py-4 px-6 text-xs text-slate-400 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold tracking-tight text-white">VIGILANT AI</span>
              <span className="text-slate-500">—</span>
              <span className="text-slate-400 font-sans text-xs">AI Threat Intelligence & Human Protection</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Zero-Trust Processing</span>
              <span aria-hidden="true">·</span>
              <span>In-Memory Evaluation</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-semibold">Gemini Intelligence Ready</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Safe Offline URL Inspector Modal */}
      <UrlInspectorModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
      />
    </div>
  );
}
