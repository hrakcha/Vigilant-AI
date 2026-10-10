import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckSquare, 
  Square, 
  AlertOctagon, 
  KeyRound, 
  DollarSign, 
  FileWarning, 
  Download,
  LifeBuoy,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

type IncidentScenario = 
  | 'before'
  | 'clicked-link'
  | 'shared-credentials'
  | 'transferred-funds'
  | 'opened-file';

import { ThreatReport } from '../types/threat';

interface IncidentStep {
  id: string;
  phase: string;
  action: string;
  details: string;
  urgency: 'immediate' | 'urgent' | 'standard';
}

interface IncidentResponseTabProps {
  currentReport?: ThreatReport | null;
}

export const IncidentResponseTab: React.FC<IncidentResponseTabProps> = ({ currentReport }) => {
  const [selectedScenario, setSelectedScenario] = useState<IncidentScenario>('before');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (currentReport) {
      if (currentReport.requestedAction.targetsMoney) {
        setSelectedScenario('transferred-funds');
      } else if (currentReport.requestedAction.targetsCredentials) {
        setSelectedScenario('shared-credentials');
      } else if (currentReport.threatCategories.some(c => c.toLowerCase().includes('link') || c.toLowerCase().includes('phishing'))) {
        setSelectedScenario('clicked-link');
      }
    }
  }, [currentReport]);

  const scenarios = [
    {
      id: 'before' as IncidentScenario,
      title: 'Pre-Interaction (Preventative)',
      icon: <AlertOctagon className="w-4 h-4 text-emerald-400" />,
      description: 'I received a suspicious message but have not clicked links, responded, or sent money.'
    },
    {
      id: 'clicked-link' as IncidentScenario,
      title: 'Clicked Link Only',
      icon: <FileWarning className="w-4 h-4 text-amber-400" />,
      description: 'I clicked the suspicious URL in browser but did not submit passwords or credit card info.'
    },
    {
      id: 'shared-credentials' as IncidentScenario,
      title: 'Entered Credentials / MFA',
      icon: <KeyRound className="w-4 h-4 text-rose-400" />,
      description: 'I submitted my username, password, social security number, or two-factor code.'
    },
    {
      id: 'transferred-funds' as IncidentScenario,
      title: 'Transferred Funds / Check',
      icon: <DollarSign className="w-4 h-4 text-rose-400" />,
      description: 'I wired money, authorized a Zelle/Crypto transfer, or deposited a fraudulent check.'
    },
    {
      id: 'opened-file' as IncidentScenario,
      title: 'Opened Attachment / File',
      icon: <AlertOctagon className="w-4 h-4 text-amber-400" />,
      description: 'I opened an email attachment (.zip, .exe, .docm) or installed suggested software.'
    }
  ];

  const scenarioPlans: Record<IncidentScenario, IncidentStep[]> = {
    before: [
      {
        id: 'b-1',
        phase: 'Step 1: Immediate Containment',
        action: 'Do not click links or open attachments',
        details: 'Leave the email or SMS in place. Avoid forwarding to unmonitored personal mailboxes.',
        urgency: 'immediate'
      },
      {
        id: 'b-2',
        phase: 'Step 2: Out-of-Band Sender Verification',
        action: 'Contact the alleged sender via verified channels',
        details: 'Look up the official phone number from a billing statement, card back, or known directory. Do NOT use numbers listed in the message.',
        urgency: 'urgent'
      },
      {
        id: 'b-3',
        phase: 'Step 3: Organizational Reporting',
        action: 'Forward message to your SOC or IT Security team',
        details: 'Report to your internal security mailbox (e.g. security@company.com) or forward SMS to 7726 (SPAM) to enable global threat blocking.',
        urgency: 'standard'
      }
    ],
    'clicked-link': [
      {
        id: 'cl-1',
        phase: 'Step 1: Browser Session Termination',
        action: 'Close browser tab and clear recent cache/cookies',
        details: 'Prevent any tracking session tokens or session hijacks by closing the window and clearing cookies for the suspicious domain.',
        urgency: 'immediate'
      },
      {
        id: 'cl-2',
        phase: 'Step 2: Network & Endpoint Scan',
        action: 'Run an updated endpoint antivirus / EDR scan',
        details: 'Perform a full scan for drive-by downloads or payload drops triggered upon page navigation.',
        urgency: 'urgent'
      },
      {
        id: 'cl-3',
        phase: 'Step 3: Monitor Active Sessions',
        action: 'Audit active web session tokens & login activity',
        details: 'Check if current browser session tokens were compromised or exfiltrated.',
        urgency: 'standard'
      }
    ],
    'shared-credentials': [
      {
        id: 'sc-1',
        phase: 'Step 1: Emergency Credential Reset',
        action: 'Immediately reset password on the legitimate service',
        details: 'Navigate to the real website directly and reset your password immediately. If the same password was used elsewhere, change those too.',
        urgency: 'immediate'
      },
      {
        id: 'sc-2',
        phase: 'Step 2: Terminate All Active Sessions',
        action: 'Force "Log out of all devices / Revoke all sessions"',
        details: 'Invalidate any active stolen authentication tokens that the adversary may have acquired.',
        urgency: 'immediate'
      },
      {
        id: 'sc-3',
        phase: 'Step 3: Reconfigure Multi-Factor Authentication',
        action: 'Regenerate MFA seed or switch to FIDO2 / Passkey',
        details: 'Adversaries who captured SMS OTP codes may attempt SIM swapping or token replay.',
        urgency: 'urgent'
      },
      {
        id: 'sc-4',
        phase: 'Step 4: Notify Fraud Department',
        action: 'Alert the account provider of suspected credential harvesting',
        details: 'Have security place temporary holds or heightened transaction monitoring on the account.',
        urgency: 'standard'
      }
    ],
    'transferred-funds': [
      {
        id: 'tf-1',
        phase: 'Step 1: Emergency Bank Fraud Hotline',
        action: 'Call your bank or financial institution immediately',
        details: 'Contact the 24/7 fraud department. Wire transfers and ACH can sometimes be recalled if flagged within the golden window (0–24 hours).',
        urgency: 'immediate'
      },
      {
        id: 'tf-2',
        phase: 'Step 2: Request Wire Recall or Fraud Freeze',
        action: 'Request an immediate transaction stop and fraud report number',
        details: 'Document the exact timestamp, transaction reference ID, and receiving routing/account numbers.',
        urgency: 'immediate'
      },
      {
        id: 'tf-3',
        phase: 'Step 3: Regulatory & Law Enforcement Reporting',
        action: 'File an IC3 complaint (FBI Internet Crime Complaint Center)',
        details: 'Submit an online report at ic3.gov with full transaction documentation for federal recovery assistance.',
        urgency: 'urgent'
      }
    ],
    'opened-file': [
      {
        id: 'of-1',
        phase: 'Step 1: Network Isolation',
        action: 'Disconnect device from Wi-Fi and Ethernet immediately',
        details: 'Sever network connectivity to halt command-and-control communication, lateral movement, or data exfiltration.',
        urgency: 'immediate'
      },
      {
        id: 'of-2',
        phase: 'Step 2: Do Not Power Off',
        action: 'Keep computer running but isolated for forensic volatile memory dump',
        details: 'Shutting down destroys volatile RAM artifacts (running processes, encryption keys, injected memory threads).',
        urgency: 'urgent'
      },
      {
        id: 'of-3',
        phase: 'Step 3: Escalate to Security Incident Response',
        action: 'Engage IT Security / Forensics Team from a separate clean device',
        details: 'Provide the file name, source email, and timestamp so threat hunters can analyze the binary in an isolated sandbox.',
        urgency: 'standard'
      }
    ]
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const currentSteps = scenarioPlans[selectedScenario];
  const completedCount = currentSteps.filter(s => completedSteps[s.id]).length;
  const progressPct = Math.round((completedCount / currentSteps.length) * 100);

  const handleDownloadPlan = () => {
    const text = `# VIGILANT AI Incident Containment Playbook
Scenario: ${scenarios.find(s => s.id === selectedScenario)?.title}
Generated: ${new Date().toISOString()}

Checklist (${completedCount}/${currentSteps.length} Completed):
${currentSteps.map(s => `[${completedSteps[s.id] ? 'X' : ' '}] ${s.phase}: ${s.action}\n    ${s.details}`).join('\n\n')}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-playbook-${selectedScenario}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">IMMEDIATE (0-15M)</span>;
      case 'urgent':
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">URGENT (1-2H)</span>;
      default:
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Incident Response & Containment Playbooks
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Step-by-step emergency playbooks tailored to your exact level of interaction. Follow these containment protocols to minimize financial, identity, and system exposure.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Select Your Current Situation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {sc.icon}
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight mb-1">
                    {sc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Plan & Interactive Checklist */}
      <div className="cyber-card rounded-2xl p-6 border border-white/[0.08] space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Playbook: {scenarios.find(s => s.id === selectedScenario)?.title}
              </h3>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {completedCount} of {currentSteps.length} Steps Completed ({progressPct}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-64 bg-white/[0.05] rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleDownloadPlan}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Action Checklist</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3.5">
          {currentSteps.map((step) => {
            const isDone = completedSteps[step.id];
            return (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 shrink-0 text-slate-400 hover:text-white"
                  aria-label={isDone ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-500">
                        {step.phase}
                      </span>
                      <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {step.action}
                      </h4>
                    </div>
                    {getUrgencyBadge(step.urgency)}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
