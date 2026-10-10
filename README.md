# VIGILANT AI
## AI-Powered Threat Intelligence & Human Protection

> **"See the threat before it strikes."**

**Competition:** ForgeHacks  
**Track:** AI + Cybersecurity  
**Platform:** VIGILANT AI  
**Author:** Individual Student Project  

---

## 1. Executive Summary & Problem Statement

Every day, individuals and corporate employees are bombarded by deceptive digital communications: urgent banking security alerts, credential harvesting links, fake remote job offers demanding advance check deposits, courier delivery fee scams, and high-pressure Business Email Compromise (BEC) wire transfer requests.

Simultaneously, the rapid deployment of autonomous AI agents and tool-calling Large Language Models introduces a critical new attack surface: **Indirect Prompt Injection**. Adversaries embed hidden override commands, credential theft directives, and unauthorized tool invocations inside untrusted emails, documents, customer support tickets, and retrieved web snippets.

Existing perimeter filters often produce opaque risk scores without explaining the specific red flags, detailing the attacker's suspected endgame, or providing actionable remediation steps.

**VIGILANT AI** bridges this gap. It turns raw, untrusted communications into an **explainable, evidence-backed security investigation**:
- Deconstructs deceptive tactics and extracts exact offending phrases.
- Evaluates claimed sender identity vs verifiable cryptographic facts.
- Reconstructs the multi-stage attack kill chain (Initial Contact → Psychological Manipulation → Lure/Trap → Post-Exploitation Harm).
- Protects autonomous AI agents with a dedicated **AI Agent Guard** that intercepts prompt injections and recommends `ALLOW`, `REVIEW`, or `BLOCK` actions.
- Guides victims through situational **Incident Response protocols** with tailored step-by-step containment checklists.
- Empowers users with a contextual, zero-trust **AI Security Copilot**.

---

## 2. System Architecture

```
                                  [ User Input / Untrusted Payload ]
                                                 │
                                                 ▼
                         ┌───────────────────────────────────────────────┐
                         │               Express API Gateway             │
                         │    (Validation, Bound Checks, CORS, Limits)   │
                         └───────────────────────┬───────────────────────┘
                                                 │
                                                 ▼
     ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
     │                                                                                       │
     ▼                                                                                       ▼
┌──────────────────────────────────────┐                                   ┌──────────────────────────────────────┐
│       Threat Intelligence Engine     │                                   │          AI Agent Guard              │
│                                      │                                   │                                      │
│  ┌────────────────────────────────┐  │                                   │  ┌────────────────────────────────┐  │
│  │   Deterministic Rule Scanner   │  │                                   │  │  Adversarial Injection Pattern │  │
│  │  - Coercive Urgency & Pressure │  │                                   │  │  - System Prompt Overrides     │  │
│  │  - Payment / Wire Harvesting   │  │                                   │  │  - Secret / API Key Extraction │  │
│  │  - Credential Demands          │  │                                   │  │  - Unauthorized Tool Hijack   │  │
│  │  - Lookalike Brand Detection   │  │                                   │  │  - Contextual Quoted vs Active │  │
│  └────────────────┬───────────────┘  │                                   │  └────────────────┬───────────────┘  │
│                   │                  │                                   │                   │                  │
│                   ▼                  │                                   │                   ▼                  │
│  ┌────────────────────────────────┐  │                                   │  ┌────────────────────────────────┐  │
│  │ Google Gemini 3.8 Flash Neural │  │                                   │  │ Google Gemini 3.8 Flash Neural │  │
│  │   Deep Semantic Investigation  │  │                                   │  │   Agent Payload Evaluator      │  │
│  └────────────────┬───────────────┘  │                                   │  └────────────────┬───────────────┘  │
│                   │                  │                                   │                   │                  │
│                   ▼                  │                                   │                   ▼                  │
│      Blended Evidentiary Report      │                                   │    ALLOW / REVIEW / BLOCK Verdict    │
│    (0-100 Score, Red Flags, Path)    │                                   │    + Simulated Pipeline Intercept    │
└───────────────────┬──────────────────┘                                   └───────────────────┬──────────────────┘
                    │                                                                          │
                    └───────────────────────────────────┬──────────────────────────────────────┘
                                                        │
                                                        ▼
                                   ┌──────────────────────────────────────────┐
                                   │      Interactive Client Frontend         │
                                   │  - Threat Analyzer & 7 Synthetic Demos   │
                                   │  - Explainable Investigation Reports     │
                                   │  - Kill Chain Timeline Visualization     │
                                   │  - Grounded AI Security Copilot          │
                                   │  - Incident Response Containment Wizard  │
                                   │  - Safe Offline Syntactic URL Inspector  │
                                   │  - Zero-Trust Local Client Case History  │
                                   └──────────────────────────────────────────┘
```

---

## 3. Core Features

### A. Multi-Threat Message Analysis
- Accepts untrusted content from SMS, emails, recruitment letters, shipping alerts, support chats, and financial notices.
- Analyzes phishing, advance-fee fraud, executive impersonation (BEC), credential harvesting, payment diversion, and coercive urgency.
- Sanitizes input with strict length bounds (up to 12,000 characters).

### B. Explainable Threat Intelligence Report
- **Risk Score (0–100):** Synthesized from direct red flags and semantic manipulation severity.
- **Risk Category:** `LOW`, `MODERATE`, `HIGH`, or `CRITICAL`.
- **Claimed Sender Assessment:** Distinguishes display name assertions from unverified cryptographic facts.
- **Direct Red Flag Extraction:** Exact quotes isolated from the submitted text with clear explanatory rationale.
- **Action & Impact Analysis:** Explicitly identifies what the attacker wants (click link, send wire, disclose password) and the potential consequence.
- **Export Capabilities:** Download comprehensive Markdown reports or structured JSON logs with one click.

### C. AI Agent Security & Prompt-Injection Inspector
- Inspects untrusted documents, emails, and web data before injection into autonomous agent context.
- Detects system prompt overrides, credential exfiltration commands, tool hijacking (`bash`, `rm -rf`, `sql`), and disguised payloads.
- **Context Awareness:** Differentiates harmless academic or educational discussion of attacks from active exploitation.
- **Simulated Agent Workflow Intercept:** Demonstrates how a zero-trust gateway blocks malicious tool invocation (`execute_tool()`) and requires human signoff.

### D. Attack Path Reconstruction (Kill Chain)
- Reconstructs a 4-phase sequence: Initial Contact → Trust Manipulation → Exploitation Hook → Post-Exploitation Harm.
- Explicitly labels each node as **Directly Observed in Input** or **Hypothetical Next Stage**.
- Assigns uncertainty ratings: `CONFIRMED`, `PROBABLE`, `PLAUSIBLE`, or `SPECULATIVE`.

### E. Grounded AI Security Copilot
- Contextual assistant dedicated to answering follow-up questions regarding the active investigation report.
- Grounded strictly in supplied evidence; never executes malicious commands or invents phantom facts.
- Includes instant one-click prompts: *"What is the strongest red flag?"*, *"Why might this be an impersonation attempt?"*, *"What should I do if I already clicked or sent money?"*.

### F. Incident Response Assistant
- Prioritized remediation wizard tailored to 5 user situations:
  1. **Pre-Interaction:** Preventative containment & out-of-band verification.
  2. **Clicked Link Only:** Cache clearance & endpoint scanning.
  3. **Entered Credentials / MFA:** Direct password invalidation, session revocation & FIDO2 upgrade.
  4. **Transferred Funds / Deposited Check:** Emergency bank wire recall & FBI IC3 filing.
  5. **Opened File / Download:** Network quarantine without rebooting for forensic triage.
- Interactive checkboxes and downloadable markdown response action plans.

### G. Synthetic Demonstration Center
Pre-loaded with 7 standardized synthetic scenarios:
1. **Bank Security Alert Phishing:** Coercive login link claiming account suspension within 15 minutes.
2. **Remote Executive Recruitment Scam:** Advance fee equipment check scam requiring wire transfer.
3. **USPS Delivery Fee Smishing:** Fake $1.95 redelivery fee harvesting credit cards.
4. **Executive Impersonation (BEC):** Urgent confidential acquisition buyout bypassing standard PO approval.
5. **Malicious Agent Prompt Injection:** HTML-commented system override exfiltrating memory buffer to external webhook.
6. **Benign Team Calendar Meeting:** Routine internal engineering sprint planning invite.
7. **Ambiguous Vendor Invoice Update:** Vendor address relocation requiring out-of-band confirmation.

### H. Safe Syntactic URL Inspector
- Offline structural inspection of links without opening network connections.
- Detects raw IP address hosts, lookalike brand spoofing (e.g. `chase-security-verify.com`), disposable TLDs (`.xyz`, `.top`), URL shorteners, and embedded userinfo authentication credentials.

---

## 4. Real AI Implementation & Dual-Layer Defense

VIGILANT AI integrates Google Gemini (`gemini-3.8-flash`) via the official `@google/genai` TypeScript SDK on the server backend.

### Key Implementation Details:
- **Server-Only API Access:** The `GEMINI_API_KEY` is kept strictly within the server environment. It is never exposed in client bundles, browser HTML, or network inspect panels.
- **Structured Schema Enforced:** Requests utilize JSON schema declarations ensuring predictable, typed object returns.
- **Fail-Safe Timeout & Deterministic Fallback:** In the event of network disruption, rate limiting, or absent API keys, the platform seamlessly engages its built-in rule scanner, clearly labeling the report as a transparent fallback.

---

## 5. Automated Testing & Verification Results

The test suite evaluates actual behavior across 15 automated test cases:

```bash
$ npm test
```

### Actual Test Run Results:
```
✓ src/tests/threatEngine.test.ts (15 tests) [Duration: 4.15s]
  ✓ correctly classifies a benign routine message with low risk score
  ✓ detects high-severity red flags and assigns CRITICAL/HIGH risk to phishing messages
  ✓ flags executive impersonation, wire transfer demands, and secrecy coercion
  ✓ handles ambiguous vendor notice without hyper-inflating false-positive risk
  ✓ throws an error when empty or whitespace-only input is provided
  ✓ rejects oversized inputs exceeding the 12,000 character limit
  ✓ detects active jailbreak, system overrides, and assigns BLOCK verdict
  ✓ distinguishes educational and quoted injection examples from active attacks
  ✓ identifies unauthorized tool and shell execution attempts
  ✓ flags raw IP address host and brand typosquatting
  ✓ flags lookalike brand spoofing within unofficial domain hierarchy
  ✓ handles invalid URL string gracefully without crashing
  ✓ answers follow-up questions grounded in threat report without fabricating facts
  ✓ provides prioritized incident response when user asks what if they already clicked
  ✓ async copilot query function responds or falls back within safe limits

Test Files  1 passed (1)
     Tests  15 passed (15)
```

---

## 6. Installation & Launch Instructions

### Prerequisites
- Node.js 20+
- npm 10+

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/example/vigilant-ai.git
cd vigilant-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for live Gemini)
cp .env.example .env
# Set GEMINI_API_KEY in .env if testing external AI connection
# (Built-in deterministic intelligence functions fully without external keys)

# 4. Run automated test suite
npm test

# 5. Launch full-stack application (runs on http://localhost:3000)
npm run dev
```

---

## 7. Example API Contracts

### `POST /api/analyze-threat`
**Request:**
```json
{
  "text": "[CHASE ALERT] Unauthorized login attempt detected from Moscow. Verify within 15 minutes: https://chase-security-verify-session819.com/auth",
  "sourceType": "SMS / Text Message"
}
```

**Response (Summary):**
```json
{
  "id": "threat-1742084920194",
  "riskScore": 88,
  "riskCategory": "CRITICAL",
  "summary": "High-urgency credential harvesting attack impersonating Chase Bank.",
  "threatCategories": ["Phishing", "Credential Theft", "Social Engineering"],
  "redFlags": [
    {
      "phrase": "within 15 minutes",
      "reason": "Artificial urgency designed to bypass analytical scrutiny and induce panic.",
      "severity": "high",
      "category": "Social Engineering / Coercive Urgency"
    },
    {
      "phrase": "https://chase-security-verify-session819.com/auth",
      "reason": "Domain contains brand identifier \"chase\" within an unofficial domain hierarchy",
      "severity": "critical",
      "category": "Suspicious Domain / Phishing Link"
    }
  ],
  "senderAssessment": {
    "claimedSender": "Chase Bank (Claimed)",
    "verificationStatus": "SUSPECTED_SPOOF",
    "evidence": "Sender identity is asserted solely in text without cryptographic proof."
  },
  "confidenceScore": 92
}
```

---

## Future Improvements

- Improve threat detection accuracy through testing against larger, labeled datasets.
- Expand support for different message formats and emerging cyber threats.
- Enhance prompt-injection detection and validation of AI agent security controls.
- Improve incident response recommendations and threat explanations.
- Evaluate false-positive and false-negative rates across diverse scenarios.

## Conclusion

VIGILANT AI combines explainable threat analysis, cybersecurity awareness, and AI agent security demonstrations in one platform. By highlighting suspicious evidence, communicating risk levels, and providing actionable guidance, it aims to help users recognize potential threats and make safer decisions.

## Author

**Rakcha H**

Built as an individual project for ForgeHacks 2026.
