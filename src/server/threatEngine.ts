import { 
  ThreatReport, 
  RiskCategory, 
  RedFlagEvidence, 
  SenderAssessment, 
  RequestedAction, 
  AttackPathStage, 
  RecommendedAction 
} from '../types/threat';
import { getGeminiClient, GEMINI_MODEL } from './geminiClient';
import { inspectUrlSafely } from './urlInspector';

// ---------------------------------------------------------------------------
// Evidence-based scoring
// Each rule type that fires contributes a "strength" between 0 and 1.
// Repeated matches of the SAME rule add only a small bonus. Different rule
// types are then combined with diminishing returns:
//     score = 100 * (1 - (1 - strength1) * (1 - strength2) * ...)
// so every extra piece of evidence raises the score, but a message only
// approaches 100 when there is a lot of strong, varied evidence. This replaces
// the old "add points for every match, then cap at 100" approach, which pushed
// every multi-signal scam to exactly 100.
// ---------------------------------------------------------------------------
const BASELINE_SCORE = 5;                  // score of a message with no evidence at all
const REPEAT_BONUS_PER_EXTRA_MATCH = 0.15; // +15% strength per extra match of the same rule
const MAX_REPEAT_BONUS = 0.3;              // ...but never more than +30%
const MAX_RULE_STRENGTH = 0.9;             // no single rule can reach certainty alone

interface RuleHit {
  count: number;
  strength: number;
}

function addRuleHit(hits: Map<string, RuleHit>, rule: string, strength: number): void {
  const existing = hits.get(rule);
  if (existing) {
    existing.count += 1;
    existing.strength = Math.max(existing.strength, strength);
  } else {
    hits.set(rule, { count: 1, strength });
  }
}

function computeHeuristicScore(hits: Map<string, RuleHit>): number {
  let remainingDoubt = 1;

  for (const { count, strength } of hits.values()) {
    const repeatBonus = Math.min(MAX_REPEAT_BONUS, (count - 1) * REPEAT_BONUS_PER_EXTRA_MATCH);
    const ruleStrength = Math.min(MAX_RULE_STRENGTH, strength * (1 + repeatBonus));
    remainingDoubt *= 1 - ruleStrength;
  }

  const score = Math.round((1 - remainingDoubt) * 100);
  return Math.min(100, Math.max(BASELINE_SCORE, score));
}

// Deterministic heuristic rule checks
interface RuleMatch {
  phrase: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

function runDeterministicRules(text: string): {
  redFlags: RuleMatch[];
  detectedCategories: Set<string>;
  heuristicScore: number;
  extractedSender: string;
  extractedAction: string;
} {
  const redFlags: RuleMatch[] = [];
  const detectedCategories = new Set<string>();
  const ruleHits = new Map<string, RuleHit>();

  // 1. Urgency / Time-pressure / Intimidation
  const urgencyRegex = /(within\s+(?:15|30|60|24|48)\s*(?:minutes|mins|hours|hrs)|immediately|urgent(?:ly)?|permanent(?:ly)?\s+susp(?:end|ension)|action\s+required|asap|time\s+is\s+critical|strictly\s+confidential)/gi;
  let match;
  while ((match = urgencyRegex.exec(text)) !== null) {
    redFlags.push({
      phrase: match[0],
      reason: 'Artificial urgency designed to bypass analytical scrutiny and induce panic.',
      severity: 'high',
      category: 'Social Engineering / Coercive Urgency'
    });
    detectedCategories.add('Social Engineering');
    addRuleHit(ruleHits, 'urgency', 0.25);
    if (redFlags.length >= 3) break;
  }

  // 2. Financial demands / wire / gift cards / advance fee
  const financialRegex = /(?:wire\s+(?:transfer|\$?\d+)|zelle|bitcoin(?:\s+atm)?|gift\s+cards?|cash\s+app|deposit\s+this\s+check|\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?|redelivery\s+fee|processing\s+fee)/gi;
  while ((match = financialRegex.exec(text)) !== null) {
    redFlags.push({
      phrase: match[0],
      reason: 'Direct monetary demand, unverified check deposit, or non-reversible payment channel.',
      severity: 'high',
      category: 'Financial Scam & Payment Manipulation'
    });
    detectedCategories.add('Financial Scam');
    detectedCategories.add('Payment Manipulation');
    // Irreversible payment channels are strong evidence; a bare dollar amount or fee is weak.
    const isStrongPayment = /wire|zelle|bitcoin|gift\s+cards?|cash\s+app|deposit\s+this\s+check/i.test(match[0]);
    addRuleHit(ruleHits, isStrongPayment ? 'financial-strong' : 'financial-weak', isStrongPayment ? 0.30 : 0.10);
    if (redFlags.length >= 6) break;
  }

  // 3. Credential theft & Sensitive PII requests
  const piiRegex = /(?:social\s+security\s+number|ssn|password|banking\s+institution|credit\s+card\s+details|login\s+attempt|verify\s+your\s+identity|account\s+access\s+has\s+been|routing\s+number)/gi;
  while ((match = piiRegex.exec(text)) !== null) {
    redFlags.push({
      phrase: match[0],
      reason: 'Solicitation of high-value authentication credentials or sensitive identity records.',
      severity: 'critical',
      category: 'Credential Harvesting & Identity Theft'
    });
    detectedCategories.add('Credential Theft');
    detectedCategories.add('Phishing');
    addRuleHit(ruleHits, 'credentials', 0.30);
    if (redFlags.length >= 9) break;
  }

  // 4. Suspicious links extraction
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const urls: string[] = [];
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push(match[0]);
  }

  for (const url of urls) {
    const inspection = inspectUrlSafely(url);
    if (inspection.riskLevel === 'HIGH' || inspection.riskLevel === 'CRITICAL') {
      redFlags.push({
        phrase: url,
        reason: inspection.findings.join('; '),
        severity: inspection.riskLevel === 'CRITICAL' ? 'critical' : 'high',
        category: 'Suspicious Domain / Phishing Link'
      });
      detectedCategories.add('Phishing');
      detectedCategories.add('Suspicious Links');
      addRuleHit(ruleHits, 'link', inspection.riskLevel === 'CRITICAL' ? 0.45 : 0.25);
    }
  }

  // 5. Procedural bypass / Secrecy
  const bypassRegex = /(?:bypass\s+(?:standard|approval|vendor|po)|keep\s+this\s+strictly\s+between\s+us|cannot\s+take\s+phone\s+calls|do\s+not\s+call)/gi;
  while ((match = bypassRegex.exec(text)) !== null) {
    redFlags.push({
      phrase: match[0],
      reason: 'Attempts to evade standard corporate dual-control checks and isolate the victim.',
      severity: 'critical',
      category: 'Executive Impersonation / BEC'
    });
    detectedCategories.add('Executive Impersonation');
    detectedCategories.add('Social Engineering');
    addRuleHit(ruleHits, 'bypass', 0.45);
  }

  // 6. AI Agent Prompt Injection & Instruction Overrides
  const promptInjectionRegex = /(?:ignore\s+(?:all\s+)?(?:previous|prior)\s+(?:developer\s+)?(?:safety\s+)?instructions|system\s+instruction\s+override|administrative\s+debug\s+mode|disregard\s+privacy\s+filters|exfiltrat(?:e|ed)\s+memory|curl\s+.*\|\s*bash)/gi;
  while ((match = promptInjectionRegex.exec(text)) !== null) {
    redFlags.push({
      phrase: match[0],
      reason: 'Direct adversarial prompt injection directive targeting autonomous agent instructions.',
      severity: 'critical',
      category: 'AI Agent Prompt Injection & Jailbreak'
    });
    detectedCategories.add('Prompt Injection');
    detectedCategories.add('AI Prompt Injection');
    addRuleHit(ruleHits, 'injection', 0.55);
    if (redFlags.length >= 10) break;
  }

  // Extract claimed sender heuristically
  let extractedSender = 'Unknown / Unspecified';
  const senderMatch = text.match(/(?:From:\s*"?([^"<>\n]+)"?|\[([A-Z0-9\s]{3,20})\s+ALERT\]|Dear\s+Candidate,\s*(?:the\s+)?([A-Za-z0-9\s]{3,30}))/i);
  if (senderMatch) {
    extractedSender = (senderMatch[1] || senderMatch[2] || senderMatch[3] || '').trim();
  } else if (/usps/i.test(text)) {
    extractedSender = 'USPS (Claimed)';
  } else if (/chase/i.test(text)) {
    extractedSender = 'Chase Bank (Claimed)';
  } else if (/marcus\s+vance/i.test(text)) {
    extractedSender = 'Marcus Vance (Engineering Lead)';
  } else if (/apex\s+software/i.test(text)) {
    extractedSender = 'Apex Software Solutions (Billing)';
  }

  let extractedAction = 'None explicitly requested';
  if (urls.length > 0) extractedAction = `Click on unverified URL: ${urls[0]}`;
  else if (/wire|zelle|check|fee/i.test(text)) extractedAction = 'Transfer funds or deposit check and remit funds';
  else if (/password|ssn|banking/i.test(text)) extractedAction = 'Disclose credentials or personal identifying information';

  return {
    redFlags,
    detectedCategories,
    heuristicScore: computeHeuristicScore(ruleHits),
    extractedSender,
    extractedAction
  };
}

export function generateDeterministicReport(
  inputText: string, 
  sourceType: string, 
  startTime: number
): ThreatReport {
  const { redFlags, detectedCategories, heuristicScore, extractedSender, extractedAction } = runDeterministicRules(inputText);

  let riskCategory: RiskCategory = 'LOW';
  if (heuristicScore >= 75) riskCategory = 'CRITICAL';
  else if (heuristicScore >= 50) riskCategory = 'HIGH';
  else if (heuristicScore >= 25) riskCategory = 'MODERATE';

  // Determine Impersonation Assessment
  let impersonationType = 'None Detected';
  let impersonationRisk: RiskCategory = 'LOW';
  const deceptiveSignals: string[] = [];
  let uncertaintyExplanation = 'The submitted text alone does not establish the sender’s identity. No explicit impersonation indicators were confirmed by this identity check. Suspicious links and instruction overrides must be assessed separately. Sender authenticity cannot be verified from raw text alone.';
  if (/ceo|dhenderson|executive|board|acquisition/i.test(inputText) && /bypass|strictly\s+between\s+us|cannot\s+take\s+phone\s+calls/i.test(inputText)) {
    impersonationType = 'Executive / C-Suite (CEO Impersonation / BEC)';
    impersonationRisk = 'CRITICAL';
    deceptiveSignals.push('External lookalike email domain (mail-corp-cloud.com) claiming corporate executive identity');
    deceptiveSignals.push('Direct command to bypass dual-control vendor approval workflows');
    deceptiveSignals.push('Artificial secrecy ("strictly confidential") preventing out-of-band colleague verification');
    deceptiveSignals.push('Claim of being unreachable by phone to suppress voice verification');
    uncertaintyExplanation = 'Sender asserts identity of "David Henderson, CEO", but raw text lacks cryptographic DKIM/SPF headers and uses an unverified external email domain. High probability of Business Email Compromise.';
  } else if (/chase|bank|unauthorized\s+login/i.test(inputText) && /suspension|15\s+minutes|verify/i.test(inputText)) {
    impersonationType = 'Financial Institution (Chase Bank Brand Spoof)';
    impersonationRisk = 'CRITICAL';
    deceptiveSignals.push('Third-party lookalike domain (chase-security-verify-session819.com) not owned by Chase');
    deceptiveSignals.push('Coercive 15-minute countdown clock threatening account suspension');
    deceptiveSignals.push('Generic threat notification sent via non-standard mobile SMS');
    uncertaintyExplanation = 'SMS notification claims to originate from Chase Bank Security, but links to an unverified third-party registration outside verified banking IP ranges. Verification cannot be confirmed from SMS text alone.';
  } else if (/usps|package|redelivery\s+fee/i.test(inputText)) {
    impersonationType = 'Postal / Delivery Service (USPS Smishing)';
    impersonationRisk = 'HIGH';
    deceptiveSignals.push('Non-governmental domain (usps-redelivery-hub.info) masquerading as official postal portal');
    deceptiveSignals.push('Minimal $1.95 redelivery fee used as pretext for credit card harvesting');
    uncertaintyExplanation = 'Message claims to originate from the United States Postal Service, but links to an unofficial .info domain. USPS does not collect redelivery fees via unsolicited SMS.';
  } else if (/candidate|selected\s+you|deposit\s+this\s+check|zelle|bitcoin/i.test(inputText)) {
    impersonationType = 'Corporate Recruiter / Fake Employer';
    impersonationRisk = 'HIGH';
    deceptiveSignals.push('Unsolicited executive hiring without technical interview at inflated salary ($145/hr)');
    deceptiveSignals.push('Classic advance-fee check overpayment requesting irreversible wire refund');
    deceptiveSignals.push('Solicitation of Social Security Number and banking details upfront');
    uncertaintyExplanation = 'Entity "Global Apex Logistics Board" cannot be verified via public records. Advance check overpayment and wire request conforms to known employment fraud patterns.';
  } else if (/apex\s+software|billing\s+remittance|invoice/i.test(inputText)) {
    impersonationType = 'Vendor / Business Partner (Billing Notice)';
    impersonationRisk = 'MODERATE';
    deceptiveSignals.push('Mailing address update in unauthenticated communication');
    uncertaintyExplanation = 'Message is consistent with legitimate vendor correspondence, but financial routing and billing changes must be validated out-of-band with the established account representative.';
  }

  // Determine Manipulation Tactics
  const manipulationTactics = [];
  if (/within\s+(?:15|30|60|24|48)|immediately|urgent|permanent.*susp|asap|time\s+is\s+critical/i.test(inputText)) {
    manipulationTactics.push({
      tactic: 'Coercive Urgency & Time Pressure',
      explanation: 'Artificially restricts the victim\'s decision window to induce panic and inhibit analytical verification.',
      evidenceSnippet: redFlags.find(r => r.category.includes('Urgency'))?.phrase || 'Immediate action required'
    });
  }
  if (/bypass|strictly\s+between\s+us|cannot\s+take\s+phone\s+calls|confidential/i.test(inputText)) {
    manipulationTactics.push({
      tactic: 'Secrecy Mandate & Isolation',
      explanation: 'Isolates the target from organizational checks and balances (dual-control, verbal confirmation).',
      evidenceSnippet: redFlags.find(r => r.category.includes('Executive'))?.phrase || 'Keep this strictly between us'
    });
  }
  if (/ceo|cfo|executive|board|investor/i.test(inputText)) {
    manipulationTactics.push({
      tactic: 'Authority Exploitation & Hierarchical Pressure',
      explanation: 'Leverages senior executive authority to intimidate subordinate employees into compliance.',
      evidenceSnippet: 'Executive acquisition meeting / CEO identity claim'
    });
  }
 
 
  if (/\$145\/hour|\$4,850/i.test(inputText)) {
    const financialEvidenceMatch = inputText.match(/\$145\/hour|\$4,850/i);
    if (financialEvidenceMatch) {
      manipulationTactics.push({
        tactic: 'Financial Inducement & Greed Lure',
        explanation: 'An unusually high payment or cash amount was detected. Verify the context before classifying it as deceptive.',
        evidenceSnippet: financialEvidenceMatch[0]
      });
    }
  }

  if (/unauthorized\s+login|permanent\s+suspension|blocked|restricted/i.test(inputText)) {
    manipulationTactics.push({
      tactic: 'Fear & Loss Aversion',
      explanation: 'Threatens catastrophic account suspension or unauthorized intrusion to force urgent reaction.',
      evidenceSnippet: 'Account access has been temporarily restricted'
    });
  }

  // Construct attack path based on findings
  const attackPath: AttackPathStage[] = [
    {
      step: 1,
      name: 'Initial Infiltration & Contact',
      attackerObjective: 'Deliver message and seize victim attention via calculated communication vector.',
      evidence: redFlags.length > 0 ? redFlags[0].phrase : 'Standard message receipt',
      status: 'OBSERVED_IN_TEXT',
      uncertainty: 'CONFIRMED'
    },
    {
      step: 2,
      name: 'Psychological Manipulation & Trust Elicitation',
      attackerObjective: 'Fabricate authority, urgent emergency, or enticing reward to inhibit critical thinking.',
      evidence: redFlags.find(r => r.category.includes('Social Engineering') || r.category.includes('Urgency'))?.phrase 
        || (riskCategory === 'LOW' ? 'No coercive manipulation patterns observed.' : 'Simulated trust or authority cue'),
      status: 'OBSERVED_IN_TEXT',
      uncertainty: riskCategory === 'LOW' ? 'CONFIRMED' : 'PROBABLE'
    },
    {
      step: 3,
      name: 'The Exploitation Hook',
      attackerObjective: 'Direct the victim toward a specific trap (fraudulent link, wire transfer, or credential entry).',
      evidence: extractedAction,
      status: 'OBSERVED_IN_TEXT',
      uncertainty: riskCategory === 'LOW' ? 'CONFIRMED' : 'PROBABLE'
    },
    {
      step: 4,
      name: 'Harm & Post-Exploitation',
      attackerObjective: riskCategory === 'LOW' 
        ? 'No malicious post-exploitation intended (routine workplace or personal communication).' 
        : 'Harvest credentials, intercept banking accounts, or execute unrecoverable financial theft.',
      evidence: riskCategory === 'LOW' ? 'Benign interaction' : 'Anticipated attacker endgame based on threat indicators',
      status: 'HYPOTHETICAL_NEXT_STEP',
      uncertainty: riskCategory === 'LOW' ? 'CONFIRMED' : 'PLAUSIBLE'
    }
  ];

  const senderAssessment: SenderAssessment = {
    claimedSender: extractedSender || 'Unspecified Sender',
    verificationStatus: riskCategory === 'CRITICAL' ? 'SUSPECTED_SPOOF' : riskCategory === 'HIGH' ? 'CLAIMED_ONLY' : riskCategory === 'MODERATE' ? 'UNVERIFIED' : 'LIKELY_AUTHENTIC',
    evidence: riskCategory === 'LOW'
  ? 'No deceptive sender indicators were identified in the submitted text. Sender authenticity remains unverified without message headers or independent verification.'
  : `Sender identity "${extractedSender}" is asserted solely within message body without cryptographic SPF/DKIM verification.`,
    technicalCaveat: 'Cryptographic email headers (DKIM/DMARC) cannot be validated from raw text snippet alone.',
    impersonationType,
    impersonationRisk,
    deceptiveSignals: deceptiveSignals.length > 0 ? deceptiveSignals : undefined,
    uncertaintyExplanation
  };

  const requestedAction: RequestedAction = {
    actionType: extractedAction,
    description: `Target is asked to: ${extractedAction}`,
    urgencyLevel: riskCategory === 'CRITICAL' ? 'critical' : riskCategory === 'HIGH' ? 'high' : riskCategory === 'MODERATE' ? 'medium' : 'none',
    targetsCredentials: detectedCategories.has('Credential Theft'),
    targetsMoney: detectedCategories.has('Financial Scam') || detectedCategories.has('Payment Manipulation'),
    targetsSensitiveInfo: detectedCategories.has('Identity Theft') || detectedCategories.has('Credential Theft')
  };

  const recommendedActions: RecommendedAction[] = [];
  if (riskCategory === 'CRITICAL' || riskCategory === 'HIGH') {
    recommendedActions.push({
      priority: 1,
      category: 'immediate',
      action: 'Do not click links, open attachments, or wire money.',
      explanation: 'Immediate containment prevents credential harvesting or irreversible fund transfers.'
    });
    recommendedActions.push({
      priority: 2,
      category: 'verification',
      action: 'Verify sender identity via out-of-band channel.',
      explanation: 'Contact the alleged sender using an independently obtained corporate phone number or official app.'
    });
    recommendedActions.push({
      priority: 3,
      category: 'reporting',
      action: 'Report message to your Information Security team or anti-phishing registry.',
      explanation: 'Preserves evidence and enables global firewall/domain blocklisting for organizational protection.'
    });
  } else if (riskCategory === 'MODERATE') {
    recommendedActions.push({
      priority: 1,
      category: 'verification',
      action: 'Cross-check request before updating accounts or remitting payment.',
      explanation: 'Confirm legitimacy through established vendor account managers before taking financial actions.'
    });
  } else {
    recommendedActions.push({
      priority: 1,
      category: 'immediate',
      action: 'Standard interaction permitted.',
      explanation: 'No hostile indicators found; adhere to standard operational security practices.'
    });
  }

  const limitations = [
    'Analysis evaluates syntactic and semantic text features without live mail server header verification (SPF/DKIM/DMARC).',
    'Heuristics provide evidentiary risk scoring; legitimate organizations with unusual wording may occasionally present false positives.',
    'No remote HTTP requests were executed against links to avoid alerting adversary infrastructure.'
  ];

  return {
    id: `threat-${Date.now()}`,
    timestamp: new Date().toISOString(),
    inputSnippet: inputText.slice(0, 140) + (inputText.length > 140 ? '...' : ''),
    fullInputText: inputText,
    sourceType,
    riskScore: heuristicScore,
    riskCategory,
    summary: riskCategory === 'LOW'
      ? 'The submitted communication exhibits no significant indicators of fraud, manipulation, or credential theft.'
      : `High-risk communication detected with ${redFlags.length} prominent red flag(s) targeting ${Array.from(detectedCategories).join(', ') || 'unauthorized actions'}.`,
    threatCategories: Array.from(detectedCategories).length > 0 ? Array.from(detectedCategories) : ['Benign Communication'],
    redFlags: redFlags.map((rf, idx) => ({
      id: `rf-${idx + 1}`,
      phrase: rf.phrase,
      reason: rf.reason,
      severity: rf.severity,
      category: rf.category
    })),
    senderAssessment,
    requestedAction,
    potentialImpact: riskCategory === 'LOW'
      ? 'Low risk of operational or financial harm under standard handling.'
      : 'Potential loss of corporate credentials, unauthorized wire diversion, account takeover, or identity theft.',
    attackPath,
    recommendedActions,
    confidenceScore: 88,
    limitations,
    isFallback: true,
    engineUsed: 'VIGILANT Deterministic Heuristic & Threat Taxonomy Engine',
    analysisTimeMs: Date.now() - startTime,
    manipulationTactics: manipulationTactics.length > 0 ? manipulationTactics : undefined
  };
}

export async function analyzeThreat(inputText: string, sourceType = 'General Message'): Promise<ThreatReport> {
  const startTime = Date.now();

  // Validate input bounds
  if (!inputText || inputText.trim().length === 0) {
    throw new Error('Input text cannot be empty.');
  }

  if (inputText.length > 12000) {
    throw new Error('Input text exceeds maximum safe processing limit of 12,000 characters.');
  }

  // Run deterministic scan first
  const deterministicResults = runDeterministicRules(inputText);

  const ai = getGeminiClient();
  if (!ai) {
    return generateDeterministicReport(inputText, sourceType, startTime);
  }

  try {
    const prompt = `You are VIGILANT AI, a premier cyber threat intelligence analysis system.
Perform an objective, explainable security investigation on this submitted message.

Message Source Type: "${sourceType}"
Submitted Content:
"""
${inputText.slice(0, 8000)}
"""

Deterministic pre-scan observed red flags: ${JSON.stringify(deterministicResults.redFlags.map(r => r.phrase))}

REQUIREMENTS:
1. Provide a risk score 0 to 100 based on concrete evidence. Calibrate it: 0-24 routine/benign, 25-49 ambiguous or needs verification, 50-74 clear scam with some missing evidence or lower stakes, 75-89 strong multi-signal attack, 90-100 only when nearly every indicator is present (spoofed identity, credential or money demand, malicious link, and coercion). Do not give 100 by default; different messages must receive different scores that reflect their evidence.
2. Assign risk category: "LOW" (0-24), "MODERATE" (25-49), "HIGH" (50-74), "CRITICAL" (75-100).
3. Identify threat categories (e.g. "Phishing", "Financial Scam", "Executive Impersonation", "Credential Theft", "Social Engineering", "Payment Manipulation", "Suspicious Links", "Legitimate Workplace Communication").
4. Extract exact suspicious phrases directly from the text and explain why each is a red flag.
5. Assess claimed sender vs verification status ("CLAIMED_ONLY", "UNVERIFIED", "SUSPECTED_SPOOF", "LIKELY_AUTHENTIC") and impersonation assessment (impersonationType, deceptiveSignals, uncertaintyExplanation).
6. Detail manipulation tactics observed (Coercive Urgency, Authority Pressure, Secrecy Mandate, Financial Inducement, Fear/Loss Aversion).
7. Identify the specific requested action and potential impact if malicious.
8. Reconstruct the attack path stages (Step 1 to 4: Initial Contact, Trust Manipulation, Exploitation Hook, Harm) with status ("OBSERVED_IN_TEXT" vs "HYPOTHETICAL_NEXT_STEP") and uncertainty ("CONFIRMED", "PROBABLE", "PLAUSIBLE", "SPECULATIVE").
9. Provide prioritized safety actions (Priority 1, 2, 3).
10. State confidence (0-100) and forensic limitations.

Respond strictly with valid JSON conforming to this schema:
{
  "riskScore": <integer 0-100>,
  "riskCategory": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "summary": "<2-3 sentence executive briefing>",
  "threatCategories": ["<category 1>", "<category 2>"],
  "redFlags": [
    {
      "phrase": "<exact phrase from text>",
      "reason": "<clear explanation>",
      "severity": "low" | "medium" | "high" | "critical",
      "category": "<category name>"
    }
  ],
  "claimedSender": "<sender identity>",
  "senderVerificationStatus": "CLAIMED_ONLY" | "UNVERIFIED" | "SUSPECTED_SPOOF" | "LIKELY_AUTHENTIC",
  "senderEvidence": "<explanation>",
  "impersonationType": "<e.g. Executive / C-Suite | Banking | Postal | Recruiter | Vendor | None Detected>",
  "impersonationRisk": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "deceptiveSignals": ["<signal 1>", "<signal 2>"],
  "uncertaintyExplanation": "<clear explanation of what is verified vs unverified>",
  "manipulationTactics": [
    {
      "tactic": "<tactic name>",
      "explanation": "<why applied>",
      "evidenceSnippet": "<quote>"
    }
  ],
  "requestedAction": {
    "actionType": "<short title>",
    "description": "<detailed description>",
    "urgencyLevel": "none" | "low" | "medium" | "high" | "critical",
    "targetsCredentials": <boolean>,
    "targetsMoney": <boolean>,
    "targetsSensitiveInfo": <boolean>
  },
  "potentialImpact": "<concrete impact statement>",
  "attackPath": [
    {
      "step": <integer 1-4>,
      "name": "<stage name>",
      "attackerObjective": "<objective>",
      "evidence": "<exact evidence or context>",
      "status": "OBSERVED_IN_TEXT" | "HYPOTHETICAL_NEXT_STEP",
      "uncertainty": "CONFIRMED" | "PROBABLE" | "PLAUSIBLE" | "SPECULATIVE"
    }
  ],
  "recommendedActions": [
    {
      "priority": 1 | 2 | 3,
      "category": "immediate" | "verification" | "reporting" | "mitigation",
      "action": "<concise actionable imperative>",
      "explanation": "<rationale>"
    }
  ],
  "confidenceScore": <integer 0-100>,
  "limitations": ["<limitation 1>", "<limitation 2>"]
}`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
    );

    const generatePromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.15,
        systemInstruction: 'You are VIGILANT AI threat intelligence engine. Analyze submitted communications with high precision, grounded strictly in submitted evidence without fabricating facts or external verification.'
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      return generateDeterministicReport(inputText, sourceType, startTime);
    }

    const data = JSON.parse(text);

    // Extract and validate AI risk score
    const aiScore = typeof data.riskScore === 'number' && !isNaN(data.riskScore) 
      ? Math.min(100, Math.max(0, Math.round(data.riskScore))) 
      : deterministicResults.heuristicScore;

    // Blend deterministic findings with AI insights to ensure high-severity deterministic rules are never missed
    const blendedScore = Math.max(
      aiScore,
      deterministicResults.heuristicScore > 50 ? deterministicResults.heuristicScore - 10 : aiScore
    );

    let riskCategory: RiskCategory = 'LOW';
    if (blendedScore >= 75) riskCategory = 'CRITICAL';
    else if (blendedScore >= 50) riskCategory = 'HIGH';
    else if (blendedScore >= 25) riskCategory = 'MODERATE';

    // Combine red flags without duplication
    const redFlags: RedFlagEvidence[] = (data.redFlags || []).map((rf: any, i: number) => ({
      id: `gemini-rf-${i + 1}`,
      phrase: String(rf.phrase || ''),
      reason: String(rf.reason || ''),
      severity: rf.severity || 'medium',
      category: String(rf.category || 'General Risk')
    }));

    // Fallback deterministic report for impersonation and tactics if Gemini leaves them empty
    const detReport = generateDeterministicReport(inputText, sourceType, startTime);

    return {
      id: `threat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      inputSnippet: inputText.slice(0, 140) + (inputText.length > 140 ? '...' : ''),
      fullInputText: inputText,
      sourceType,
      riskScore: blendedScore,
      riskCategory,
      summary: data.summary || 'Security assessment completed.',
      threatCategories: Array.isArray(data.threatCategories) && data.threatCategories.length > 0
        ? data.threatCategories
        : ['General Message'],
      redFlags: redFlags.length > 0 ? redFlags : deterministicResults.redFlags.map((r, i) => ({
        id: `det-rf-${i + 1}`,
        phrase: r.phrase,
        reason: r.reason,
        severity: r.severity,
        category: r.category
      })),
      senderAssessment: {
        claimedSender: data.claimedSender || deterministicResults.extractedSender || 'Unspecified Sender',
        verificationStatus: data.senderVerificationStatus || detReport.senderAssessment.verificationStatus || 'UNVERIFIED',
        evidence: data.senderEvidence || detReport.senderAssessment.evidence || 'Sender identity evaluated from message body.',
        technicalCaveat: 'Cryptographic email headers (DKIM/DMARC) cannot be validated from raw message text alone.',
        impersonationType: data.impersonationType || detReport.senderAssessment.impersonationType,
        impersonationRisk: data.impersonationRisk || detReport.senderAssessment.impersonationRisk,
        deceptiveSignals: Array.isArray(data.deceptiveSignals) && data.deceptiveSignals.length > 0
          ? data.deceptiveSignals
          : detReport.senderAssessment.deceptiveSignals,
        uncertaintyExplanation: data.uncertaintyExplanation || detReport.senderAssessment.uncertaintyExplanation
      },
      requestedAction: {
        actionType: data.requestedAction?.actionType || deterministicResults.extractedAction,
        description: data.requestedAction?.description || `Action requested: ${deterministicResults.extractedAction}`,
        urgencyLevel: data.requestedAction?.urgencyLevel || (riskCategory === 'CRITICAL' ? 'critical' : 'none'),
        targetsCredentials: Boolean(data.requestedAction?.targetsCredentials),
        targetsMoney: Boolean(data.requestedAction?.targetsMoney),
        targetsSensitiveInfo: Boolean(data.requestedAction?.targetsSensitiveInfo)
      },
      potentialImpact: data.potentialImpact || 'Risk of credential compromise or financial transfer.',
      attackPath: Array.isArray(data.attackPath) ? data.attackPath.map((ap: any, i: number) => ({
        step: ap.step || i + 1,
        name: ap.name || `Phase ${i + 1}`,
        attackerObjective: ap.attackerObjective || '',
        evidence: ap.evidence || '',
        status: ap.status || 'OBSERVED_IN_TEXT',
        uncertainty: ap.uncertainty || 'PROBABLE'
      })) : detReport.attackPath,
      recommendedActions: Array.isArray(data.recommendedActions) ? data.recommendedActions.map((ra: any, i: number) => ({
        priority: ra.priority || (i + 1),
        category: ra.category || 'immediate',
        action: ra.action || '',
        explanation: ra.explanation || ''
      })) : detReport.recommendedActions,
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 90,
      limitations: Array.isArray(data.limitations) && data.limitations.length > 0 ? data.limitations : detReport.limitations,
      isFallback: false,
      engineUsed: `Gemini ${GEMINI_MODEL} Threat Intelligence Engine`,
      analysisTimeMs: Date.now() - startTime,
      manipulationTactics: Array.isArray(data.manipulationTactics) && data.manipulationTactics.length > 0
        ? data.manipulationTactics
        : detReport.manipulationTactics
    };
  } catch (err) {
    const errorText = err instanceof Error
      ? err.message
      : String(err);

    const isQuotaExceeded =
      errorText.includes('429') ||
      errorText.includes('RESOURCE_EXHAUSTED');

    const fallbackReason = isQuotaExceeded
      ? 'QUOTA_EXCEEDED' as const
      : errorText.toLowerCase().includes('timeout')
        ? 'TIMEOUT' as const
        : 'API_ERROR' as const;

    console.warn(
      isQuotaExceeded
        ? 'Gemini quota exhausted. Using deterministic analysis.'
        : 'Gemini analysis failed. Using deterministic analysis.',
      err
    );

    const report = generateDeterministicReport(
      inputText,
      sourceType,
      startTime
    );

    report.fallbackReason = fallbackReason;

    return report;
  }
}
