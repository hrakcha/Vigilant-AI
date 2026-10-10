import React, { useState } from 'react';
import { Send, Bot, User, RefreshCw, X, Sparkles, Shield } from 'lucide-react';
import { ThreatReport, CopilotMessage } from '../types/threat';

interface CopilotPanelProps {
  report: ThreatReport;
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({ report, isOpen, onClose }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello, I am your VIGILANT AI Security Copilot. I have loaded your investigation report for this ${report.riskCategory} risk message (Score: ${report.riskScore}/100). Ask me anything about specific red flags, sender verification, or post-incident response procedures.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'What is the strongest red flag?',
    'Why might this be an impersonation attempt?',
    'What should I verify independently?',
    'What should I do if I already clicked the link or sent money?'
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/copilot-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          question: questionText.trim(),
          conversationHistory: historyPayload
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Copilot query failed');
      }

      const data = await res.json();
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'assistant',
        text: data.answer || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: `Error consulting Copilot: ${err.message || 'Unable to connect to security engine.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#080B12] border-l border-white/[0.1] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0A0E17]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">AI Security Copilot</h3>
            <div className="text-xs text-slate-400 font-mono">
              Grounded in Dossier #{report.id.slice(-6)} · {report.riskCategory} Risk
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Follow-up Prompts */}
      <div className="p-3 bg-white/[0.02] border-b border-white/[0.06] overflow-x-auto">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
          Suggested Forensics Questions:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="text-left text-[11px] px-2.5 py-1 bg-white/[0.03] hover:bg-cyan-500/15 border border-white/[0.08] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-200 rounded-lg transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/[0.05] text-slate-300 border border-white/[0.1]'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-sky-500/20 text-white border border-cyan-500/30 rounded-tr-sm'
                  : 'bg-white/[0.03] text-slate-200 border border-white/[0.08] rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`text-[9px] font-mono mt-1.5 ${
                  msg.sender === 'user' ? 'text-cyan-300/70 text-right' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Consulting intelligence engine...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-white/[0.08] bg-[#0A0E17]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuestion);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask follow-up question regarding this threat..."
            className="flex-1 bg-[#07090F] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
