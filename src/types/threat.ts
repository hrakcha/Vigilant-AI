/**
 * Types and interfaces for VIGILANT AI Threat Intelligence Platform
 */

export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type VerificationStatus =
  | 'CLAIMED_ONLY'
  | 'UNVERIFIED'
  | 'SUSPECTED_SPOOF'
  | 'LIKELY_AUTHENTIC';

export type AgentVerdict = 'ALLOW' | 'REVIEW' | 'BLOCK';

export type KillChainUncertainty = 'CONFIRMED' | 'PROBABLE' | 'PLAUSIBLE' | 'SPECULATIVE';

export type KillChainStageStatus = 'OBSERVED_IN_TEXT' | 'HYPOTHETICAL_NEXT_STEP';

export interface RedFlagEvidence {
  id: string;
  phrase: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

export interface AttackPathStage {
  step: number;
  name: string;
  attackerObjective: string;
  evidence: string;
  status: KillChainStageStatus;
  uncertainty: KillChainUncertainty;
}

export interface ManipulationTactic {
  tactic: string;
  explanation: string;
  evidenceSnippet?: string;
}

export interface SenderAssessment {
  claimedSender: string;
  verificationStatus: VerificationStatus;
  evidence: string;
  technicalCaveat: string;
  impersonationType?: string;
  impersonationRisk?: RiskCategory;
  deceptiveSignals?: string[];
  uncertaintyExplanation?: string;
}

export interface RequestedAction {
  actionType: string;
  description: string;
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  targetsCredentials: boolean;
  targetsMoney: boolean;
  targetsSensitiveInfo: boolean;
}

export interface RecommendedAction {
  priority: 1 | 2 | 3;
  category: 'immediate' | 'verification' | 'reporting' | 'mitigation';
  action: string;
  explanation: string;
}

export interface ThreatReport {
  id: string;
  timestamp: string;
  inputSnippet: string;
  fullInputText: string;
  sourceType: string;
  riskScore: number;
  riskCategory: RiskCategory;
  summary: string;
  threatCategories: string[];
  redFlags: RedFlagEvidence[];
  senderAssessment: SenderAssessment;
  requestedAction: RequestedAction;
  potentialImpact: string;
  attackPath: AttackPathStage[];
  recommendedActions: RecommendedAction[];
  confidenceScore: number;
  limitations: string[];
  
  isFallback: boolean;
  engineUsed: string;
  fallbackReason?: 'QUOTA_EXCEEDED' | 'API_ERROR' | 'TIMEOUT';
   analysisTimeMs: number;
  manipulationTactics?: ManipulationTactic[];
}

export interface AgentInjectionFinding {
  id: string;
  textSegment: string;
  category:
    | 'System Prompt Override'
    | 'Instruction Ignore / Jailbreak'
    | 'Secret / Credential Extraction'
    | 'Unauthorized Tool Execution'
    | 'Data Exfiltration'
    | 'Obfuscation / Encoding'
    | 'Harmless Quoted Text / Discussion';
  dangerExplanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  recommendation: string;
}

export interface AgentSecurityReport {
  id: string;
  timestamp: string;
  inputText: string;
  verdict: AgentVerdict;
  injectionConfidence: number;
  primaryRisk: string;
  summary: string;
  findings: AgentInjectionFinding[];
  simulatedAgentWorkflow: {
    targetSystem: string;
    decision: 'ALLOW_PAYLOAD' | 'REQUIRE_HUMAN_CONFIRMATION' | 'TERMINATE_EXECUTION';
    blockedActionName?: string;
    interceptPoint: string;
    mitigationApplied: string;
  };
  limitations: string[];
  isFallback: boolean;
  engineUsed: string;
}

export interface UrlInspectionResult {
  url: string;
  parsedHost: string;
  protocol: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  findings: string[];
  isIpAddress: boolean;
  hasSuspiciousTld: boolean;
  hasMisleadingSubdomain: boolean;
  hasAuthCredentials: boolean;
  isShortener: boolean;
  disclaimer: string;
}

export interface DemoCase {
  id: string;
  title: string;
  category: string;
  description: string;
  sourceType: string;
  sampleText: string;
  expectedVerdict: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'BLOCK' | 'ALLOW';
  targetType: 'message' | 'agent';
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedRedFlags?: string[];
}
