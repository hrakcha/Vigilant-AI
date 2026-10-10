import { UrlInspectionResult } from '../types/threat';

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'link', 'country', 'kim', 'gq', 'ml', 'cf', 'ga', 'tk', 'buzz', 'fit', 'rest'
]);

const BRAND_TARGETS = [
  'chase', 'bankofamerica', 'wellsfargo', 'paypal', 'apple', 'microsoft', 'google', 
  'usps', 'fedex', 'dhl', 'amazon', 'netflix', 'coinbase', 'binance', 'irs'
];

export function inspectUrlSafely(rawUrl: string): UrlInspectionResult {
  const cleanUrl = rawUrl.trim();
  const findings: string[] = [];
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let isIpAddress = false;
  let hasSuspiciousTld = false;
  let hasMisleadingSubdomain = false;
  let hasAuthCredentials = false;
  let isShortener = false;

  let parsed: URL;
  try {
    // Add protocol if missing for URL parsing
    const normalized = cleanUrl.match(/^https?:\/\//i) ? cleanUrl : `https://${cleanUrl}`;
    parsed = new URL(normalized);
  } catch {
    return {
      url: cleanUrl,
      parsedHost: 'invalid-url',
      protocol: 'unknown',
      riskLevel: 'HIGH',
      findings: ['URL syntax is malformed or invalid, often used to bypass basic perimeter filters.'],
      isIpAddress: false,
      hasSuspiciousTld: false,
      hasMisleadingSubdomain: false,
      hasAuthCredentials: false,
      isShortener: false,
      disclaimer: 'Inspection conducted offline via syntactic heuristics. No network connections were initiated.'
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.replace(':', '');

  // 1. IP address check
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(hostname)) {
    isIpAddress = true;
    findings.push(`Host is a raw numerical IP address (${hostname}), frequently used in evasion to bypass domain reputation checks.`);
    riskLevel = 'HIGH';
  }

  // 2. Auth credentials in URL (e.g. user:pass@evil.com)
  if (parsed.username || parsed.password) {
    hasAuthCredentials = true;
    findings.push('URL embeds authentication userinfo (user:pass@host) syntax, a classic obfuscation technique to disguise destination host.');
    riskLevel = 'CRITICAL';
  }

  // 3. Known URL Shorteners
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly', 'cutt.ly'];
  if (shorteners.some(s => hostname === s || hostname.endsWith(`.${s}`))) {
    isShortener = true;
    findings.push(`Domain is a URL shortening service (${hostname}), obscuring final destination.`);
    if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  // 4. Suspicious TLD check
  const domainParts = hostname.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    hasSuspiciousTld = true;
    findings.push(`Top-level domain .${tld} has a statistically high correlation with disposable threat campaigns.`);
    if (riskLevel === 'LOW' || riskLevel === 'MODERATE') riskLevel = 'HIGH';
  }

  // 5. Misleading brand keywords in subdomain or hyphens (typosquatting / brand spoofing)
  for (const brand of BRAND_TARGETS) {
    if (hostname.includes(brand)) {
      const isOfficial = hostname === `${brand}.com` || hostname.endsWith(`.${brand}.com`);
      if (!isOfficial) {
        hasMisleadingSubdomain = true;
        findings.push(`Domain contains brand identifier "${brand}" within an unofficial domain hierarchy (${hostname}), indicative of impersonation.`);
        riskLevel = 'CRITICAL';
      }
    }
  }

  // 6. Suspicious hyphens & excessive subdomains
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    findings.push(`Excessive hyphenation count (${hyphenCount}) observed in hostname; typical of deceptive lookalike infrastructure.`);
    if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  if (domainParts.length >= 5) {
    findings.push(`High subdomain depth (${domainParts.length} levels) indicates nested subdomain proxying.`);
    if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  // 7. Plain HTTP warning
  if (protocol === 'http') {
    findings.push('Uses unencrypted plaintext HTTP protocol, exposing transmitted data to eavesdropping or alteration.');
    if (riskLevel === 'LOW') riskLevel = 'MODERATE';
  }

  if (findings.length === 0) {
    findings.push('No anomalous syntactic red flags detected in host structure or URL schema.');
  }

  return {
    url: cleanUrl,
    parsedHost: hostname,
    protocol,
    riskLevel,
    findings,
    isIpAddress,
    hasSuspiciousTld,
    hasMisleadingSubdomain,
    hasAuthCredentials,
    isShortener,
    disclaimer: 'Inspection performed via offline syntactic parsing and known threat heuristics. No remote HTTP requests were made to untrusted endpoints.'
  };
}
